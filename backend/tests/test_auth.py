def test_demo_user_login(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "student@eduvatar.ai", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "student@eduvatar.ai"
    assert data["user"]["full_name"] == "Alex Mercer (Demo Student)"

def test_user_registration(client):
    payload = {
        "email": "newstudent@example.com",
        "password": "securepassword123",
        "full_name": "Taylor Swift",
        "education_level": "Undergraduate",
        "subject_interests": ["Physics", "Computer Science"],
        "current_knowledge": "Intermediate",
        "learning_goal": "Prepare for quantum mechanics",
        "teaching_style": "Visual Socratic",
        "available_daily_time": 30
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newstudent@example.com"
    assert data["user"]["profile"]["education_level"] == "Undergraduate"

def test_user_registration_duplicate_email(client):
    payload = {
        "email": "student@eduvatar.ai",
        "password": "password123",
        "full_name": "Duplicate Student"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_invalid_password(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "student@eduvatar.ai", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_get_me(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "student@eduvatar.ai"
    assert "profile" in data
    assert data["profile"]["study_streak_days"] >= 1

def test_update_profile(client, auth_headers):
    update_payload = {
        "learning_goal": "Master advanced circuit theory and electromagnetism",
        "available_daily_time": 45,
        "difficulty_preference": "Challenging"
    }
    response = client.put("/api/auth/profile", json=update_payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["learning_goal"] == "Master advanced circuit theory and electromagnetism"
    assert data["available_daily_time"] == 45
    assert data["difficulty_preference"] == "Challenging"
