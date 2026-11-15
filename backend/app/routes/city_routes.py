from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.extensions import db
from app.models.city import City
from app.schemas.city_dept_schema import CitySchema
from app.permissions.decorators import role_required, get_current_user
from app.services.audit_service import log_action

city_bp = Blueprint("cities", __name__, url_prefix="/api/cities")
city_schema = CitySchema()

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
    data = request.get_json() or {}
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
    db.session.commit()

    current_user = get_current_user()
    log_action(current_user.id, "create_city", "City", city.id, city.id, city.to_dict())
    db.session.commit()

    return jsonify({"message": "City created successfully", "city": city.to_dict()}), 201


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
