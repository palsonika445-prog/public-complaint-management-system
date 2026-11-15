import csv
import io
from datetime import datetime
from flask import Blueprint, request, jsonify, Response, g
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.category import ComplaintCategory
from app.permissions.decorators import role_required, enforce_city_scope

report_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

@report_bp.route("/analytics", methods=["GET"])
@role_required("city_admin", "super_admin")
def get_analytics():
    user = g.current_user
    city_id = request.args.get("city_id", type=int)

    if user.role != "super_admin":
        city_id = user.city_id
    elif not city_id and user.role == "super_admin":
        # Global platform analytics
        pass

    query = Complaint.query
    if city_id:
        query = query.filter_by(city_id=city_id)

    total = query.count()
    pending = query.filter(Complaint.status.in_(["submitted", "under_review", "assigned"])).count()
    in_progress = query.filter_by(status="in_progress").count()
    resolved = query.filter(Complaint.status.in_(["resolved", "closed"])).count()
    rejected = query.filter_by(status="rejected").count()
    overdue = query.filter(Complaint.is_overdue == True, Complaint.status.notin_(["resolved", "closed", "rejected"])).count()

    # Category distribution
    categories = ComplaintCategory.query.filter_by(is_active=True).all()
    category_data = []
    for cat in categories:
        c_count = query.filter_by(category_id=cat.id).count()
        if c_count > 0:
            category_data.append({"name": cat.name, "count": c_count, "code": cat.code})

    # Department distribution
    dept_query = Department.query.filter_by(is_active=True)
    if city_id:
        dept_query = dept_query.filter_by(city_id=city_id)
    departments = dept_query.all()
    department_data = []
    for dept in departments:
        d_count = query.filter_by(assigned_department_id=dept.id).count()
        d_resolved = query.filter_by(assigned_department_id=dept.id, status="resolved").count()
        department_data.append({
            "name": dept.name,
            "code": dept.code,
            "total": d_count,
            "resolved": d_resolved,
        })

    # Priority distribution
    priority_data = [
        {"name": "Critical", "count": query.filter_by(priority="critical").count(), "color": "#ef4444"},
        {"name": "High", "count": query.filter_by(priority="high").count(), "color": "#f97316"},
        {"name": "Medium", "count": query.filter_by(priority="medium").count(), "color": "#eab308"},
        {"name": "Low", "count": query.filter_by(priority="low").count(), "color": "#10b981"},
    ]

    return jsonify({
        "summary": {
            "total": total,
            "pending": pending,
            "in_progress": in_progress,
            "resolved": resolved,
            "rejected": rejected,
            "overdue": overdue,
            "resolution_rate": round((resolved / total * 100), 1) if total > 0 else 0,
        },
        "by_category": category_data,
        "by_department": department_data,
        "by_priority": priority_data,
    }), 200


@report_bp.route("/export-csv", methods=["GET"])
@role_required("city_admin", "super_admin")
def export_csv():
    user = g.current_user
    city_id = request.args.get("city_id", type=int)

    if user.role != "super_admin":
        city_id = user.city_id
    elif city_id:
        allowed, err_msg = enforce_city_scope(city_id)
        if not allowed:
            return jsonify({"error": err_msg}), 403

    query = Complaint.query
    if city_id:
        query = query.filter_by(city_id=city_id)

    # Filters
    status = request.args.get("status")
    category_id = request.args.get("category_id", type=int)
    department_id = request.args.get("department_id", type=int)
    is_overdue = request.args.get("is_overdue")

    if status:
        query = query.filter_by(status=status)
    if category_id:
        query = query.filter_by(category_id=category_id)
    if department_id:
        query = query.filter_by(assigned_department_id=department_id)
    if is_overdue == "true":
        query = query.filter_by(is_overdue=True)

    complaints = query.order_by(Complaint.created_at.desc()).all()

    # Generate CSV stream
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Complaint ID", "Title", "City", "Category", "Priority", "Status",
        "Assigned Department", "Assigned Staff", "Address", "Landmark",
        "SLA Target (Hours)", "Is Overdue", "Created At", "Resolved At"
    ])

    for c in complaints:
        writer.writerow([
            c.complaint_number,
            c.title,
            c.city.name if c.city else "",
            c.category.name if c.category else "",
            c.priority.upper(),
            c.status.upper(),
            c.assigned_department.name if c.assigned_department else "Unassigned",
            c.assigned_staff.full_name if c.assigned_staff else "Unassigned",
            c.address or "",
            c.landmark or "",
            c.sla_target_hours,
            "YES" if c.is_overdue else "NO",
            c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else "",
            c.resolved_at.strftime("%Y-%m-%d %H:%M:%S") if c.resolved_at else "",
        ])

    csv_data = output.getvalue()
    filename = f"PCMS_Report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
