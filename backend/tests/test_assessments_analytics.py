def test_generate_assessment(client, auth_headers):
    payload = {
        "subject": "Physics",
        "topic": "Ohm's Law & Circuits",
        "difficulty": "medium",
        "question_count": 3
    }
    res = client.post("/api/assessment/generate", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["subject"] == "Physics"
    assert len(data["questions"]) >= 3
    assert "options" in data["questions"][0]

def test_submit_assessment_perfect_score(client, auth_headers):
    # Generate assessment first
    gen_res = client.post(
        "/api/assessment/generate",
        json={"subject": "Physics", "topic": "Ohm's Law", "question_count": 3},
        headers=auth_headers
    )
    assessment = gen_res.json()
    assessment_id = assessment["id"]

    # Answer all questions correctly (answers are 'B')
    answers = [
        {"question_id": q["id"], "student_answer": "B"}
        for q in assessment["questions"]
    ]

    sub_res = client.post(
        "/api/assessment/submit",
        json={"assessment_id": assessment_id, "answers": answers},
        headers=auth_headers
    )
    assert sub_res.status_code == 200
    result = sub_res.json()
    assert result["total_score"] == 100.0
    assert result["passed"] is True
    assert len(result["strong_concepts"]) > 0

def test_submit_assessment_with_misconceptions(client, auth_headers):
    gen_res = client.post(
        "/api/assessment/generate",
        json={"subject": "Physics", "topic": "Ohm's Law", "question_count": 3},
        headers=auth_headers
    )
    assessment = gen_res.json()
    assessment_id = assessment["id"]

    # Deliberately submit incorrect answers
    answers = [
        {"question_id": q["id"], "student_answer": "D"}
        for q in assessment["questions"]
    ]

    sub_res = client.post(
        "/api/assessment/submit",
        json={"assessment_id": assessment_id, "answers": answers},
        headers=auth_headers
    )
    assert sub_res.status_code == 200
    result = sub_res.json()
    assert result["total_score"] == 0.0
    assert result["passed"] is False
    assert len(result["weak_concepts"]) > 0

def test_analytics_dashboard(client, auth_headers):
    res = client.get("/api/analytics/dashboard", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "study_streak_days" in data
    assert "total_study_minutes" in data
    assert "average_score" in data
    assert "concept_mastery_list" in data
    assert len(data["concept_mastery_list"]) > 0
    assert "recommended_topics" in data

def test_learning_path_roadmap(client, auth_headers):
    res = client.get("/api/learning-path", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["subject"] == "Physics"
    assert "nodes" in data
    assert len(data["nodes"]) >= 3
    # Check node status values
    assert any(n["status"] == "active" for n in data["nodes"])
    assert any(n["status"] == "completed" for n in data["nodes"])
