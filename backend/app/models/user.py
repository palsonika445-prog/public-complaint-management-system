from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(20), nullable=False, default="citizen", index=True)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    preferred_language = db.Column(db.String(5), default="en", nullable=False)  # 'en' or 'hi'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # DigiLocker / Aadhaar e-KYC Verification
    is_aadhaar_verified = db.Column(db.Boolean, default=False, nullable=False)
    aadhaar_last4 = db.Column(db.String(4), nullable=True)
    kyc_verified_at = db.Column(db.DateTime, nullable=True)
    kyc_document_type = db.Column(db.String(30), default=None, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    city = db.relationship("City", back_populates="users")
    department = db.relationship("Department", foreign_keys=[department_id], back_populates="staff_members")
    submitted_complaints = db.relationship("Complaint", foreign_keys="Complaint.citizen_id", back_populates="citizen", lazy="dynamic")
    assigned_complaints = db.relationship("Complaint", foreign_keys="Complaint.assigned_staff_id", back_populates="assigned_staff", lazy="dynamic")
    notifications = db.relationship("Notification", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_private=False):
        data = {
            "id": self.id,
            "email": self.email if include_private else None,
            "full_name": self.full_name,
            "role": self.role,
            "city_id": self.city_id,
            "city_name": self.city.name if self.city else None,
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else None,
            "preferred_language": self.preferred_language,
            "is_active": self.is_active,
            "is_aadhaar_verified": self.is_aadhaar_verified,
            "aadhaar_last4": self.aadhaar_last4,
            "kyc_verified_at": self.kyc_verified_at.isoformat() if self.kyc_verified_at else None,
            "kyc_document_type": self.kyc_document_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_private:
            data["phone"] = self.phone
        return data
