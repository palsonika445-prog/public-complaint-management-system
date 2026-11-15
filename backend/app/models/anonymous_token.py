import hashlib
import secrets
from datetime import datetime
from app.extensions import db

class AnonymousTrackingCredential(db.Model):
    __tablename__ = "anonymous_tracking_credentials"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    token_hash = db.Column(db.String(255), nullable=False)
    salt = db.Column(db.String(64), nullable=False)
    access_count = db.Column(db.Integer, default=0, nullable=False)
    last_accessed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    complaint = db.relationship("Complaint", back_populates="tracking_credential")

    @classmethod
    def create_credential(cls, complaint_id):
        """Generates a secure tracking token, returns (credential_record, raw_plain_token)"""
        # Plain token is 32 random characters (alphanumeric)
        raw_token = secrets.token_urlsafe(24)
        salt = secrets.token_hex(16)
        token_hash = hashlib.sha256((raw_token + salt).encode("utf-8")).hexdigest()
        
        credential = cls(
            complaint_id=complaint_id,
            token_hash=token_hash,
            salt=salt,
        )
        return credential, raw_token

    def verify_token(self, raw_token):
        computed_hash = hashlib.sha256((raw_token + self.salt).encode("utf-8")).hexdigest()
        return secrets.compare_digest(computed_hash, self.token_hash)
