from datetime import datetime
from app.extensions import db

class EscalationEvent(db.Model):
    __tablename__ = "escalation_events"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = db.Column(db.String(255), nullable=False)
    level = db.Column(db.Integer, default=1, nullable=False)  # 1: Dept Head, 2: City Admin, 3: Municipal Commissioner
    escalated_to_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notified_users = db.Column(db.Text, nullable=True)  # JSON or comma-separated emails
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    complaint = db.relationship("Complaint")
    city = db.relationship("City")
    escalated_to = db.relationship("User", foreign_keys=[escalated_to_user_id])

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "complaint_number": self.complaint.complaint_number if self.complaint else None,
            "city_id": self.city_id,
            "reason": self.reason,
            "level": self.level,
            "escalated_to_user_id": self.escalated_to_user_id,
            "escalated_to_name": self.escalated_to.full_name if self.escalated_to else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
