from app.extensions import db
from app.models.notification import Notification
from app.models.user import User

def create_notification(user_id, title, message, notification_type="general", complaint_id=None):
    """Creates a new in-app notification for a given user"""
    if not user_id:
        return None
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        complaint_id=complaint_id,
        is_read=False,
    )
    db.session.add(notification)
    return notification


def notify_complaint_event(event_type, complaint, actor=None, details=None):
    """
    Dispatches notifications to relevant parties based on complaint lifecycle event.
    Events:
    - 'registered': Notify submitter and city admins
    - 'assigned': Notify assigned staff and submitter
    - 'status_changed': Notify submitter and assigned staff
    - 'resolved': Notify submitter
    - 'rejected': Notify submitter
    - 'reopened': Notify city admin & assigned staff
    - 'escalated': Notify city admin & department head
    """
    notifications = []
    
    # 1. Citizen notification (if registered user)
    if complaint.citizen_id:
        if event_type == "registered":
            n = create_notification(
                user_id=complaint.citizen_id,
                title="Complaint Registered",
                message=f"Your complaint '{complaint.title}' has been registered with ID {complaint.complaint_number}.",
                notification_type="complaint_registered",
                complaint_id=complaint.id
            )
            notifications.append(n)
        elif event_type == "assigned":
            dept_name = complaint.assigned_department.name if complaint.assigned_department else "Department"
            n = create_notification(
                user_id=complaint.citizen_id,
                title="Complaint Assigned",
                message=f"Complaint {complaint.complaint_number} has been assigned to {dept_name}.",
                notification_type="complaint_assigned",
                complaint_id=complaint.id
            )
            notifications.append(n)
        elif event_type == "status_changed":
            n = create_notification(
                user_id=complaint.citizen_id,
                title="Status Updated",
                message=f"Complaint {complaint.complaint_number} is now '{complaint.status.replace('_', ' ').title()}'.",
                notification_type="status_changed",
                complaint_id=complaint.id
            )
            notifications.append(n)
        elif event_type == "resolved":
            n = create_notification(
                user_id=complaint.citizen_id,
                title="Complaint Resolved",
                message=f"Complaint {complaint.complaint_number} has been resolved! Please share your feedback or reopen if unsatisfied.",
                notification_type="complaint_resolved",
                complaint_id=complaint.id
            )
            notifications.append(n)
        elif event_type == "rejected":
            n = create_notification(
                user_id=complaint.citizen_id,
                title="Complaint Rejected",
                message=f"Complaint {complaint.complaint_number} was rejected. Reason: {complaint.rejection_reason or 'No reason provided'}",
                notification_type="complaint_rejected",
                complaint_id=complaint.id
            )
            notifications.append(n)

    # 2. Staff notification
    if complaint.assigned_staff_id and event_type == "assigned":
        n = create_notification(
            user_id=complaint.assigned_staff_id,
            title="New Assignment",
            message=f"You have been assigned complaint {complaint.complaint_number}: '{complaint.title}' (Priority: {complaint.priority.upper()}).",
            notification_type="staff_assigned",
            complaint_id=complaint.id
        )
        notifications.append(n)
        
    # 3. City Admin notifications for critical events
    if event_type in ["registered", "reopened", "escalated"]:
        city_admins = User.query.filter_by(city_id=complaint.city_id, role="city_admin", is_active=True).all()
        for admin in city_admins:
            if event_type == "registered" and complaint.priority == "critical":
                n = create_notification(
                    user_id=admin.id,
                    title="Critical Complaint Registered",
                    message=f"CRITICAL: New complaint {complaint.complaint_number} in {complaint.city.name} needs immediate attention.",
                    notification_type="complaint_critical",
                    complaint_id=complaint.id
                )
                notifications.append(n)
            elif event_type == "reopened":
                n = create_notification(
                    user_id=admin.id,
                    title="Complaint Reopened",
                    message=f"Citizen has reopened complaint {complaint.complaint_number}.",
                    notification_type="complaint_reopened",
                    complaint_id=complaint.id
                )
                notifications.append(n)
            elif event_type == "escalated":
                n = create_notification(
                    user_id=admin.id,
                    title="SLA Overdue - Escalation Alert",
                    message=f"Escalation: Complaint {complaint.complaint_number} is overdue (Level {complaint.escalation_level}).",
                    notification_type="complaint_escalated",
                    complaint_id=complaint.id
                )
                notifications.append(n)

    return notifications
