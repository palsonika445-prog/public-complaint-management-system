def test_full_lifecycle_scenarios_1_to_8(client, tokens):
    headers_citizen_a = {"Authorization": f"Bearer {tokens['citizen_a']}"}
    headers_admin_a = {"Authorization": f"Bearer {tokens['admin_a']}"}
    headers_admin_b = {"Authorization": f"Bearer {tokens['admin_b']}"}
    headers_staff_a = {"Authorization": f"Bearer {tokens['staff_a']}"}

    # ==========================================
    # SCENARIO 1: Citizen from City A submits a road complaint
    # ==========================================
    submit_payload = {
        "title": "Deep pothole on Main Road near clock tower",
        "description": "A very large pothole roughly 2 feet wide causing bike accidents.",
        "category_id": 1,
        "city_id": 1,
        "priority": "high",
        "visibility": "private",  # Test private visibility to check isolation later
        "latitude": 20.005123,
        "longitude": 75.006456,
        "address": "Clock Tower, Main Market",
        "landmark": "Near Clock Tower",
    }
    sub_resp = client.post("/api/complaints", json=submit_payload, headers=headers_citizen_a)
    assert sub_resp.status_code == 201
    complaint_data = sub_resp.get_json()
    complaint_id = complaint_data["complaint_id"]
    complaint_num = complaint_data["complaint_number"]
    assert complaint_num.startswith("CMP-")
    assert complaint_data["status"] == "submitted"

    # ==========================================
    # SCENARIO 2: City A Admin reviews and assigns complaint
    # ==========================================
    assign_payload = {
        "department_id": 1,  # PWD Alpha
        "notes": "Assigning to PWD team for prompt asphalt patching",
        "priority": "high"
    }
    assign_resp = client.post(f"/api/complaints/{complaint_id}/assign", json=assign_payload, headers=headers_admin_a)
    assert assign_resp.status_code == 200
    assert assign_resp.get_json()["complaint"]["status"] == "assigned"
    assert assign_resp.get_json()["complaint"]["assigned_department_id"] == 1

    # ==========================================
    # SCENARIO 3: Assigned PWD staff updates complaint to in_progress
    # ==========================================
    status_payload = {
        "status": "in_progress",
        "remarks": "Repair team arrived on site with bitumen mixture.",
    }
    status_resp = client.post(f"/api/complaints/{complaint_id}/status", json=status_payload, headers=headers_staff_a)
    assert status_resp.status_code == 200
    assert status_resp.get_json()["complaint"]["status"] == "in_progress"

    # Staff adds internal comment
    comment_resp = client.post(f"/api/complaints/{complaint_id}/comments", json={
        "comment": "Internal inspection: road base is stable, surface layer applied.",
        "is_internal": True
    }, headers=headers_staff_a)
    assert comment_resp.status_code == 201

    # ==========================================
    # SCENARIO 4: Staff member resolves the complaint with evidence
    # ==========================================
    resolve_payload = {
        "status": "resolved",
        "resolution_remarks": "Pothole filled, asphalt compacted and road leveled.",
    }
    resolve_resp = client.post(f"/api/complaints/{complaint_id}/status", json=resolve_payload, headers=headers_staff_a)
    assert resolve_resp.status_code == 200
    assert resolve_resp.get_json()["complaint"]["status"] == "resolved"

    # ==========================================
    # SCENARIO 5: Citizen views resolution and submits feedback
    # ==========================================
    get_resp = client.get(f"/api/complaints/{complaint_id}", headers=headers_citizen_a)
    assert get_resp.status_code == 200
    assert get_resp.get_json()["complaint"]["status"] == "resolved"
    # Ensure internal comment is NOT visible to citizen
    assert all(c.get("is_internal") is not True for c in get_resp.get_json()["complaint"].get("comments", []))

    feedback_payload = {
        "rating": 5,
        "remarks": "Excellent speed and smooth road repair!",
        "timely_resolution": True,
        "staff_behavior": True,
    }
    fb_resp = client.post(f"/api/complaints/{complaint_id}/feedback", json=feedback_payload, headers=headers_citizen_a)
    assert fb_resp.status_code == 201
    assert fb_resp.get_json()["feedback"]["rating"] == 5

    # ==========================================
    # SCENARIO 6: City B Admin attempts to access City A's private complaint
    # Must be denied (403 Forbidden)
    # ==========================================
    b_resp = client.get(f"/api/complaints/{complaint_id}", headers=headers_admin_b)
    assert b_resp.status_code == 403

    # ==========================================
    # SCENARIO 7: Anonymous citizen submits and tracks securely
    # ==========================================
    anon_payload = {
        "title": "Broken bench in community park",
        "description": "Wooden bench broken in two pieces.",
        "category_id": 1,
        "city_id": 1,
        "priority": "low",
        "visibility": "public",
        "latitude": 20.007000,
        "longitude": 75.008000,
        "landmark": "Near Children Playground",
    }
    anon_resp = client.post("/api/complaints", json=anon_payload)  # No auth headers
    assert anon_resp.status_code == 201
    anon_data = anon_resp.get_json()
    assert anon_data["is_anonymous"] is True
    anon_num = anon_data["complaint_number"]
    anon_token = anon_data["tracking_token"]

    # Retrieve anonymously with correct token
    track_resp = client.post("/api/complaints/anonymous-track", json={
        "complaint_number": anon_num,
        "tracking_token": anon_token,
    })
    assert track_resp.status_code == 200
    assert track_resp.get_json()["complaint"]["complaint_number"] == anon_num

    # Attempt with incorrect token -> 401
    bad_track = client.post("/api/complaints/anonymous-track", json={
        "complaint_number": anon_num,
        "tracking_token": "wrong_token_123",
    })
    assert bad_track.status_code == 401

    # ==========================================
    # SCENARIO 8: Public user views map & feed without seeing private details
    # ==========================================
    map_resp = client.get("/api/complaints/public-map")
    assert map_resp.status_code == 200
    pins = map_resp.get_json()["pins"]
    # Verify anonymous complaint is in public pins
    anon_pin = next((p for p in pins if p["complaint_number"] == anon_num), None)
    assert anon_pin is not None
    # Verify fuzzed coordinates (rounded to 3 decimals)
    assert anon_pin["latitude"] == round(anon_payload["latitude"], 3)
    assert anon_pin["longitude"] == round(anon_payload["longitude"], 3)
    # Verify no citizen phone or email exposed
    assert "email" not in anon_pin
    assert "phone" not in anon_pin


