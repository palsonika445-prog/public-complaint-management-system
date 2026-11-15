from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.extensions import db
from app.models.department import Department
from app.models.city import City
from app.models.user import User
from app.schemas.city_dept_schema import DepartmentSchema
from app.permissions.decorators import role_required, get_current_user, enforce_city_scope
from app.services.audit_service import log_action

dept_bp = Blueprint("departments", __name__, url_prefix="/api/departments")
dept_schema = DepartmentSchema()

@dept_bp.route("/city/<int:city_id>", methods=["GET"])
def list_departments(city_id):
    """List active departments for a given city"""
    departments = Department.query.filter_by(city_id=city_id, is_active=True).order_by(Department.name.asc()).all()
    results = []
    for d in departments:
        item = d.to_dict()
        item["staff_count"] = d.staff_members.count()
        results.append(item)
    return jsonify({"departments": results}), 200


@dept_bp.route("", methods=["POST"])
@role_required("city_admin", "super_admin")
def create_department():
    data = request.get_json() or {}
    try:
        validated = dept_schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    allowed, err_msg = enforce_city_scope(validated["city_id"])
    if not allowed:
        return jsonify({"error": err_msg}), 403

    # Check unique code within the city
    existing = Department.query.filter_by(city_id=validated["city_id"], code=validated["code"].upper().strip()).first()
    if existing:
        return jsonify({"error": "Department with this code already exists in this city"}), 409

    dept = Department(
        city_id=validated["city_id"],
        name=validated["name"].strip(),
        code=validated["code"].upper().strip(),
        description=validated.get("description"),
        head_user_id=validated.get("head_user_id"),
        is_active=validated.get("is_active", True),
    )
    db.session.add(dept)
    db.session.commit()

    current_user = get_current_user()
    log_action(current_user.id, "create_department", "Department", dept.id, dept.city_id, dept.to_dict())
    db.session.commit()

    return jsonify({"message": "Department created successfully", "department": dept.to_dict()}), 201


@dept_bp.route("/<int:dept_id>", methods=["PUT"])
@role_required("city_admin", "super_admin")
def update_department(dept_id):
    dept = Department.query.get_or_404(dept_id)
    allowed, err_msg = enforce_city_scope(dept.city_id)
    if not allowed:
        return jsonify({"error": err_msg}), 403

    data = request.get_json() or {}
    try:
        validated = dept_schema.load(data, partial=True)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    if "name" in validated:
        dept.name = validated["name"].strip()
    if "description" in validated:
        dept.description = validated["description"]
    if "head_user_id" in validated:
        dept.head_user_id = validated["head_user_id"]
    if "is_active" in validated:
        dept.is_active = validated["is_active"]

    current_user = get_current_user()
    log_action(current_user.id, "update_department", "Department", dept.id, dept.city_id, dept.to_dict())
    db.session.commit()

    return jsonify({"message": "Department updated successfully", "department": dept.to_dict()}), 200


@dept_bp.route("/<int:dept_id>/staff", methods=["GET"])
@role_required("city_admin", "super_admin", "staff")
def get_department_staff(dept_id):
    dept = Department.query.get_or_404(dept_id)
    allowed, err_msg = enforce_city_scope(dept.city_id)
    if not allowed:
        return jsonify({"error": err_msg}), 403

    staff = User.query.filter_by(department_id=dept.id, role="staff", is_active=True).all()
    return jsonify({"staff": [s.to_dict(include_private=True) for s in staff]}), 200
