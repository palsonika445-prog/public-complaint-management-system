from datetime import datetime
from app.extensions import db

class City(db.Model):
    __tablename__ = "cities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False, index=True)
    state = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), default="India")
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    boundary_radius_km = db.Column(db.Float, default=25.0)
    contact_email = db.Column(db.String(120), nullable=True)
    helpline_number = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    departments = db.relationship("Department", back_populates="city", cascade="all, delete-orphan", lazy="dynamic")
    complaints = db.relationship("Complaint", back_populates="city", cascade="all, delete-orphan", lazy="dynamic")
    users = db.relationship("User", back_populates="city", lazy="dynamic")
    categories = db.relationship("ComplaintCategory", back_populates="city", cascade="all, delete-orphan", lazy="dynamic")
    sla_policies = db.relationship("SLAPolicy", back_populates="city", cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "state": self.state,
            "country": self.country,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "boundary_radius_km": self.boundary_radius_km,
            "contact_email": self.contact_email,
            "helpline_number": self.helpline_number,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
