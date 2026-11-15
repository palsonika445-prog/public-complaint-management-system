from flask import Blueprint, jsonify, g
from app.models.complaint import Complaint
from app.models.notification import Notification
from app.permissions.decorators import role_required

citizen_bp = Blueprint("citizen", __name__, url_prefix="/api/citizen")

@citizen_bp.route("/dashboard", methods=["GET"])
@role_required("citizen")
def citizen_dashboard():
    user = g.current_user
    base_query = Complaint.query.filter_by(citizen_id=user.id)

    total = base_query.count()
    pending = base_query.filter(Complaint.status.in_(["submitted", "under_review", "assigned"])).count()
    in_progress = base_query.filter_by(status="in_progress").count()
    resolved = base_query.filter(Complaint.status.in_(["resolved", "closed"])).count()
    rejected = base_query.filter_by(status="rejected").count()

    recent_complaints = base_query.order_by(Complaint.created_at.desc()).limit(5).all()
    recent_notifications = (
        Notification.query.filter_by(user_id=user.id)
        .order_by(Notification.created_at.desc())
        .limit(5)
        .all()
    )

    return jsonify({
        "stats": {
            "total_complaints": total,
            "pending": pending,
            "in_progress": in_progress,
            "resolved": resolved,
            "rejected": rejected,
        },
        "recent_complaints": [c.to_dict(include_internal=False) for c in recent_complaints],
        "recent_notifications": [n.to_dict() for n in recent_notifications],
    }), 200


@citizen_bp.route("/complaints", methods=["GET"])
@role_required("citizen")
def my_complaints():
    user = g.current_user
    complaints = Complaint.query.filter_by(citizen_id=user.id).order_by(Complaint.created_at.desc()).all()
    return jsonify({"complaints": [c.to_dict(include_internal=False) for c in complaints]}), 200
