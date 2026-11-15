from datetime import datetime
from app.extensions import db

class ComplaintStatusHistory(db.Model):
    __tablename__ = "complaint_status_history"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    from_status = db.Column(db.String(30), nullable=True)
    to_status = db.Column(db.String(30), nullable=False)
    changed_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks = db.Column(db.Text, nullable=True)
    evidence_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    complaint = db.relationship("Complaint", back_populates="status_history")
    changed_by = db.relationship("User", foreign_keys=[changed_by_user_id])

    def to_public_dict(self):
        """Sanitized version for public view without internal actor IDs."""
        return {
            "id": self.id,
            "from_status": self.from_status,
            "to_status": self.to_status,
            "remarks": self.remarks,
            "evidence_url": self.evidence_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "from_status": self.from_status,
            "to_status": self.to_status,
            "changed_by_user_id": self.changed_by_user_id,
            "changed_by_name": self.changed_by.full_name if self.changed_by else "System",
            "changed_by_role": self.changed_by.role if self.changed_by else "system",
            "remarks": self.remarks,
            "evidence_url": self.evidence_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
