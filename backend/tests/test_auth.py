def test_registration_success(client):
    payload = {
        "email": "new.citizen@test.com",
        "full_name": "New Citizen",
        "password": "Password@123",
        "phone": "9999888877",
        "preferred_language": "hi",
    }
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 201
    data = resp.get_json()
    assert "access_token" in data
    assert data["user"]["email"] == "new.citizen@test.com"
    assert data["user"]["role"] == "citizen"
    assert data["user"]["preferred_language"] == "hi"


def test_registration_duplicate_email(client):
    payload = {
        "email": "citizen_a@test.com",
        "full_name": "Duplicate User",
        "password": "Password@123",
    }
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 409
    assert "already exists" in resp.get_json()["error"]


def test_login_success_and_failure(client):
    # Valid login
    resp = client.post("/api/auth/login", json={"email": "citizen_a@test.com", "password": "pass123"})
    assert resp.status_code == 200
    assert "access_token" in resp.get_json()

    # Invalid password
    resp = client.post("/api/auth/login", json={"email": "citizen_a@test.com", "password": "wrongpassword"})
    assert resp.status_code == 401


def test_me_and_profile_update(client, tokens):
    token = tokens["citizen_a"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/auth/me", headers=headers)
    assert resp.status_code == 200
    assert resp.get_json()["user"]["email"] == "citizen_a@test.com"

    # Update profile
    update_resp = client.put("/api/auth/profile", json={"full_name": "Citizen Alpha Updated", "preferred_language": "hi"}, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.get_json()["user"]["full_name"] == "Citizen Alpha Updated"
    assert update_resp.get_json()["user"]["preferred_language"] == "hi"


def test_password_reset_flow(client):
    req_resp = client.post("/api/auth/password-reset-request", json={"email": "citizen_a@test.com"})
    assert req_resp.status_code == 200
    token = req_resp.get_json().get("demo_reset_token")
    assert token is not None

    confirm_resp = client.post("/api/auth/password-reset-confirm", json={
        "email": "citizen_a@test.com",
        "reset_token": token,
        "new_password": "NewSecretPassword@123"
    })
    assert confirm_resp.status_code == 200

    # Verify new login works
    login_resp = client.post("/api/auth/login", json={"email": "citizen_a@test.com", "password": "NewSecretPassword@123"})
    assert login_resp.status_code == 200
