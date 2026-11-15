from datetime import datetime
from app.extensions import db

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False, default="general")
    # Types: complaint_registered, complaint_assigned, status_changed, complaint_reopened, complaint_resolved, complaint_rejected, complaint_escalated, staff_assigned
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="SET NULL"), nullable=True, index=True)
    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = db.relationship("User", back_populates="notifications")
    complaint = db.relationship("Complaint")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "notification_type": self.notification_type,
            "complaint_id": self.complaint_id,
            "complaint_number": self.complaint.complaint_number if self.complaint else None,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
