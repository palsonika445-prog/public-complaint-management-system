from datetime import datetime
from app.extensions import db

class Department(db.Model):
    __tablename__ = "departments"

    id = db.Column(db.Integer, primary_key=True)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(30), nullable=False)  # e.g., PWD, SWM, WTR, ELEC, DRG, PRK
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    head_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    city = db.relationship("City", back_populates="departments")
    staff_members = db.relationship("User", foreign_keys="User.department_id", back_populates="department", lazy="dynamic")
    complaints = db.relationship("Complaint", foreign_keys="Complaint.assigned_department_id", back_populates="assigned_department", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "city_id": self.city_id,
            "city_name": self.city.name if self.city else None,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "is_active": self.is_active,
            "head_user_id": self.head_user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
