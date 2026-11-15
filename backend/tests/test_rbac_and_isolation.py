def test_super_admin_capabilities(client, tokens):
    headers_super = {"Authorization": f"Bearer {tokens['superadmin']}"}
    headers_citizen = {"Authorization": f"Bearer {tokens['citizen_a']}"}

    # Citizen cannot access super admin dashboard
    unauth = client.get("/api/admin/super/dashboard", headers=headers_citizen)
    assert unauth.status_code == 403

    # Super admin can view dashboard
    resp = client.get("/api/admin/super/dashboard", headers=headers_super)
    assert resp.status_code == 200
    assert "stats" in resp.get_json()
    assert resp.get_json()["stats"]["total_cities"] >= 2

    # Super admin can create new city
    new_city_resp = client.post("/api/cities", json={
        "name": "City Gamma",
        "slug": "city-gamma",
        "state": "Gamma State",
        "latitude": 22.0,
        "longitude": 77.0,
    }, headers=headers_super)
    assert new_city_resp.status_code == 201

    # Super admin can view audit logs
    logs_resp = client.get("/api/admin/super/audit-logs", headers=headers_super)
    assert logs_resp.status_code == 200
    assert "audit_logs" in logs_resp.get_json()


def test_city_admin_isolation(client, tokens):
    headers_admin_a = {"Authorization": f"Bearer {tokens['admin_a']}"}
    headers_admin_b = {"Authorization": f"Bearer {tokens['admin_b']}"}

    # Admin A creates a department for City A (id: 1)
    dept_resp = client.post("/api/departments", json={
        "city_id": 1,
        "name": "Sanitation Dept Alpha",
        "code": "SWM",
        "description": "City Alpha sanitation",
    }, headers=headers_admin_a)
    assert dept_resp.status_code == 201

    # Admin A tries to create department for City B (id: 2) -> 403 Forbidden!
    forbidden_dept = client.post("/api/departments", json={
        "city_id": 2,
        "name": "Intruder Dept",
        "code": "INTR",
    }, headers=headers_admin_a)
    assert forbidden_dept.status_code == 403

    # Admin A registers staff for City A
    staff_resp = client.post("/api/admin/city/staff", json={
        "city_id": 1,
        "department_id": 1,
        "email": "new.staff@alpha.gov.in",
        "full_name": "New Alpha Staff",
        "password": "Password@123",
    }, headers=headers_admin_a)
    assert staff_resp.status_code == 201

    # Reports: CSV export
    csv_resp = client.get("/api/reports/export-csv", headers=headers_admin_a)
    assert csv_resp.status_code == 200
    assert csv_resp.headers["Content-Type"].startswith("text/csv")
