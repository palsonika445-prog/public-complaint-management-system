from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError
from datetime import datetime
import random
import time
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

# In-memory OTP storage: identifier -> {"code": "123456", "expires_at": timestamp}
OTP_STORE = {}
AADHAAR_OTP_STORE = {}



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

    email_input = validated["email"].lower().strip()
    user = User.query.filter_by(email=email_input).first()
    # Backward compatibility demo fallback: citizen.rahul maps to citizen.sonika
    if not user and email_input == "citizen.rahul@example.com":
        user = User.query.filter_by(email="citizen.sonika@example.com").first()

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


@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json() or {}
    identifier = str(data.get("identifier", "")).strip()

    if not identifier:
        return jsonify({"error": "Please provide an email or 10-digit mobile number"}), 400

    # Clean identifier
    is_email = "@" in identifier
    norm_identifier = identifier.lower() if is_email else "".join(filter(str.isdigit, identifier))
    if not is_email and len(norm_identifier) < 10:
        return jsonify({"error": "Please provide a valid 10-digit mobile number or email address"}), 400

    lookup_identifier = norm_identifier
    if lookup_identifier == "citizen.rahul@example.com":
        lookup_identifier = "citizen.sonika@example.com"

    # Look up existing user if any
    user = None
    if is_email:
        user = User.query.filter_by(email=lookup_identifier).first()
    else:
        # Match by phone ending or exact
        user = User.query.filter(User.phone.like(f"%{norm_identifier[-10:]}")).first()

    # Generate 6-digit OTP code
    otp_code = f"{random.randint(100000, 999999):06d}"
    OTP_STORE[norm_identifier] = {
        "code": otp_code,
        "expires_at": time.time() + 300,  # 5 minutes validity
    }

    return jsonify({
        "message": f"Verification code sent to {identifier}",
        "identifier": norm_identifier,
        "demo_otp": otp_code,
        "is_existing_user": bool(user),
        "user_name": user.full_name if user else None,
        "role": user.role if user else "citizen"
    }), 200


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json() or {}
    identifier = str(data.get("identifier", "")).strip()
    otp = str(data.get("otp", "")).strip()

    if not identifier or not otp:
        return jsonify({"error": "Identifier and OTP code are required"}), 400

    is_email = "@" in identifier
    norm_identifier = identifier.lower() if is_email else "".join(filter(str.isdigit, identifier))

    # Verification: check OTP_STORE or master demo fallback '123456'
    valid = False
    stored = OTP_STORE.get(norm_identifier)
    if stored and stored.get("expires_at", 0) > time.time() and stored.get("code") == otp:
        valid = True
    elif otp == "123456":
        valid = True  # Universal demo fallback for seamless teacher demonstrations

    if not valid:
        return jsonify({"error": "Invalid or expired OTP code. Please try again or click Resend."}), 400

    # Find or auto-provision citizen user
    lookup_identifier = norm_identifier
    if lookup_identifier == "citizen.rahul@example.com":
        lookup_identifier = "citizen.sonika@example.com"

    user = None
    if is_email:
        user = User.query.filter_by(email=lookup_identifier).first()
    else:
        user = User.query.filter(User.phone.like(f"%{norm_identifier[-10:]}")).first()

    if not user:
        # Auto-provision new citizen
        first_city = City.query.order_by(City.id.asc()).first()
        city_id = first_city.id if first_city else None

        if is_email:
            name_part = norm_identifier.split("@")[0].replace(".", " ").title()
            user = User(
                email=norm_identifier,
                full_name=f"{name_part}",
                role="citizen",
                city_id=city_id,
                is_active=True
            )
        else:
            clean_digits = norm_identifier[-10:]
            user = User(
                email=f"citizen_{clean_digits}@pcms.gov.in",
                phone=clean_digits,
                full_name=f"Citizen ({clean_digits[-4:]})",
                role="citizen",
                city_id=city_id,
                is_active=True
            )
        user.set_password("Citizen@123")
        db.session.add(user)
        db.session.commit()

    if not user.is_active:
        return jsonify({"error": "Your account is deactivated. Please contact municipal support."}), 403

    # Clean up OTP after successful login
    OTP_STORE.pop(norm_identifier, None)

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "OTP verified successfully. Login successful.",
        "access_token": access_token,
        "user": user.to_dict(include_private=True)
    }), 200


@auth_bp.route("/aadhaar-send-otp", methods=["POST"])
@jwt_required()
def aadhaar_send_otp():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    aadhaar_input = str(data.get("aadhaar_number", "")).strip()

    # Clean digits only
    clean_digits = "".join(filter(str.isdigit, aadhaar_input))
    if len(clean_digits) != 12:
        return jsonify({"error": "Please enter a valid 12-digit Aadhaar / VID number"}), 400

    otp_code = f"{random.randint(100000, 999999):06d}"
    last4 = clean_digits[-4:]

    AADHAAR_OTP_STORE[user.id] = {
        "code": otp_code,
        "aadhaar_last4": last4,
        "expires_at": time.time() + 600,  # 10 minutes
    }

    return jsonify({
        "message": f"UIDAI OTP dispatched to mobile linked with Aadhaar ending in {last4}",
        "aadhaar_last4": last4,
        "demo_otp": otp_code,
    }), 200


@auth_bp.route("/aadhaar-verify-otp", methods=["POST"])
@jwt_required()
def aadhaar_verify_otp():
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    otp = str(data.get("otp", "")).strip()

    if not otp:
        return jsonify({"error": "Aadhaar verification OTP code is required"}), 400

    stored = AADHAAR_OTP_STORE.get(user.id)
    valid = False
    last4 = "4819"

    if stored and stored.get("expires_at", 0) > time.time() and stored.get("code") == otp:
        valid = True
        last4 = stored.get("aadhaar_last4", "4819")
    elif otp == "123456":
        valid = True
        if stored:
            last4 = stored.get("aadhaar_last4", "4819")

    if not valid:
        return jsonify({"error": "Invalid or expired UIDAI Aadhaar OTP code"}), 400

    # Mark user as Aadhaar e-KYC verified
    user.is_aadhaar_verified = True
    user.aadhaar_last4 = last4
    user.kyc_verified_at = datetime.utcnow()
    user.kyc_document_type = "digilocker_aadhaar"
    db.session.commit()

    AADHAAR_OTP_STORE.pop(user.id, None)

    return jsonify({
        "message": "Aadhaar e-KYC verified successfully via DigiLocker. You are now a Verified Citizen.",
        "user": user.to_dict(include_private=True)
    }), 200


