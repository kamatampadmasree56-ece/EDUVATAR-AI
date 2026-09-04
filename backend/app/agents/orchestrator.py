from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.agents.learner_analyzer import LearnerAnalyzer
from app.agents.lesson_planner import LessonPlanner
from app.agents.visual_planner import VisualPlanner
from app.agents.misconception_detector import MisconceptionDetector
from app.agents.adaptation_engine import AdaptationEngine
from app.models.user import User

class TeacherOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.analyzer = LearnerAnalyzer()
        self.planner = LessonPlanner()
        self.visual_planner = VisualPlanner()
        self.misconception_detector = MisconceptionDetector()
        self.adaptation_engine = AdaptationEngine(db)

    async def create_personalized_curriculum(
        self,
        user: User,
        topic: str,
        subject: str = "General",
        rag_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes UNDERSTAND -> PLAN -> EXPLAIN -> DEMONSTRATE -> VISUALIZE
        """
        # 1. UNDERSTAND learner
        learner_info = self.analyzer.analyze(user, topic)

        # 2. PLAN & EXPLAIN & DEMONSTRATE curriculum
        curriculum = await self.planner.plan_lesson(
            topic=topic,
            subject=subject,
            learner_profile=learner_info,
            rag_context=rag_context
        )

        # 3. ENRICH visuals for each section
        if "sections" in curriculum:
            for sec in curriculum["sections"]:
                sec["visual_data"] = self.visual_planner.enrich_visual(
                    subject=subject,
                    concept=sec.get("concept", ""),
                    visual_type=sec.get("visual_type", "katex"),
                    raw_data=sec.get("visual_data", {})
                )

        return curriculum

    async def evaluate_student_checkpoint(
        self,
        user_id: int,
        subject: str,
        concept: str,
        question_text: str,
        correct_answer: str,
        student_answer: str,
        teaching_style: str = "Friendly Mentor",
        response_time_seconds: float = 5.0
    ) -> Dict[str, Any]:
        """
        Executes QUESTION -> EVALUATE -> ADAPT -> CONTINUE
        """
        # 1. EVALUATE & DETECT MISCONCEPTIONS
        evaluation = await self.misconception_detector.evaluate_answer(
            question_text=question_text,
            correct_answer=correct_answer,
            student_answer=student_answer,
            concept=concept,
            teaching_style=teaching_style,
            response_time_seconds=response_time_seconds
        )

        # 2. ADAPT & UPDATE MASTERY
        is_correct = evaluation.get("is_correct", False)
        misconception = evaluation.get("detected_misconception")
        updated_mastery = self.adaptation_engine.update_mastery(
            user_id=user_id,
            subject=subject,
            concept=concept,
            is_correct=is_correct,
            detected_misconception=misconception
        )

        evaluation["updated_mastery"] = updated_mastery
        return evaluation
