from datetime import datetime
from app.extensions import db

class ComplaintFeedback(db.Model):
    __tablename__ = "complaint_feedback"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    remarks = db.Column(db.Text, nullable=True)
    timely_resolution = db.Column(db.Boolean, default=True, nullable=False)
    staff_behavior = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    complaint = db.relationship("Complaint", back_populates="feedback")
    citizen = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "citizen_id": self.citizen_id,
            "rating": self.rating,
            "remarks": self.remarks,
            "timely_resolution": self.timely_resolution,
            "staff_behavior": self.staff_behavior,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
