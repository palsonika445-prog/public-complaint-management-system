import json
from datetime import datetime
from app.extensions import db

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id", ondelete="SET NULL"), nullable=True, index=True)
    action = db.Column(db.String(100), nullable=False, index=True)
    entity_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.String(50), nullable=True)
    details = db.Column(db.Text, nullable=True)  # JSON formatted payload
    ip_address = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = db.relationship("User")
    city = db.relationship("City")

    def to_dict(self):
        parsed_details = None
        if self.details:
            try:
                parsed_details = json.loads(self.details)
            except Exception:
                parsed_details = self.details
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.full_name if self.user else "System",
            "city_id": self.city_id,
            "city_name": self.city.name if self.city else None,
            "action": self.action,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "details": parsed_details,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
