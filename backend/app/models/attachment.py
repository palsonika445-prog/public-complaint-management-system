from datetime import datetime
from app.extensions import db

class ComplaintAttachment(db.Model):
    __tablename__ = "complaint_attachments"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = db.Column(db.String(255), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # in bytes
    file_type = db.Column(db.String(100), nullable=False)
    is_resolution_evidence = db.Column(db.Boolean, default=False, nullable=False)
    uploaded_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_public = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    complaint = db.relationship("Complaint", back_populates="attachments")
    uploaded_by = db.relationship("User", foreign_keys=[uploaded_by_user_id])

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "file_name": self.file_name,
            "original_name": self.original_name,
            "file_size": self.file_size,
            "file_type": self.file_type,
            "is_resolution_evidence": self.is_resolution_evidence,
            "is_public": self.is_public,
            "download_url": f"/api/complaints/{self.complaint_id}/attachments/{self.id}/download",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
