def test_start_teaching_session(client, auth_headers):
    demo_res = client.post("/api/demo/reset-ohms-law")
    lesson_id = demo_res.json()["id"]

    res = client.post(
        "/api/teaching/start",
        json={"lesson_id": lesson_id},
        headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["lesson_id"] == lesson_id
    assert data["status"] == "active"
    assert "avatar_cues" in data
    assert "visemes" in data["avatar_cues"]
    assert "mood" in data["avatar_cues"]

def test_teaching_response_correct(client, auth_headers):
    demo_res = client.post("/api/demo/reset-ohms-law")
    lesson = demo_res.json()
    lesson_id = lesson["id"]
    # Section 1 question: "What happens to current if resistance increases while voltage remains constant?"
    sec2 = lesson["sections"][1]
    question_id = sec2["questions"][0]["id"]

    res = client.post(
        "/api/teaching/respond",
        json={
            "lesson_id": lesson_id,
            "question_id": question_id,
            "student_answer": "B",
            "confidence": 0.9,
            "response_time_seconds": 12.0
        },
        headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_correct"] is True
    assert data["updated_mastery"] > lesson["current_mastery"]
    assert data["adaptation_action"] == "CONTINUE"

def test_teaching_response_misconception_adaptation(client, auth_headers):
    demo_res = client.post("/api/demo/reset-ohms-law")
    lesson = demo_res.json()
    lesson_id = lesson["id"]
    sec2 = lesson["sections"][1]
    question_id = sec2["questions"][0]["id"]

    # Student chooses misconception option A ("Current increases")
    res = client.post(
        "/api/teaching/respond",
        json={
            "lesson_id": lesson_id,
            "question_id": question_id,
            "student_answer": "A",
            "confidence": 0.8,
            "response_time_seconds": 25.0
        },
        headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_correct"] is False
    assert data["detected_misconception"] is not None
    assert data["remedial_analogy"] is not None

def test_ask_teacher_contextual_doubt(client, auth_headers):
    demo_res = client.post("/api/demo/reset-ohms-law")
    lesson_id = demo_res.json()["id"]

    res = client.post(
        "/api/teaching/ask",
        json={
            "lesson_id": lesson_id,
            "current_section_index": 1,
            "student_question": "Can you explain why current goes down when resistance goes up?"
        },
        headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert "teacher_reply" in data
    assert len(data["teacher_reply"]) > 10
    assert "concept_referenced" in data

def test_speech_synthesize(client):
    res = client.post(
        "/api/speech/synthesize",
        json={"text": "Welcome to class today!", "voice": "friendly_female", "language": "en"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "visemes" in data or "audio_url" in data

def test_video_generate_and_status(client):
    gen_res = client.post(
        "/api/video/generate",
        json={"lesson_id": 1, "section_index": 0}
    )
    assert gen_res.status_code == 200
    data = gen_res.json()
    assert data["status"] == "ready"
    assert "video_id" in data

    status_res = client.get(f"/api/video/{data['video_id']}")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "ready"
