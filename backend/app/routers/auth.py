import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, LearnerProfile
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
    LearnerProfileResponse,
    LearnerProfileUpdate
)
from app.utils.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def ensure_demo_user(db: Session):
    demo = db.query(User).filter(User.email == "student@eduvatar.ai").first()
    if not demo:
        demo = User(
            email="student@eduvatar.ai",
            hashed_password=hash_password("password123"),
            full_name="Alex Mercer (Demo Student)"
        )
        db.add(demo)
        db.flush()
        
        profile = LearnerProfile(
            user_id=demo.id,
            education_level="High School",
            subject_interests=["Physics", "Artificial Intelligence", "Mathematics"],
            current_knowledge="Beginner",
            learning_goal="Master core STEM principles with intuitive visual models",
            preferred_language="English",
            teaching_style="Friendly Mentor",
            available_daily_time=20,
            difficulty_preference="Adaptive",
            study_streak_days=5,
            total_study_minutes=140,
            completed_lessons_count=4
        )
        db.add(profile)
        db.commit()
        db.refresh(demo)
    return demo

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name
    )
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        education_level=user_in.education_level or "High School",
        subject_interests=user_in.subject_interests or ["Physics"],
        current_knowledge=user_in.current_knowledge or "Beginner",
        learning_goal=user_in.learning_goal or "Master concepts",
        preferred_language=user_in.preferred_language or "English",
        teaching_style=user_in.teaching_style or "Friendly Mentor",
        available_daily_time=user_in.available_daily_time or 20,
        difficulty_preference=user_in.difficulty_preference or "Adaptive"
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    # Auto-seed demo student if database is fresh
    ensure_demo_user(db)

    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.profile:
        # Create default profile if absent
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.put("/profile", response_model=LearnerProfileResponse)
def update_profile(
    profile_in: LearnerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return LearnerProfileResponse.model_validate(profile)
