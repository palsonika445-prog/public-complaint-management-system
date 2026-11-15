from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.extensions import db
from app.models.user import User
from app.models.city import City
from app.schemas.auth_schema import RegisterSchema, LoginSchema, PasswordResetRequestSchema, PasswordResetConfirmSchema
from app.permissions.decorators import get_current_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

register_schema = RegisterSchema()
login_schema = LoginSchema()
reset_req_schema = PasswordResetRequestSchema()
reset_conf_schema = PasswordResetConfirmSchema()

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    try:
        validated = register_schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    if User.query.filter_by(email=validated["email"].lower().strip()).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    if validated.get("city_id"):
        city = City.query.get(validated["city_id"])
        if not city:
            return jsonify({"error": "Selected city does not exist"}), 400

    user = User(
        email=validated["email"].lower().strip(),
        full_name=validated["full_name"].strip(),
        phone=validated.get("phone"),
        role="citizen",
        city_id=validated.get("city_id"),
        preferred_language=validated.get("preferred_language", "en"),
        is_active=True,
    )
    user.set_password(validated["password"])
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Registration successful",
        "access_token": access_token,
        "user": user.to_dict(include_private=True),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    try:
        validated = login_schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    user = User.query.filter_by(email=validated["email"].lower().strip()).first()
    if not user or not user.check_password(validated["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Account is deactivated. Please contact support."}), 403

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict(include_private=True),
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict(include_private=True)}), 200


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    if "full_name" in data and data["full_name"].strip():
        user.full_name = data["full_name"].strip()
    if "phone" in data:
        user.phone = data["phone"]
    if "preferred_language" in data and data["preferred_language"] in ["en", "hi"]:
        user.preferred_language = data["preferred_language"]
    if "city_id" in data and user.role == "citizen":
        user.city_id = data["city_id"]

    db.session.commit()
    return jsonify({
        "message": "Profile updated successfully",
        "user": user.to_dict(include_private=True)
    }), 200


@auth_bp.route("/password-reset-request", methods=["POST"])
def password_reset_request():
    data = request.get_json() or {}
    try:
        validated = reset_req_schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    user = User.query.filter_by(email=validated["email"].lower().strip()).first()
    # In a local/demo environment, we provide a reset token in response so local users can complete password reset without SMTP
    if user:
        # Create deterministic or short token for reset
        reset_token = f"reset-{user.id}-token-2026"
        return jsonify({
            "message": "Password reset instructions processed. If email exists, use the reset token to complete.",
            "demo_reset_token": reset_token
        }), 200

    return jsonify({"message": "If the email is registered, password reset instructions have been sent."}), 200


@auth_bp.route("/password-reset-confirm", methods=["POST"])
def password_reset_confirm():
    data = request.get_json() or {}
    try:
        validated = reset_conf_schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    user = User.query.filter_by(email=validated["email"].lower().strip()).first()
    if not user:
        return jsonify({"error": "Invalid reset request"}), 400

    expected_token = f"reset-{user.id}-token-2026"
    if validated["reset_token"] != expected_token:
        return jsonify({"error": "Invalid or expired reset token"}), 400

    user.set_password(validated["new_password"])
    db.session.commit()
    return jsonify({"message": "Password has been reset successfully. You can now login with your new password."}), 200
