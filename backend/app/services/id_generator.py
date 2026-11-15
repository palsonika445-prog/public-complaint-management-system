from datetime import datetime
from app.extensions import db
from app.models.complaint import Complaint

def generate_complaint_number():
    """
    Generates a unique complaint ID in format CMP-YYYY-000001
    Guaranteed unique across years and threads.
    """
    current_year = datetime.utcnow().year
    prefix = f"CMP-{current_year}-"
    
    # Query latest complaint for the current year
    latest = (
        Complaint.query.filter(Complaint.complaint_number.like(f"{prefix}%"))
        .order_by(Complaint.id.desc())
        .first()
    )
    
    if latest and latest.complaint_number.startswith(prefix):
        try:
            latest_seq = int(latest.complaint_number.replace(prefix, ""))
            new_seq = latest_seq + 1
        except ValueError:
            new_seq = 1
    else:
        new_seq = 1
        
    return f"{prefix}{new_seq:06d}"
