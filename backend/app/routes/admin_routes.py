from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.user import User
from app.models.city import City
from app.models.department import Department
from app.models.complaint import Complaint
from app.models.sla_policy import SLAPolicy
from app.models.escalation import EscalationEvent
from app.models.audit_log import AuditLog
from app.permissions.decorators import role_required, enforce_city_scope
from app.services.sla_service import check_and_escalate_overdue_complaints
from app.services.audit_service import log_action

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

# --- SUPER ADMIN ENDPOINTS ---

@admin_bp.route("/super/dashboard", methods=["GET"])
@role_required("super_admin")
def super_admin_dashboard():
    total_cities = City.query.count()
    active_cities = City.query.filter_by(is_active=True).count()
    total_citizens = User.query.filter_by(role="citizen").count()
    total_staff = User.query.filter_by(role="staff").count()
    total_city_admins = User.query.filter_by(role="city_admin").count()
    
    total_complaints = Complaint.query.count()
    pending_complaints = Complaint.query.filter(Complaint.status.in_(["submitted", "under_review", "assigned"])).count()
    in_progress = Complaint.query.filter_by(status="in_progress").count()
    resolved = Complaint.query.filter(Complaint.status.in_(["resolved", "closed"])).count()
    overdue = Complaint.query.filter(Complaint.is_overdue == True, Complaint.status.notin_(["resolved", "closed", "rejected"])).count()

    # City-wise comparison table
    cities = City.query.all()
    city_comparison = []
    for c in cities:
        c_total = c.complaints.count()
        c_resolved = c.complaints.filter(Complaint.status.in_(["resolved", "closed"])).count()
        c_overdue = c.complaints.filter(Complaint.is_overdue == True, Complaint.status.notin_(["resolved", "closed", "rejected"])).count()
        rate = round((c_resolved / c_total * 100), 1) if c_total > 0 else 0
        city_comparison.append({
            "id": c.id,
            "name": c.name,
            "state": c.state,
            "is_active": c.is_active,
            "total_complaints": c_total,
            "resolved_complaints": c_resolved,
            "overdue_complaints": c_overdue,
            "resolution_rate": rate,
            "departments_count": c.departments.count(),
        })

    return jsonify({
        "stats": {
            "total_cities": total_cities,
            "active_cities": active_cities,
            "total_citizens": total_citizens,
            "total_staff": total_staff,
            "total_city_admins": total_city_admins,
            "total_complaints": total_complaints,
            "pending_complaints": pending_complaints,
            "in_progress": in_progress,
            "resolved": resolved,
            "overdue": overdue,
            "global_resolution_rate": round((resolved / total_complaints * 100), 1) if total_complaints > 0 else 0,
        },
        "city_comparison": city_comparison,
    }), 200


@admin_bp.route("/super/audit-logs", methods=["GET"])
@role_required("super_admin")
def list_audit_logs():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    pagination = AuditLog.query.order_by(AuditLog.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "audit_logs": [log.to_dict() for log in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
    }), 200


@admin_bp.route("/super/users", methods=["GET"])
@role_required("super_admin")
def list_users():
    role = request.args.get("role")
    city_id = request.args.get("city_id", type=int)
    query = User.query
    if role:
        query = query.filter_by(role=role)
    if city_id:
        query = query.filter_by(city_id=city_id)
    users = query.order_by(User.created_at.desc()).all()
    return jsonify({"users": [u.to_dict(include_private=True) for u in users]}), 200


