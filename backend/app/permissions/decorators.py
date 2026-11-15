from functools import wraps
from flask import jsonify, request, g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User

def get_current_user():
    """Helper to fetch the authenticated User model instance"""
    identity = get_jwt_identity()
    if not identity:
        return None
    try:
        user_id = int(identity)
        return User.query.get(user_id)
    except (ValueError, TypeError):
        return None


def role_required(*allowed_roles):
    """
    Decorator to enforce role-based access control.
    e.g. @role_required('super_admin') or @role_required('city_admin', 'super_admin')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = get_current_user()
            if not user or not user.is_active:
                return jsonify({"error": "Unauthorized or inactive account"}), 401
            
            if user.role not in allowed_roles:
                return jsonify({
                    "error": "Forbidden: insufficient permissions",
                    "required_roles": list(allowed_roles),
                    "current_role": user.role
                }), 403
            
            g.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def enforce_city_scope(city_id):
    """
    Validates that the current user has authority over the given city_id.
    Super Admins can access any city.
    City Admins and Staff can only access their assigned city.
    """
    user = getattr(g, "current_user", None) or get_current_user()
    if not user:
        return False, "Authentication required"
    
    if user.role == "super_admin":
        return True, None
    
    if user.city_id != int(city_id):
        return False, f"Access denied: you do not have permission for City ID {city_id}"
        
    return True, None
