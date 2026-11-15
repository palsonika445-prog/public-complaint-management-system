import re
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.extensions import db
from app.models.city import City
from app.models.department import Department
from app.models.sla_policy import SLAPolicy
from app.schemas.city_dept_schema import CitySchema
from app.permissions.decorators import role_required, get_current_user
from app.services.audit_service import log_action

city_bp = Blueprint("cities", __name__, url_prefix="/api/cities")
city_schema = CitySchema()

def _provision_default_city_resources(city_id):
    """Automatically provisions 5 standard civic departments and default SLA policies."""
    default_depts = [
        {"name": "Public Works Department", "code": "PWD", "desc": "Roads, potholes, bridges, and civil public infrastructure"},
        {"name": "Solid Waste Management", "code": "SWM", "desc": "Garbage collection, public sanitation, and cleanliness"},
        {"name": "Water Supply & Sewerage", "code": "WTR", "desc": "Drinking water pipelines, water supply, and leaks"},
        {"name": "Electrical & Streetlights", "code": "ELEC", "desc": "Street lighting poles, electrical repairs, and power safety"},
        {"name": "Drainage & Stormwater", "code": "DRG", "desc": "Stormwater drains, sewage blockages, and open drains"},
    ]
    for d in default_depts:
        if not Department.query.filter_by(city_id=city_id, code=d["code"]).first():
            dept = Department(
                name=d["name"],
                code=d["code"],
                description=d["desc"],
                city_id=city_id,
                is_active=True
            )
            db.session.add(dept)

    sla_defaults = [
        ("critical", 12, 12),
        ("high", 24, 24),
        ("medium", 48, 48),
        ("low", 72, 72)
    ]
    for p, target, threshold in sla_defaults:
        if not SLAPolicy.query.filter_by(city_id=city_id, priority=p).first():
            sla = SLAPolicy(
                city_id=city_id,
                priority=p,
                target_resolution_hours=target,
                escalation_threshold_hours=threshold,
                is_active=True
            )
            db.session.add(sla)


@city_bp.route("", methods=["GET"])
def list_cities():
    """Public endpoint to list active cities for registration and filtering."""
    cities = City.query.filter_by(is_active=True).order_by(City.name.asc()).all()
    return jsonify({"cities": [c.to_dict() for c in cities]}), 200


@city_bp.route("/all", methods=["GET"])
@role_required("super_admin")
def list_all_cities_admin():
    """Super Admin view: lists all cities including inactive ones with summary stats."""
    cities = City.query.order_by(City.created_at.desc()).all()
    results = []
    for c in cities:
        data = c.to_dict()
        data["departments_count"] = c.departments.count()
        data["complaints_count"] = c.complaints.count()
        data["staff_count"] = c.users.filter_by(role="staff").count()
        data["citizens_count"] = c.users.filter_by(role="citizen").count()
        results.append(data)
    return jsonify({"cities": results}), 200


@city_bp.route("/<int:city_id>", methods=["GET"])
def get_city(city_id):
    city = City.query.get_or_404(city_id)
    return jsonify({"city": city.to_dict()}), 200


@city_bp.route("", methods=["POST"])
@role_required("super_admin")
def create_city():
    raw_data = request.get_json() or {}
    data = dict(raw_data)

    # Clean optional empty strings so Marshmallow doesn't fail email validation
    if not data.get("contact_email") or not str(data["contact_email"]).strip():
        data["contact_email"] = None
    else:
        data["contact_email"] = str(data["contact_email"]).strip().lower()

    if not data.get("helpline_number") or not str(data["helpline_number"]).strip():
        data["helpline_number"] = None
    else:
        data["helpline_number"] = str(data["helpline_number"]).strip()

    if "state" in data and data["state"]:
        data["state"] = str(data["state"]).strip().rstrip('\\/')

    if "slug" in data and data["slug"]:
        data["slug"] = re.sub(r'[^a-zA-Z0-9_-]', '', str(data["slug"]).lower().strip().replace(' ', '-'))

    try:
        validated = city_schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    if City.query.filter_by(slug=validated["slug"].lower().strip()).first():
        return jsonify({"error": "A city with this slug already exists"}), 409

    city = City(
        name=validated["name"].strip(),
        slug=validated["slug"].lower().strip(),
        state=validated["state"].strip(),
        country=validated.get("country", "India"),
        latitude=validated["latitude"],
        longitude=validated["longitude"],
        boundary_radius_km=validated.get("boundary_radius_km", 25.0),
        contact_email=validated.get("contact_email"),
        helpline_number=validated.get("helpline_number"),
        is_active=validated.get("is_active", True),
    )
    db.session.add(city)
    db.session.flush()

    _provision_default_city_resources(city.id)
    db.session.commit()

    current_user = get_current_user()
    log_action(current_user.id, "create_city", "City", city.id, city.id, city.to_dict())
    db.session.commit()

    return jsonify({"message": "City created successfully", "city": city.to_dict()}), 201


