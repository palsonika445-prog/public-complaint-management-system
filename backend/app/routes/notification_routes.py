from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.notification import Notification
from app.permissions.decorators import get_current_user

notification_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notification_bp.route("", methods=["GET"])
@jwt_required()
def list_notifications():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    notifications = (
        Notification.query.filter_by(user_id=user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()

    return jsonify({
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count,
    }), 200


@notification_bp.route("/<int:notification_id>/read", methods=["PATCH"])
@jwt_required()
def mark_read(notification_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    n = Notification.query.filter_by(id=notification_id, user_id=user.id).first_or_404()
    n.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read", "notification": n.to_dict()}), 200


@notification_bp.route("/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_read():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    Notification.query.filter_by(user_id=user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200
