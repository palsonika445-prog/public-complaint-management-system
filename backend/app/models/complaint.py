import math
from datetime import datetime
from app.extensions import db

class Complaint(db.Model):
    __tablename__ = "complaints"

    id = db.Column(db.Integer, primary_key=True)
    complaint_number = db.Column(db.String(30), unique=True, nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("complaint_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    subcategory = db.Column(db.String(100), nullable=True)
    city_id = db.Column(db.Integer, db.ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    citizen_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    is_anonymous = db.Column(db.Boolean, default=False, nullable=False)
    
    priority = db.Column(db.String(20), default="medium", nullable=False)  # low, medium, high, critical
    status = db.Column(db.String(30), default="submitted", nullable=False, index=True)
    # Statuses: submitted, under_review, assigned, in_progress, resolved, reopened, rejected, closed
    visibility = db.Column(db.String(20), default="public", nullable=False)  # public, private
    
    # Exact coordinates
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(255), nullable=True)
    landmark = db.Column(db.String(255), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    
    # Deduplication
    is_duplicate = db.Column(db.Boolean, default=False, nullable=False)
    parent_complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="SET NULL"), nullable=True)
    
    # Assignment
    assigned_department_id = db.Column(db.Integer, db.ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_staff_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # SLA & Escalation
    sla_target_hours = db.Column(db.Integer, default=72, nullable=False)
    sla_due_at = db.Column(db.DateTime, nullable=True)
    is_overdue = db.Column(db.Boolean, default=False, nullable=False, index=True)
    escalated_at = db.Column(db.DateTime, nullable=True)
    escalation_level = db.Column(db.Integer, default=0, nullable=False)
    
    # Closure / Remarks
    rejection_reason = db.Column(db.Text, nullable=True)
    resolution_remarks = db.Column(db.Text, nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)
    closed_at = db.Column(db.DateTime, nullable=True)
    reopened_at = db.Column(db.DateTime, nullable=True)
    
    support_count = db.Column(db.Integer, default=0, nullable=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    city = db.relationship("City", back_populates="complaints")
    category = db.relationship("ComplaintCategory", back_populates="complaints")
    citizen = db.relationship("User", foreign_keys=[citizen_id], back_populates="submitted_complaints")
    assigned_department = db.relationship("Department", foreign_keys=[assigned_department_id], back_populates="complaints")
    assigned_staff = db.relationship("User", foreign_keys=[assigned_staff_id], back_populates="assigned_complaints")
    
    assignments = db.relationship("ComplaintAssignment", back_populates="complaint", cascade="all, delete-orphan", lazy="dynamic", order_by="ComplaintAssignment.assigned_at.desc()")
    status_history = db.relationship("ComplaintStatusHistory", back_populates="complaint", cascade="all, delete-orphan", lazy="dynamic", order_by="ComplaintStatusHistory.created_at.asc()")
    attachments = db.relationship("ComplaintAttachment", back_populates="complaint", cascade="all, delete-orphan", lazy="dynamic")
    comments = db.relationship("ComplaintComment", back_populates="complaint", cascade="all, delete-orphan", lazy="dynamic", order_by="ComplaintComment.created_at.asc()")
    supports = db.relationship("ComplaintSupport", back_populates="complaint", cascade="all, delete-orphan", lazy="dynamic")
    feedback = db.relationship("ComplaintFeedback", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    tracking_credential = db.relationship("AnonymousTrackingCredential", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    duplicates = db.relationship("Complaint", backref=db.backref("parent_complaint", remote_side=[id]), lazy="dynamic")

    def to_public_dict(self):
        """Sanitized public view: hides private submitter details and fuzzes location."""
        # Fuzz coordinates to ~2 decimals (approx 1.1km) or 3 decimals (~110m) to preserve privacy
        fuzzed_lat = round(self.latitude, 3)
        fuzzed_lng = round(self.longitude, 3)
        return {
            "id": self.id,
            "complaint_number": self.complaint_number,
            "title": self.title,
            "description": self.description,
            "category_name": self.category.name if self.category else None,
            "category_code": self.category.code if self.category else None,
            "subcategory": self.subcategory,
            "city_id": self.city_id,
            "city_name": self.city.name if self.city else None,
            "citizen_is_aadhaar_verified": bool(self.citizen and self.citizen.is_aadhaar_verified) if not self.is_anonymous else False,
            "priority": self.priority,
            "status": self.status,
            "latitude": fuzzed_lat,
            "longitude": fuzzed_lng,
            "landmark": self.landmark,
            "support_count": self.support_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "public_attachments": [
                att.to_dict() for att in self.attachments.filter_by(is_public=True).all()
            ],
            "timeline": [
                hist.to_public_dict() for hist in self.status_history.all()
            ],
        }

    def to_dict(self, include_internal=False):
        """Full details for authorized actors (submitter, assigned staff, admins)."""
        data = {
            "id": self.id,
            "complaint_number": self.complaint_number,
            "title": self.title,
            "description": self.description,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "category_code": self.category.code if self.category else None,
            "subcategory": self.subcategory,
            "city_id": self.city_id,
            "city_name": self.city.name if self.city else None,
            "citizen_id": self.citizen_id,
            "citizen_name": self.citizen.full_name if self.citizen else ("Anonymous" if self.is_anonymous else "Unknown"),
            "citizen_is_aadhaar_verified": bool(self.citizen and self.citizen.is_aadhaar_verified),
            "citizen_aadhaar_last4": self.citizen.aadhaar_last4 if (self.citizen and self.citizen.is_aadhaar_verified) else None,
            "citizen_trust_score": 98 if (self.citizen and self.citizen.is_aadhaar_verified) else (85 if self.citizen else 50),
            "is_anonymous": self.is_anonymous,
            "priority": self.priority,
            "status": self.status,
            "visibility": self.visibility,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "address": self.address,
            "landmark": self.landmark,
            "state": self.state,
            "is_duplicate": self.is_duplicate,
            "parent_complaint_id": self.parent_complaint_id,
            "assigned_department_id": self.assigned_department_id,
            "assigned_department_name": self.assigned_department.name if self.assigned_department else None,
            "assigned_staff_id": self.assigned_staff_id,
            "assigned_staff_name": self.assigned_staff.full_name if self.assigned_staff else None,
            "sla_target_hours": self.sla_target_hours,
            "sla_due_at": self.sla_due_at.isoformat() if self.sla_due_at else None,
            "is_overdue": self.is_overdue,
            "escalated_at": self.escalated_at.isoformat() if self.escalated_at else None,
            "escalation_level": self.escalation_level,
            "rejection_reason": self.rejection_reason,
            "resolution_remarks": self.resolution_remarks,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,
            "reopened_at": self.reopened_at.isoformat() if self.reopened_at else None,
            "support_count": self.support_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "attachments": [att.to_dict() for att in self.attachments.all()],
            "status_history": [sh.to_dict() for sh in self.status_history.all()],
            "feedback": self.feedback.to_dict() if self.feedback else None,
        }
        if include_internal:
            data["comments"] = [c.to_dict() for c in self.comments.all()]
        else:
            data["comments"] = [c.to_dict() for c in self.comments.filter_by(is_internal=False).all()]
        return data