@admin_bp.route("/super/city-admins", methods=["POST"])
@role_required("super_admin")
def create_city_admin():
    data = request.get_json() or {}
    email = data.get("email", "").lower().strip()
    full_name = data.get("full_name", "").strip()
    password = data.get("password", "")
    city_id = data.get("city_id")

    if not email or not full_name or not password or not city_id:
        return jsonify({"error": "email, full_name, password, and city_id are required"}), 400

    city = City.query.get(city_id)
    if not city:
        return jsonify({"error": "City does not exist"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User with this email already exists"}), 409

    admin_user = User(
        email=email,
        full_name=full_name,
        role="city_admin",
        city_id=city.id,
        is_active=True,
    )
    admin_user.set_password(password)
    db.session.add(admin_user)
    db.session.commit()

    log_action(g.current_user.id, "create_city_admin", "User", admin_user.id, city.id, {"email": email, "city_id": city.id})
    db.session.commit()

    return jsonify({"message": "City Admin created successfully", "user": admin_user.to_dict(include_private=True)}), 201


# --- CITY ADMIN ENDPOINTS ---

@admin_bp.route("/city/dashboard", methods=["GET"])
@role_required("city_admin")
def city_admin_dashboard():
    user = g.current_user
    city_id = user.city_id
    city = City.query.get_or_404(city_id)

    query = Complaint.query.filter_by(city_id=city_id)
    total = query.count()
    pending = query.filter(Complaint.status.in_(["submitted", "under_review", "assigned"])).count()
    in_progress = query.filter_by(status="in_progress").count()
    resolved = query.filter(Complaint.status.in_(["resolved", "closed"])).count()
    overdue = query.filter(Complaint.is_overdue == True, Complaint.status.notin_(["resolved", "closed", "rejected"])).count()

    # Department breakdown
    depts = Department.query.filter_by(city_id=city_id, is_active=True).all()
    dept_stats = []
    for d in depts:
        d_total = query.filter_by(assigned_department_id=d.id).count()
        d_resolved = query.filter_by(assigned_department_id=d.id, status="resolved").count()
        d_overdue = query.filter_by(assigned_department_id=d.id, is_overdue=True).count()
        dept_stats.append({
            "id": d.id,
            "name": d.name,
            "code": d.code,
            "staff_count": d.staff_members.count(),
            "total_complaints": d_total,
            "resolved_complaints": d_resolved,
            "overdue_complaints": d_overdue,
        })

    # Recent complaints needing review
    pending_review = query.filter_by(status="submitted").order_by(Complaint.created_at.desc()).limit(5).all()

    return jsonify({
        "city": city.to_dict(),
        "stats": {
            "total_complaints": total,
            "pending": pending,
            "in_progress": in_progress,
            "resolved": resolved,
            "overdue": overdue,
            "departments_count": len(depts),
            "staff_count": User.query.filter_by(city_id=city_id, role="staff", is_active=True).count(),
        },
        "department_stats": dept_stats,
        "pending_review": [c.to_dict(include_internal=True) for c in pending_review],
    }), 200


@admin_bp.route("/city/staff", methods=["GET"])
@role_required("city_admin", "super_admin")
def list_city_staff():
    user = g.current_user
    city_id = user.city_id if user.role != "super_admin" else request.args.get("city_id", type=int)
    if not city_id:
        return jsonify({"error": "city_id is required"}), 400

    staff = User.query.filter_by(city_id=city_id, role="staff").order_by(User.full_name.asc()).all()
    return jsonify({"staff": [s.to_dict(include_private=True) for s in staff]}), 200


@admin_bp.route("/city/staff", methods=["POST"])
@role_required("city_admin", "super_admin")
def create_city_staff():
    user = g.current_user
    data = request.get_json() or {}
    city_id = user.city_id if user.role != "super_admin" else data.get("city_id")

    email = data.get("email", "").lower().strip()
    full_name = data.get("full_name", "").strip()
    password = data.get("password", "")
    department_id = data.get("department_id")
    phone = data.get("phone")

    if not email or not full_name or not password or not department_id:
        return jsonify({"error": "email, full_name, password, and department_id are required"}), 400

    dept = Department.query.get(department_id)
    if not dept or dept.city_id != city_id:
        return jsonify({"error": "Selected department is invalid for this city"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User with this email already exists"}), 409

    staff_user = User(
        email=email,
        full_name=full_name,
        role="staff",
        city_id=city_id,
        department_id=dept.id,
        phone=phone,
        is_active=True,
    )
    staff_user.set_password(password)
    db.session.add(staff_user)
    db.session.commit()

    log_action(user.id, "create_staff", "User", staff_user.id, city_id, {"email": email, "department_id": dept.id})
    db.session.commit()

    return jsonify({"message": "Staff member created successfully", "user": staff_user.to_dict(include_private=True)}), 201


@admin_bp.route("/city/sla-policies", methods=["GET"])
@role_required("city_admin", "super_admin")
def list_sla_policies():
    user = g.current_user
    city_id = user.city_id if user.role != "super_admin" else request.args.get("city_id", type=int)
    policies = SLAPolicy.query.filter_by(city_id=city_id).all()
    return jsonify({"sla_policies": [p.to_dict() for p in policies]}), 200


@admin_bp.route("/city/sla-policies", methods=["POST"])
@role_required("city_admin", "super_admin")
def upsert_sla_policy():
    user = g.current_user
    data = request.get_json() or {}
    city_id = user.city_id if user.role != "super_admin" else data.get("city_id")
    category_id = data.get("category_id")
    priority = data.get("priority", "").lower()
    target_hours = data.get("target_resolution_hours")
    escalation_hours = data.get("escalation_threshold_hours")

    if not priority or not target_hours or not escalation_hours:
        return jsonify({"error": "priority, target_resolution_hours, and escalation_threshold_hours are required"}), 400

    policy = SLAPolicy.query.filter_by(city_id=city_id, category_id=category_id, priority=priority).first()
    if not policy:
        policy = SLAPolicy(
            city_id=city_id,
            category_id=category_id,
            priority=priority,
            target_resolution_hours=target_hours,
            escalation_threshold_hours=escalation_hours,
            is_active=True,
        )
        db.session.add(policy)
    else:
        policy.target_resolution_hours = target_hours
        policy.escalation_threshold_hours = escalation_hours

    db.session.commit()
    return jsonify({"message": "SLA Policy configured successfully", "policy": policy.to_dict()}), 200


@admin_bp.route("/city/escalations", methods=["GET"])
@role_required("city_admin", "super_admin")
def list_escalations():
    user = g.current_user
    city_id = user.city_id if user.role != "super_admin" else request.args.get("city_id", type=int)
    events = EscalationEvent.query.filter_by(city_id=city_id).order_by(EscalationEvent.created_at.desc()).limit(100).all()
    return jsonify({"escalations": [e.to_dict() for e in events]}), 200


@admin_bp.route("/city/run-sla-check", methods=["POST"])
@role_required("city_admin", "super_admin")
def trigger_sla_check():
    """Manual trigger to evaluate SLA overdue complaints and escalate."""
    user = g.current_user
    city_id = user.city_id if user.role != "super_admin" else None
    count = check_and_escalate_overdue_complaints(city_id)
    return jsonify({
        "message": f"SLA check completed. {count} complaints flagged as overdue/escalated.",
        "escalated_count": count
    }), 200