@city_bp.route("/citizen-add", methods=["POST"])
def citizen_add_city():
    """Allows citizens or visitors to add any municipality across India dynamically."""
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    state = (data.get("state") or "").strip().rstrip('\\/')

    if not name or len(name) < 2:
        return jsonify({"error": "Valid city name is required"}), 400
    if not state or len(state) < 2:
        return jsonify({"error": "Valid state name is required"}), 400

    clean_name = re.sub(r'[^\w\s-]', '', name)
    slug = re.sub(r'[^a-zA-Z0-9_-]', '', clean_name.lower().replace(' ', '-'))

    existing = City.query.filter((City.slug == slug) | (City.name.ilike(name))).first()
    if existing:
        return jsonify({"message": "City already onboarded", "city": existing.to_dict()}), 200

    formatted_name = name if any(x in name.lower() for x in ["municipal", "corporation", "council", "nagar"]) else f"{name} Municipal Corporation"

    lat = float(data.get("latitude") or 28.6139)
    lng = float(data.get("longitude") or 77.2090)

    city = City(
        name=formatted_name,
        slug=slug,
        state=state,
        country="India",
        latitude=lat,
        longitude=lng,
        boundary_radius_km=25.0,
        contact_email=f"contact@{slug}.gov.in",
        helpline_number="1800-180-2026",
        is_active=True
    )
    db.session.add(city)
    db.session.flush()

    _provision_default_city_resources(city.id)
    db.session.commit()

    return jsonify({
        "message": f"Successfully onboarded {city.name}",
        "city": city.to_dict()
    }), 201


@city_bp.route("/<int:city_id>", methods=["PUT"])
@role_required("super_admin")
def update_city(city_id):
    city = City.query.get_or_404(city_id)
    data = request.get_json() or {}
    try:
        validated = city_schema.load(data, partial=True)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    if "name" in validated:
        city.name = validated["name"].strip()
    if "state" in validated:
        city.state = validated["state"].strip()
    if "latitude" in validated:
        city.latitude = validated["latitude"]
    if "longitude" in validated:
        city.longitude = validated["longitude"]
    if "boundary_radius_km" in validated:
        city.boundary_radius_km = validated["boundary_radius_km"]
    if "contact_email" in validated:
        city.contact_email = validated["contact_email"]
    if "helpline_number" in validated:
        city.helpline_number = validated["helpline_number"]
    if "is_active" in validated:
        city.is_active = validated["is_active"]

    current_user = get_current_user()
    log_action(current_user.id, "update_city", "City", city.id, city.id, city.to_dict())
    db.session.commit()

    return jsonify({"message": "City updated successfully", "city": city.to_dict()}), 200


@city_bp.route("/<int:city_id>/toggle-status", methods=["PATCH"])
@role_required("super_admin")
def toggle_city_status(city_id):
    city = City.query.get_or_404(city_id)
    city.is_active = not city.is_active
    current_user = get_current_user()
    log_action(
        current_user.id,
        "toggle_city_status",
        "City",
        city.id,
        city.id,
        {"is_active": city.is_active}
    )
    db.session.commit()
    return jsonify({
        "message": f"City status changed to {'active' if city.is_active else 'inactive'}",
        "city": city.to_dict()
    }), 200
