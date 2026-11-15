from datetime import datetime
from app.extensions import db

class SLAPolicy(db.Model):
    __tablename__ = "sla_policies"

    id = db.Column(db.Integer, primary_key=True)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("complaint_categories.id", ondelete="CASCADE"), nullable=True, index=True)
    priority = db.Column(db.String(20), nullable=False)  # 'low', 'medium', 'high', 'critical'
    target_resolution_hours = db.Column(db.Integer, nullable=False, default=72)
    escalation_threshold_hours = db.Column(db.Integer, nullable=False, default=48)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("city_id", "category_id", "priority", name="uq_city_cat_priority_sla"),
    )

    # Relationships
    city = db.relationship("City", back_populates="sla_policies")
    category = db.relationship("ComplaintCategory")

    def to_dict(self):
        return {
            "id": self.id,
            "city_id": self.city_id,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else "All Categories",
            "priority": self.priority,
            "target_resolution_hours": self.target_resolution_hours,
            "escalation_threshold_hours": self.escalation_threshold_hours,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
