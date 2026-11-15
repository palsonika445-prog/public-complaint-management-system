import pytest
from app import create_app
from app.extensions import db
from app.models.city import City
from app.models.department import Department
from app.models.category import ComplaintCategory
from app.models.user import User

@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        # Seed basic cities and roles for testing
        city_a = City(name="City Alpha", slug="city-alpha", state="Alpha State", latitude=20.0, longitude=75.0, is_active=True)
        city_b = City(name="City Beta", slug="city-beta", state="Beta State", latitude=21.0, longitude=76.0, is_active=True)
        db.session.add_all([city_a, city_b])
        db.session.flush()

        cat_road = ComplaintCategory(name="Roads & Potholes", code="roads", default_department_code="PWD", is_active=True)
        cat_water = ComplaintCategory(name="Water Supply", code="water", default_department_code="WTR", is_active=True)
        db.session.add_all([cat_road, cat_water])
        db.session.flush()

        dept_pwd_a = Department(city_id=city_a.id, name="Public Works Dept Alpha", code="PWD", is_active=True)
        dept_pwd_b = Department(city_id=city_b.id, name="Public Works Dept Beta", code="PWD", is_active=True)
        db.session.add_all([dept_pwd_a, dept_pwd_b])
        db.session.flush()

        # Users
        superadmin = User(email="super@test.com", full_name="Super Admin", role="super_admin", is_active=True)
        superadmin.set_password("pass123")

        admin_a = User(email="admin_a@test.com", full_name="Admin Alpha", role="city_admin", city_id=city_a.id, is_active=True)
        admin_a.set_password("pass123")

        admin_b = User(email="admin_b@test.com", full_name="Admin Beta", role="city_admin", city_id=city_b.id, is_active=True)
        admin_b.set_password("pass123")

        staff_a = User(email="staff_a@test.com", full_name="Staff Alpha", role="staff", city_id=city_a.id, department_id=dept_pwd_a.id, is_active=True)
        staff_a.set_password("pass123")

        citizen_a = User(email="citizen_a@test.com", full_name="Citizen Alpha", role="citizen", city_id=city_a.id, is_active=True)
        citizen_a.set_password("pass123")

        citizen_b = User(email="citizen_b@test.com", full_name="Citizen Beta", role="citizen", city_id=city_b.id, is_active=True)
        citizen_b.set_password("pass123")

        db.session.add_all([superadmin, admin_a, admin_b, staff_a, citizen_a, citizen_b])
        db.session.commit()

        yield app

        db.session.remove()
        try:
            db.session.execute(db.text("PRAGMA foreign_keys = OFF;"))
            db.drop_all()
        except Exception:
            pass


@pytest.fixture
def client(app):
    return app.test_client()


def get_token(client, email, password="pass123"):
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    return resp.get_json()["access_token"]


@pytest.fixture
def tokens(client):
    return {
        "superadmin": get_token(client, "super@test.com"),
        "admin_a": get_token(client, "admin_a@test.com"),
        "admin_b": get_token(client, "admin_b@test.com"),
        "staff_a": get_token(client, "staff_a@test.com"),
        "citizen_a": get_token(client, "citizen_a@test.com"),
        "citizen_b": get_token(client, "citizen_b@test.com"),
    }
