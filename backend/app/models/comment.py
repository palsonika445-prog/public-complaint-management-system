from datetime import datetime
from app.extensions import db

class ComplaintComment(db.Model):
    __tablename__ = "complaint_comments"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    comment = db.Column(db.Text, nullable=False)
    is_internal = db.Column(db.Boolean, default=False, nullable=False)  # If True, visible only to Staff/Admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    complaint = db.relationship("Complaint", back_populates="comments")
    author = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "user_id": self.user_id,
            "author_name": self.author.full_name if self.author else "System",
            "author_role": self.author.role if self.author else "system",
            "comment": self.comment,
            "is_internal": self.is_internal,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
