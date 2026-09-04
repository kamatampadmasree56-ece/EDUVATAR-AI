def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "EDUVATAR" in data["app"]

    api_res = client.get("/api/health")
    assert api_res.status_code == 200
    assert api_res.json()["status"] == "healthy"

def test_reset_ohms_law_demo(client):
    res = client.post("/api/demo/reset-ohms-law")
    assert res.status_code == 200
    data = res.json()
    assert "Ohm's Law" in data["title"]
    assert data["subject"] == "Physics"
    assert len(data["sections"]) == 3
    assert data["total_sections"] == 3
    assert data["sections"][0]["title"] == "Understanding Electric Potential (Voltage)"

def test_get_user_lessons(client, auth_headers):
    # Ensure demo lesson exists
    client.post("/api/demo/reset-ohms-law")

    res = client.get("/api/lessons", headers=auth_headers)
    assert res.status_code == 200
    lessons = res.json()
    assert isinstance(lessons, list)
    assert len(lessons) >= 1
    assert any("Ohm's Law" in l["title"] for l in lessons)

def test_get_lesson_by_id(client, auth_headers):
    demo_res = client.post("/api/demo/reset-ohms-law")
    lesson_id = demo_res.json()["id"]

    res = client.get(f"/api/lessons/{lesson_id}", headers=auth_headers)
    assert res.status_code == 200
    lesson = res.json()
    assert lesson["id"] == lesson_id
    assert len(lesson["sections"]) == 3
    assert lesson["sections"][1]["questions"][0]["concept_tested"] == "Ohm's Law Inverse Relationship"

def test_generate_ai_lesson(client, auth_headers):
    payload = {
        "mode": "topic",
        "topic": "Newton's Laws of Motion",
        "target_level": "Beginner",
        "duration_minutes": 15,
        "teaching_style": "Visual Socratic",
        "language": "English"
    }
    res = client.post("/api/lessons/generate", json=payload, headers=auth_headers)
    assert res.status_code == 200
    lesson = res.json()
    assert "Newton" in lesson["title"]
    assert lesson["subject"] == "Physics"
    assert len(lesson["sections"]) >= 1
