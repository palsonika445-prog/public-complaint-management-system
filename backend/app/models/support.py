from datetime import datetime
from app.extensions import db

class ComplaintSupport(db.Model):
    __tablename__ = "complaint_supports"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ip_address = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("complaint_id", "user_id", name="uq_complaint_user_support"),
    )

    # Relationships
    complaint = db.relationship("Complaint", back_populates="supports")
    user = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
