import json
from flask import request
from app.extensions import db
from app.models.audit_log import AuditLog

def log_action(user_id, action, entity_type, entity_id=None, city_id=None, details=None):
    """Creates an audit log entry for sensitive administrative or lifecycle operations."""
    try:
        ip = request.remote_addr if request else None
    except Exception:
        ip = None

    details_str = None
    if details is not None:
        try:
            details_str = json.dumps(details)
        except Exception:
            details_str = str(details)

    log = AuditLog(
        user_id=user_id,
        city_id=city_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        details=details_str,
        ip_address=ip,
    )
    db.session.add(log)
    return log
