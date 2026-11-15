from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.extensions import db
from app.models.category import ComplaintCategory
from app.schemas.city_dept_schema import CategorySchema
from app.permissions.decorators import role_required, get_current_user, enforce_city_scope

cat_bp = Blueprint("categories", __name__, url_prefix="/api/categories")
cat_schema = CategorySchema()

@cat_bp.route("", methods=["GET"])
def list_categories():
    """Returns active categories. If city_id is supplied, includes platform-wide + city-specific categories."""
    city_id = request.args.get("city_id", type=int)
    query = ComplaintCategory.query.filter_by(is_active=True)
    if city_id:
        query = query.filter((ComplaintCategory.city_id == city_id) | (ComplaintCategory.city_id.is_(None)))
    else:
        query = query.filter(ComplaintCategory.city_id.is_(None))
        
    categories = query.order_by(ComplaintCategory.name.asc()).all()
    return jsonify({"categories": [c.to_dict() for c in categories]}), 200


@cat_bp.route("", methods=["POST"])
@role_required("city_admin", "super_admin")
def create_category():
    data = request.get_json() or {}
    try:
        validated = cat_schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    if validated.get("city_id"):
        allowed, err_msg = enforce_city_scope(validated["city_id"])
        if not allowed:
            return jsonify({"error": err_msg}), 403

    cat = ComplaintCategory(
        name=validated["name"].strip(),
        code=validated["code"].lower().strip(),
        description=validated.get("description"),
        icon=validated.get("icon", "alert-circle"),
        default_department_code=validated.get("default_department_code"),
        city_id=validated.get("city_id"),
        is_active=validated.get("is_active", True),
    )
    db.session.add(cat)
    db.session.commit()

    return jsonify({"message": "Category created successfully", "category": cat.to_dict()}), 201