def test_support_complaint_and_duplicate_check(client, tokens):
    headers_citizen_a = {"Authorization": f"Bearer {tokens['citizen_a']}"}
    headers_citizen_b = {"Authorization": f"Bearer {tokens['citizen_b']}"}

    # Submit public complaint
    sub = client.post("/api/complaints", json={
        "title": "Garbage dump near bus terminal",
        "description": "Large garbage heap on roadside.",
        "category_id": 1,
        "city_id": 1,
        "visibility": "public",
        "latitude": 20.010000,
        "longitude": 75.010000,
    }, headers=headers_citizen_a)
    complaint_id = sub.get_json()["complaint_id"]

    # Duplicate check from nearby coordinates (~50m away)
    dup_resp = client.post("/api/complaints/check-duplicates", json={
        "city_id": 1,
        "category_id": 1,
        "latitude": 20.010200,
        "longitude": 75.010100,
        "radius_meters": 500,
    })
    assert dup_resp.status_code == 200
    assert dup_resp.get_json()["count"] >= 1
    assert dup_resp.get_json()["potential_duplicates"][0]["id"] == complaint_id

    # Support complaint by Citizen B
    sup1 = client.post(f"/api/complaints/{complaint_id}/support", headers=headers_citizen_b)
    assert sup1.status_code == 200
    assert sup1.get_json()["support_count"] == 1

    # Second support by same citizen -> 409 Conflict
    sup2 = client.post(f"/api/complaints/{complaint_id}/support", headers=headers_citizen_b)
    assert sup2.status_code == 409
