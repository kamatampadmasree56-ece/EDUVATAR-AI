from typing import Dict, Any

class AdaptationEngine:
    """
    Dynamically adjusts student mastery score and pedagogical difficulty
    based on student response accuracy, confidence, and latency.
    """

    @staticmethod
    def calculate_new_mastery(
        current_mastery: float,
        is_correct: bool,
        confidence: float = 0.8,
        response_time_seconds: float = 5.0,
        has_misconception: bool = False
    ) -> float:
        # Pacing bonus: reasonable fast responses show higher fluency
        time_factor = 1.0
        if response_time_seconds < 10.0:
            time_factor = 1.1
        elif response_time_seconds > 45.0:
            time_factor = 0.9

        if is_correct:
            gain = 15.0 * confidence * time_factor
            new_val = min(100.0, current_mastery + gain)
        else:
            penalty = 12.0 if has_misconception else 8.0
            new_val = max(10.0, current_mastery - penalty)

        return round(new_val, 1)

    @staticmethod
    def get_recommended_difficulty(mastery: float) -> str:
        if mastery >= 80.0:
            return "hard"
        elif mastery >= 50.0:
            return "medium"
        else:
            return "easy"
