from datetime import datetime
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.complaint import Complaint
from app.models.status_history import ComplaintStatusHistory
from app.permissions.decorators import role_required
from app.services.notification_service import notify_complaint_event
from app.services.audit_service import log_action

staff_bp = Blueprint("staff", __name__, url_prefix="/api/staff")

@staff_bp.route("/dashboard", methods=["GET"])
@role_required("staff")
def staff_dashboard():
    user = g.current_user
    dept_id = user.department_id
    city_id = user.city_id

    # Complaints assigned directly to staff or to their department
    base_query = Complaint.query.filter(
        Complaint.city_id == city_id,
        (Complaint.assigned_staff_id == user.id) | (Complaint.assigned_department_id == dept_id)
    )

    total_assigned = base_query.count()
    new_assignments = base_query.filter(Complaint.status.in_(["assigned", "submitted"])).count()
    in_progress = base_query.filter_by(status="in_progress").count()
    resolved = base_query.filter_by(status="resolved").count()
    overdue = base_query.filter(Complaint.is_overdue == True, Complaint.status.notin_(["resolved", "closed", "rejected"])).count()

    # Priority breakdown
    priority_counts = {
        "critical": base_query.filter_by(priority="critical").count(),
        "high": base_query.filter_by(priority="high").count(),
        "medium": base_query.filter_by(priority="medium").count(),
        "low": base_query.filter_by(priority="low").count(),
    }

    # Recent complaints
    recent = base_query.order_by(Complaint.created_at.desc()).limit(5).all()

    return jsonify({
        "stats": {
            "total_assigned": total_assigned,
            "new_assignments": new_assignments,
            "in_progress": in_progress,
            "resolved": resolved,
            "overdue": overdue,
            "priority_distribution": priority_counts,
        },
        "recent_complaints": [c.to_dict(include_internal=True) for c in recent]
    }), 200


@staff_bp.route("/complaints", methods=["GET"])
@role_required("staff")
def list_staff_complaints():
    user = g.current_user
    status = request.args.get("status")
    priority = request.args.get("priority")
    overdue = request.args.get("overdue")

    query = Complaint.query.filter(
        Complaint.city_id == user.city_id,
        (Complaint.assigned_staff_id == user.id) | (Complaint.assigned_department_id == user.department_id)
    )

    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)
    if overdue == "true":
        query = query.filter(Complaint.is_overdue == True, Complaint.status.notin_(["resolved", "closed", "rejected"]))

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return jsonify({"complaints": [c.to_dict(include_internal=True) for c in complaints]}), 200


@staff_bp.route("/complaints/<int:complaint_id>/resolve", methods=["POST"])
@role_required("staff")
def staff_resolve_complaint(complaint_id):
    complaint = Complaint.query.get_or_404(complaint_id)
    user = g.current_user

    # Department check
    if complaint.assigned_department_id != user.department_id and complaint.assigned_staff_id != user.id:
        return jsonify({"error": "Cannot resolve a complaint outside your assigned department"}), 403

    data = request.get_json() or {}
    remarks = data.get("resolution_remarks", "").strip()
    evidence_url = data.get("evidence_url")

    if not remarks:
        return jsonify({"error": "Resolution remarks are mandatory"}), 400

    from_status = complaint.status
    complaint.status = "resolved"
    complaint.resolution_remarks = remarks
    complaint.resolved_at = datetime.utcnow()

    history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        from_status=from_status,
        to_status="resolved",
        changed_by_user_id=user.id,
        remarks=remarks,
        evidence_url=evidence_url,
    )
    db.session.add(history)
    db.session.commit()

    notify_complaint_event("resolved", complaint, actor=user)
    db.session.commit()

    log_action(user.id, "staff_resolve", "Complaint", complaint.id, complaint.city_id, {
        "remarks": remarks,
        "evidence_url": evidence_url,
    })
    db.session.commit()

    return jsonify({
        "message": "Complaint marked as resolved successfully",
        "complaint": complaint.to_dict(include_internal=True)
    }), 200
