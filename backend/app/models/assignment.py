from datetime import datetime
from app.extensions import db

class ComplaintAssignment(db.Model):
    __tablename__ = "complaint_assignments"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    staff_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    is_current = db.Column(db.Boolean, default=True, nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    complaint = db.relationship("Complaint", back_populates="assignments")
    department = db.relationship("Department")
    staff = db.relationship("User", foreign_keys=[staff_id])
    assigned_by = db.relationship("User", foreign_keys=[assigned_by_user_id])

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else None,
            "staff_id": self.staff_id,
            "staff_name": self.staff.full_name if self.staff else None,
            "assigned_by_user_id": self.assigned_by_user_id,
            "assigned_by_name": self.assigned_by.full_name if self.assigned_by else None,
            "notes": self.notes,
            "is_current": self.is_current,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
        }
