from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6, max=100))
    full_name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    phone = fields.String(required=False, allow_none=True, validate=validate.Length(max=20))
    city_id = fields.Integer(required=False, allow_none=True)
    preferred_language = fields.String(required=False, validate=validate.OneOf(["en", "hi"]))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)


class PasswordResetRequestSchema(Schema):
    email = fields.Email(required=True)


class PasswordResetConfirmSchema(Schema):
    email = fields.Email(required=True)
    reset_token = fields.String(required=True)
    new_password = fields.String(required=True, validate=validate.Length(min=6, max=100))
