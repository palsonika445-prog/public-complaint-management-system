from datetime import datetime, timedelta
from app.extensions import db
from app.models.sla_policy import SLAPolicy
from app.models.complaint import Complaint
from app.models.escalation import EscalationEvent
from app.services.notification_service import notify_complaint_event

DEFAULT_SLA_HOURS = {
    "critical": 12,
    "high": 24,
    "medium": 72,
    "low": 120,
}

def get_target_sla_hours(city_id, category_id, priority):
    """Fetches custom SLA policy if defined, else falls back to default hours"""
    policy = SLAPolicy.query.filter_by(
        city_id=city_id,
        category_id=category_id,
        priority=priority,
        is_active=True
    ).first()
    
    if not policy:
        # Fallback to city-wide priority policy without specific category
        policy = SLAPolicy.query.filter_by(
            city_id=city_id,
            category_id=None,
            priority=priority,
            is_active=True
        ).first()
        
    if policy:
        return policy.target_resolution_hours
    return DEFAULT_SLA_HOURS.get(priority.lower(), 72)


def calculate_sla_due_date(city_id, category_id, priority, start_time=None):
    """Calculates target hours and due date for complaint"""
    if start_time is None:
        start_time = datetime.utcnow()
    hours = get_target_sla_hours(city_id, category_id, priority)
    due_at = start_time + timedelta(hours=hours)
    return hours, due_at


def check_and_escalate_overdue_complaints(city_id=None):
    """
    Scans for complaints past their SLA due date that are not yet resolved/closed.
    Marks them as overdue, creates escalation events, and dispatches notifications.
    Can be run via cron / CLI command.
    """
    now = datetime.utcnow()
    query = Complaint.query.filter(
        Complaint.status.notin_(["resolved", "rejected", "closed"]),
        Complaint.sla_due_at.isnot(None),
        Complaint.sla_due_at < now
    )
    if city_id:
        query = query.filter_by(city_id=city_id)
        
    overdue_complaints = query.all()
    escalated_count = 0
    
    for c in overdue_complaints:
        if not c.is_overdue:
            c.is_overdue = True
            c.escalation_level = 1
            c.escalated_at = now
            
            # Record escalation event
            event = EscalationEvent(
                complaint_id=c.id,
                city_id=c.city_id,
                reason=f"SLA target of {c.sla_target_hours}h exceeded.",
                level=1,
                escalated_to_user_id=c.assigned_department.head_user_id if c.assigned_department else None
            )
            db.session.add(event)
            notify_complaint_event("escalated", c)
            escalated_count += 1
            
    if escalated_count > 0:
        db.session.commit()
        
    return escalated_count
