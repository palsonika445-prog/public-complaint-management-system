from marshmallow import Schema, fields, validate

class ComplaintSubmitSchema(Schema):
    title = fields.String(required=True, validate=validate.Length(min=5, max=200))
    description = fields.String(required=True, validate=validate.Length(min=10, max=4000))
    category_id = fields.Integer(required=True)
    subcategory = fields.String(required=False, allow_none=True, validate=validate.Length(max=100))
    city_id = fields.Integer(required=True)
    priority = fields.String(required=False, validate=validate.OneOf(["low", "medium", "high", "critical"]))
    visibility = fields.String(required=False, validate=validate.OneOf(["public", "private"]))
    latitude = fields.Float(required=True, validate=validate.Range(min=-90.0, max=90.0))
    longitude = fields.Float(required=True, validate=validate.Range(min=-180.0, max=180.0))
    address = fields.String(required=False, allow_none=True, validate=validate.Length(max=255))
    landmark = fields.String(required=False, allow_none=True, validate=validate.Length(max=255))
    state = fields.String(required=False, allow_none=True, validate=validate.Length(max=100))


class ComplaintStatusUpdateSchema(Schema):
    status = fields.String(required=True, validate=validate.OneOf([
        "submitted", "under_review", "assigned", "in_progress", "resolved", "reopened", "rejected", "closed"
    ]))
    remarks = fields.String(required=False, allow_none=True)
    rejection_reason = fields.String(required=False, allow_none=True)
    resolution_remarks = fields.String(required=False, allow_none=True)
    evidence_url = fields.String(required=False, allow_none=True)


class ComplaintAssignSchema(Schema):
    department_id = fields.Integer(required=True)
    staff_id = fields.Integer(required=False, allow_none=True)
    notes = fields.String(required=False, allow_none=True)
    priority = fields.String(required=False, validate=validate.OneOf(["low", "medium", "high", "critical"]))


class ComplaintCommentSchema(Schema):
    comment = fields.String(required=True, validate=validate.Length(min=1, max=2000))
    is_internal = fields.Boolean(required=False, load_default=False, dump_default=False)


class FeedbackSchema(Schema):
    rating = fields.Integer(required=True, validate=validate.Range(min=1, max=5))
    remarks = fields.String(required=False, allow_none=True, validate=validate.Length(max=1000))
    timely_resolution = fields.Boolean(required=False, load_default=True, dump_default=True)
    staff_behavior = fields.Boolean(required=False, load_default=True, dump_default=True)


class ReopenComplaintSchema(Schema):
    reason = fields.String(required=True, validate=validate.Length(min=5, max=1000))


class DuplicateCheckSchema(Schema):
    city_id = fields.Integer(required=True)
    category_id = fields.Integer(required=True)
    latitude = fields.Float(required=True)
    longitude = fields.Float(required=True)
    radius_meters = fields.Float(required=False, load_default=1000.0, dump_default=1000.0)
