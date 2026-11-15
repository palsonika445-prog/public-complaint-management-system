from datetime import datetime
from app.extensions import db

class ComplaintCategory(db.Model):
    __tablename__ = "complaint_categories"

    id = db.Column(db.Integer, primary_key=True)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id", ondelete="CASCADE"), nullable=True, index=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(50), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(50), default="alert-circle", nullable=False)
    default_department_code = db.Column(db.String(30), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    city = db.relationship("City", back_populates="categories")
    complaints = db.relationship("Complaint", back_populates="category", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "city_id": self.city_id,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "icon": self.icon,
            "default_department_code": self.default_department_code,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
