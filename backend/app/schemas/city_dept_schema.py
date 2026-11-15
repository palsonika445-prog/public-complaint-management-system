from marshmallow import Schema, fields, validate

class CitySchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    slug = fields.String(required=True, validate=validate.Length(min=2, max=100))
    state = fields.String(required=True, validate=validate.Length(min=2, max=100))
    country = fields.String(required=False, default="India")
    latitude = fields.Float(required=True)
    longitude = fields.Float(required=True)
    boundary_radius_km = fields.Float(required=False, default=25.0)
    contact_email = fields.Email(required=False, allow_none=True)
    helpline_number = fields.String(required=False, allow_none=True)
    is_active = fields.Boolean(required=False, default=True)


class DepartmentSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    code = fields.String(required=True, validate=validate.Length(min=2, max=30))
    description = fields.String(required=False, allow_none=True)
    city_id = fields.Integer(required=True)
    head_user_id = fields.Integer(required=False, allow_none=True)
    is_active = fields.Boolean(required=False, default=True)


class CategorySchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    code = fields.String(required=True, validate=validate.Length(min=2, max=50))
    description = fields.String(required=False, allow_none=True)
    icon = fields.String(required=False, default="alert-circle")
    default_department_code = fields.String(required=False, allow_none=True)
    city_id = fields.Integer(required=False, allow_none=True)
    is_active = fields.Boolean(required=False, default=True)


class SLAPolicySchema(Schema):
    city_id = fields.Integer(required=True)
    category_id = fields.Integer(required=False, allow_none=True)
    priority = fields.String(required=True, validate=validate.OneOf(["low", "medium", "high", "critical"]))
    target_resolution_hours = fields.Integer(required=True, validate=validate.Range(min=1, max=720))
    escalation_threshold_hours = fields.Integer(required=True, validate=validate.Range(min=1, max=720))
    is_active = fields.Boolean(required=False, default=True)
