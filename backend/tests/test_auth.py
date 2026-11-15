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


def test_otp_login_flow(client):
    # Test send-otp with mobile number
    send_resp = client.post("/api/auth/send-otp", json={"identifier": "9876543210"})
    assert send_resp.status_code == 200
    data = send_resp.get_json()
    assert "demo_otp" in data
    otp = data["demo_otp"]
    assert len(otp) == 6

    # Test verify-otp with invalid code
    bad_verify = client.post("/api/auth/verify-otp", json={"identifier": "9876543210", "otp": "000000"})
    assert bad_verify.status_code == 400

    # Test verify-otp with valid code
    good_verify = client.post("/api/auth/verify-otp", json={"identifier": "9876543210", "otp": otp})
    assert good_verify.status_code == 200
    user_data = good_verify.get_json()
    assert "access_token" in user_data
    assert user_data["user"]["role"] == "citizen"

    # Test master demo OTP '123456' with existing email
    master_verify = client.post("/api/auth/verify-otp", json={"identifier": "citizen_a@test.com", "otp": "123456"})
    assert master_verify.status_code == 200
    assert "access_token" in master_verify.get_json()


def test_aadhaar_kyc_verification_flow(client):
    # Register a new citizen
    reg = client.post("/api/auth/register", json={
        "email": "kyc_user@test.com",
        "password": "Password@123",
        "full_name": "Aadhaar Test Citizen"
    })
    assert reg.status_code == 201
    token = reg.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test send aadhaar otp with invalid length
    bad_send = client.post("/api/auth/aadhaar-send-otp", json={"aadhaar_number": "123"}, headers=headers)
    assert bad_send.status_code == 400

    # Test send aadhaar otp with valid 12-digit
    good_send = client.post("/api/auth/aadhaar-send-otp", json={"aadhaar_number": "5489-3210-4819"}, headers=headers)
    assert good_send.status_code == 200
    send_data = good_send.get_json()
    assert send_data["aadhaar_last4"] == "4819"
    otp = send_data["demo_otp"]

    # Test verify aadhaar otp with bad code
    bad_verify = client.post("/api/auth/aadhaar-verify-otp", json={"otp": "000000"}, headers=headers)
    assert bad_verify.status_code == 400

    # Test verify aadhaar otp with good code
    good_verify = client.post("/api/auth/aadhaar-verify-otp", json={"otp": otp}, headers=headers)
    assert good_verify.status_code == 200
    verified_user = good_verify.get_json()["user"]
    assert verified_user["is_aadhaar_verified"] is True
    assert verified_user["aadhaar_last4"] == "4819"
    assert verified_user["kyc_document_type"] == "digilocker_aadhaar"


