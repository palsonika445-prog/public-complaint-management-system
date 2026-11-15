import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "pcms-enterprise-super-secret-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-pcms-token-secret-key-civic-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_ACCESS_HOURS", 24)))
    
    # Database: Primary is PostgreSQL, fallback is SQLite for portable dev
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'pcms.db')}"
    )
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # File Uploads
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(BASE_DIR, "uploads"))
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "pdf"}
    
    # Geocoding (Nominatim / OSM compatible)
    NOMINATIM_BASE_URL = os.getenv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
    NOMINATIM_USER_AGENT = os.getenv("NOMINATIM_USER_AGENT", "PCMS-Civic-Tech-App/1.0")
    
    # Rate Limiting & Anonymous Tokens
    ANONYMOUS_SALT = os.getenv("ANONYMOUS_SALT", "pcms-anon-salt-secure-hash-2026")
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads_test")


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False


config_by_name = {
    "development": Config,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": Config,
}
