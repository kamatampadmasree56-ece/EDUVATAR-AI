from typing import Dict, Any, Optional
from app.models.user import LearnerProfile

class LearnerAnalyzer:
    """
    Analyzes learner profile parameters to tune lesson pacing,
    pedagogical tone, depth, and analogy domain.
    """

    @staticmethod
    def analyze_profile(profile: Optional[LearnerProfile]) -> Dict[str, Any]:
        if not profile:
            return {
                "education_level": "High School",
                "teaching_style": "Friendly Mentor",
                "language": "English",
                "target_depth": "standard",
                "pacing": "moderate",
                "tone_instruction": "Warm, encouraging, and clear."
            }

        style = profile.teaching_style or "Friendly Mentor"
        level = profile.education_level or "High School"
        language = profile.preferred_language or "English"

        tone_map = {
            "Professor": "Authoritative, structured, and academically rigorous with historical context.",
            "Friendly Mentor": "Supportive, enthusiastic, conversational, and filled with relatable real-world analogies.",
            "Strict Exam Coach": "Direct, focused on exam patterns, high scoring strategies, and avoiding pitfalls.",
            "Patient Tutor": "Gentle, reassuring, breaking complex terms into tiny intuitive micro-steps.",
            "Coding Mentor": "Pragmatic, syntax-aware, logic-driven, and focused on runnable examples and edge cases."
        }

        depth_map = {
            "Middle School": "introductory",
            "High School": "standard",
            "Undergraduate": "rigorous",
            "Professional": "applied_industry"
        }

        return {
            "education_level": level,
            "teaching_style": style,
            "language": language,
            "target_depth": depth_map.get(level, "standard"),
            "pacing": "slow" if profile.current_knowledge == "Beginner" else "moderate",
            "available_daily_time": profile.available_daily_time or 20,
            "tone_instruction": tone_map.get(style, "Encouraging and pedagogical.")
        }
