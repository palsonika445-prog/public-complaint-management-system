import os
from flask import Flask, jsonify
from sqlalchemy import event
from sqlalchemy.engine import Engine

from app.config import config_by_name
from app.extensions import db, migrate, jwt, ma, cors
from app.cli import register_cli_commands

# Enable foreign keys for SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if "sqlite" in str(type(dbapi_connection)).lower():
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({"error": "Missing or invalid authorization token"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({"error": "Invalid token"}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired. Please log in again."}), 401

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.city_routes import city_bp
    from app.routes.department_routes import dept_bp
    from app.routes.category_routes import cat_bp
    from app.routes.complaint_routes import complaint_bp
    from app.routes.staff_routes import staff_bp
    from app.routes.citizen_routes import citizen_bp
    from app.routes.notification_routes import notification_bp
    from app.routes.report_routes import report_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.map_routes import map_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(city_bp)
    app.register_blueprint(dept_bp)
    app.register_blueprint(cat_bp)
    app.register_blueprint(complaint_bp)
    app.register_blueprint(staff_bp)
    app.register_blueprint(citizen_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(map_bp)

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "Public Complaint Management System (PCMS) API",
            "version": "1.0.0"
        }), 200

    # Centralized error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request", "details": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    # Register CLI
    register_cli_commands(app)

    return app
