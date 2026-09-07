import json
import hashlib
import math
from typing import List, Dict, Any, Optional
from app.ai.base import LLMProvider, EmbeddingProvider, TTSProvider, STTProvider, AvatarProvider
from app.utils.logger import logger

class DemoLLMProvider(LLMProvider):
    """
    High-fidelity offline AI educator engine providing deterministic,
    structured pedagogical responses for all hackathon test cases.
    """

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        response_format: Optional[str] = None
    ) -> str:
        prompt_lower = prompt.lower()

        # 1. Lesson Planner Prompt
        if "generate a lesson plan" in prompt_lower or "lesson_planner" in (system_prompt or "").lower():
            if "ohm" in prompt_lower or "electricity" in prompt_lower:
                return json.dumps({
                    "title": "Mastering Ohm's Law & Circuit Fundamentals",
                    "subject": "Physics",
                    "learning_objective": "Understand the fundamental relationship between Voltage, Current, and Resistance (V = I * R) and analyze simple circuits.",
                    "target_level": "Beginner",
                    "duration_minutes": 15,
                    "sections": [
                        {
                            "section_index": 0,
                            "title": "Introduction to Electric Charge & Potential (Voltage)",
                            "concept": "Voltage as Electric Pressure",
                            "explanation_text": "Imagine water stored in a high tank. The height creates pressure that pushes water through pipes. In electricity, Voltage (V) is that exact electrical pressure that drives charged electrons through a circuit!",
                            "example_text": "A standard 9-volt battery provides 9 Joules of energy per Coulomb of electric charge.",
                            "analogy_text": "Voltage is like the water pump pressure in your household plumbing.",
                            "visual_type": "svg_diagram",
                            "visual_data": {
                                "diagram_type": "battery_circuit",
                                "elements": [
                                    {"name": "DC Voltage Source (V)", "value": "12V", "type": "battery"},
                                    {"name": "Conductor Wire", "type": "wire"},
                                    {"name": "Current Flow (I)", "type": "arrow"}
                                ]
                            },
                            "visual_caption": "Figure 1: Potential difference (Voltage) driving electric charges",
                            "key_points": [
                                "Voltage (V) is electrical potential difference measured in Volts",
                                "It provides the push needed for electric current to flow",
                                "Without voltage, electrons remain stationary in equilibrium"
                            ],
                            "narration_script": "Hello and welcome! Today we are exploring the heart of electricity. Imagine water in a high tank — that pressure pushing down is just like electrical Voltage.",
                            "estimated_minutes": 3,
                            "questions": [
                                {
                                    "question_type": "mcq",
                                    "question_text": "What is the primary role of Voltage in an electric circuit?",
                                    "options": [
                                        {"id": "A", "text": "It resists the flow of electrons"},
                                        {"id": "B", "text": "It provides the electrical pressure/potential that pushes current"},
                                        {"id": "C", "text": "It destroys charge particles"},
                                        {"id": "D", "text": "It measures how hot the wire gets"}
                                    ],
                                    "correct_answer": "B",
                                    "explanation": "Voltage represents the potential difference that pushes electrons through the conductor.",
                                    "difficulty": "easy",
                                    "concept_tested": "Voltage Definition"
                                }
                            ]
                        },
                        {
                            "section_index": 1,
                            "title": "The Golden Rule: Ohm's Law (V = IR)",
                            "concept": "Interdependence of Voltage, Current, and Resistance",
                            "explanation_text": "Ohm's Law states that the current (I) flowing through a conductor between two points is directly proportional to the voltage (V) across the two points, and inversely proportional to the resistance (R). Mathematically: V = I * R, or I = V / R.",
                            "example_text": "If Voltage V = 12V and Resistance R = 4Ω, the current I = 12 / 4 = 3 Amperes.",
                            "analogy_text": "Think of a water pipe: Current is the volume of water flowing per second. Resistance is narrowing the pipe. If you constrict the pipe (increase resistance) while water pressure (voltage) stays the same, LESS water can pass through!",
                            "visual_type": "katex",
                            "visual_data": {
                                "formula": "V = I \\times R \\implies I = \\frac{V}{R}",
                                "variables": [
                                    {"symbol": "V", "name": "Voltage", "unit": "Volts (V)"},
                                    {"symbol": "I", "name": "Current", "unit": "Amperes (A)"},
                                    {"symbol": "R", "name": "Resistance", "unit": "Ohms (\\Omega)"}
                                ]
                            },
                            "visual_caption": "Ohm's Law Equation & Inverse Relationship between Current and Resistance",
                            "key_points": [
                                "Current is inversely proportional to resistance: I = V / R",
                                "If Resistance increases while Voltage is constant, Current DECREASES",
                                "If Voltage increases while Resistance is constant, Current INCREASES"
                            ],
                            "narration_script": "Now let's examine the cornerstone of electronics: Ohm's Law. Current equals Voltage divided by Resistance. When resistance rises, current is squeezed down.",
                            "estimated_minutes": 5,
                            "questions": [
                                {
                                    "question_type": "mcq",
                                    "question_text": "What happens to current if resistance increases while voltage remains constant?",
                                    "options": [
                                        {"id": "A", "text": "Current increases"},
                                        {"id": "B", "text": "Current decreases"},
                                        {"id": "C", "text": "Current remains unchanged"},
                                        {"id": "D", "text": "Voltage automatically doubles"}
                                    ],
                                    "correct_answer": "B",
                                    "explanation": "Because I = V / R, when R increases, the denominator grows, which forces current I to decrease.",
                                    "difficulty": "medium",
                                    "concept_tested": "Ohm's Law Inverse Relationship"
                                }
                            ]
                        },
                        {
                            "section_index": 2,
                            "title": "Circuit Analysis & Practical Problem Solving",
                            "concept": "Calculating Current in Real Components",
                            "explanation_text": "Let's apply Ohm's Law to a practical real-world scenario. Every appliance has an internal resistance. When connected to a fixed household line (e.g., 120V or 230V), its resistance dictates how much current it draws.",
                            "example_text": "A 60W lightbulb with resistance R = 240Ω connected to a 120V source draws I = 120 / 240 = 0.5A.",
                            "analogy_text": "Just like a thinner nozzle allows less water out of a hose with fixed pressure.",
                            "visual_type": "mermaid",
                            "visual_data": {
                                "diagram": "graph LR\n  Source[120V Source] --> Switch[Closed Switch]\n  Switch --> Resistor[Resistor R = 240 Ohms]\n  Resistor --> Ground[Return / Ground]\n  style Resistor fill:#f59e0b,stroke:#b45309,stroke-width:2px"
                            },
                            "visual_caption": "Mermaid Circuit Diagram: Single loop with 240 Ohm load",
                            "key_points": [
                                "Power dissipation P = V * I = I^2 * R",
                                "Safe current limits prevent overheating and fire hazard",
                                "Fuses and breakers protect against low-resistance short circuits"
                            ],
                            "narration_script": "Excellent progress! Now let's calculate real current in an actual appliance loop.",
                            "estimated_minutes": 4,
                            "questions": [
                                {
                                    "question_type": "short_answer",
                                    "question_text": "A circuit has a 20V battery and a 5 Ohm resistor. Calculate the current in Amperes.",
                                    "options": [],
                                    "correct_answer": "4",
                                    "explanation": "Using I = V / R = 20 / 5 = 4 Amperes.",
                                    "difficulty": "medium",
                                    "concept_tested": "Ohm's Law Calculation"
                                }
                            ]
                        }
                    ]
                })

            # Default generic lesson plan
            topic_clean = prompt.split("Topic:")[-1].split("\n")[0].strip() if "Topic:" in prompt else "Artificial Intelligence"
            return json.dumps({
                "title": f"Fundamentals of {topic_clean}",
                "subject": "Computer Science",
                "learning_objective": f"Develop a comprehensive, grounded mastery of {topic_clean} through visual modeling and adaptive problem solving.",
                "target_level": "Beginner",
                "duration_minutes": 15,
                "sections": [
                    {
                        "section_index": 0,
                        "title": f"Core Foundations of {topic_clean}",
                        "concept": "Foundational Principles & Architecture",
                        "explanation_text": f"Let us break down {topic_clean} into intuitive building blocks. At its core, this discipline focuses on pattern recognition, mathematical optimization, and systematic processing.",
                        "example_text": "Consider how a spam filter identifies junk email based on keyword frequencies and probabilistic scores.",
                        "analogy_text": "It functions like an experienced librarian who categorizes thousands of books within seconds by observing titles and covers.",
                        "visual_type": "mermaid",
                        "visual_data": {
                            "diagram": "graph TD\n  Input[Input Data] --> Features[Feature Extraction]\n  Features --> Model[Predictive Engine]\n  Model --> Output[Actionable Decision]"
                        },
                        "visual_caption": f"Core processing pipeline in {topic_clean}",
                        "key_points": [
                            "Systematic input ingestion and feature transformation",
                            "Mathematical mapping from inputs to desired outcomes",
                            "Continuous feedback loop for accuracy improvement"
                        ],
                        "narration_script": f"Welcome to our session on {topic_clean}. We will start with the fundamental pipeline before exploring advanced applications.",
                        "estimated_minutes": 5,
                        "questions": [
                            {
                                "question_type": "mcq",
                                "question_text": f"What is the primary objective of {topic_clean} in practical workflows?",
                                "options": [
                                    {"id": "A", "text": "To store static files without processing"},
                                    {"id": "B", "text": "To identify patterns and generate accurate decisions from inputs"},
                                    {"id": "C", "text": "To replace all human communication entirely"},
                                    {"id": "D", "text": "To slow down computational tasks"}
                                ],
                                "correct_answer": "B",
                                "explanation": "The core purpose is pattern recognition and predictive decision making from input features.",
                                "difficulty": "easy",
                                "concept_tested": "Core Purpose"
                            }
                        ]
                    }
                ]
            })

        # 2. Misconception & Response Evaluator Prompt
        if "misconception" in prompt_lower or "evaluate the student answer" in prompt_lower or "response_evaluator" in (system_prompt or "").lower():
            # Check for the classic Ohm's Law wrong answer: "increases" / "current increases"
            student_ans = ""
            if "student answer:" in prompt_lower:
                student_ans = prompt_lower.split("student answer:")[1].split("\n")[0].strip()

            if ("increase" in student_ans or student_ans == "a") and ("resistance" in prompt_lower or "ohm" in prompt_lower or "current" in prompt_lower):
                return json.dumps({
                    "is_correct": False,
                    "confidence": 0.95,
                    "detected_misconception": "Direct Proportionality Fallacy: Confusing Resistance with Voltage or assuming all circuit parameters scale together in the same direction.",
                    "explanation": "You said current increases, but remember that Resistance opposes the flow of electrons. According to Ohm's Law, I = V / R. When resistance R increases, the denominator gets bigger, so the current I must decrease!",
                    "adaptation_action": "REEXPLAIN",
                    "remedial_analogy": "Imagine walking through an open hallway versus a crowded hallway. The crowd represents resistance: more crowd makes it harder to move forward, slowing you down. Similarly, higher resistance throttles electrical current.",
                    "new_question": {
                        "question_type": "mcq",
                        "question_text": "If a resistor in a 10V circuit is replaced with a much LARGER resistor, what will happen to the ammeter (current) reading?",
                        "options": [
                            {"id": "A", "text": "The current reading will decrease"},
                            {"id": "B", "text": "The current reading will increase"},
                            {"id": "C", "text": "The current reading will stay identical"},
                            {"id": "D", "text": "The current reading becomes negative"}
                        ],
                        "correct_answer": "A",
                        "explanation": "Higher resistance restricts flow, so the measured current drops.",
                        "difficulty": "easy",
                        "concept_tested": "Ohm's Law Remediation"
                    }
                })

            # Check if student answered correctly: "decrease" / "decreases" / "b" / "4"
            if any(term in student_ans for term in ["decrease", "decreases", "b", "drops", "reduces", "4", "4a", "4 amperes"]):
                return json.dumps({
                    "is_correct": True,
                    "confidence": 0.98,
                    "detected_misconception": None,
                    "explanation": "Spot on! Because Current equals Voltage divided by Resistance (I = V / R), increasing the resistance R throttles the current down. You've clearly grasped the inverse relationship.",
                    "adaptation_action": "CONTINUE",
                    "remedial_analogy": None,
                    "new_question": None
                })

            # General fallback evaluation
            return json.dumps({
                "is_correct": True,
                "confidence": 0.85,
                "detected_misconception": None,
                "explanation": "Great explanation. Your reasoning aligns well with the core principles of this concept.",
                "adaptation_action": "CONTINUE",
                "remedial_analogy": None,
                "new_question": None
            })

        # 3. Contextual Ask Teacher prompt
        if "ask teacher" in prompt_lower or "contextual question" in prompt_lower:
            return json.dumps({
                "teacher_reply": "That is an insightful question! In this section, we see that Voltage acts as the potential energy per unit charge, while Resistance dictates the frictional opposition. Always keep the equation I = V / R in mind whenever you want to predict how changing one variable alters the others.",
                "concept_referenced": "Ohm's Law & Circuit Analysis",
                "source_citation": "Source: Physics Principles, Chapter 4, Section 2 (Page 48)",
                "recommended_focus": "Focus on the ratio between Voltage and Resistance"
            })

        # Default fallback output
        return "I am your AI Educator. Let's continue exploring this subject together step-by-step!"

class DemoEmbeddingProvider(EmbeddingProvider):
    """
    Deterministic pseudo-embedding provider using SHA256 character-ngram
    projection into a unit-normalized 128-dimensional vector.
    Enables instant vector similarity search and RAG retrieval offline!
    """

    async def embed_text(self, text: str) -> List[float]:
        dim = 128
        vec = [0.0] * dim
        words = text.lower().split()
        if not words:
            return vec

        for word in words:
            h = int(hashlib.sha256(word.encode('utf-8')).hexdigest(), 16)
            for i in range(dim):
                bit = (h >> (i % 64)) & 1
                vec[i] += (1.0 if bit else -1.0)

        # Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        results = []
        for text in texts:
            results.append(await self.embed_text(text))
        return results

class DemoTTSProvider(TTSProvider):
    async def synthesize(self, text: str, voice: str = "default", language: str = "en") -> Dict[str, Any]:
        # If server-side TTS is enabled, register the text and return an audio URL
        import os
        import hashlib
        from app.utils.logger import logger

        estimated_duration = max(2.0, len(text.split()) * 0.4)

        if os.getenv("ENABLE_SERVER_TTS", "0") == "1":
            # Create a stable short id for the requested text
            audio_id = hashlib.sha256(text.encode('utf-8')).hexdigest()[:12]
            try:
                # Lazy import to avoid circulars; register the text for on-demand audio generation
                from app.speech.tts import register_text_for_audio

                register_text_for_audio(audio_id, text, voice=voice, language=language)
                logger.info(f"Registered server-side TTS audio id={audio_id}")
                return {
                    "mode": "server_audio",
                    "audio_id": audio_id,
                    "audio_url": f"/api/speech/audio/{audio_id}",
                    "estimated_duration_seconds": estimated_duration,
                    "voice": voice,
                }
            except Exception:
                # Fall back to client speech if registration fails
                logger.exception("Failed to register server TTS; falling back to client_speech")

        # Default: Return structured cues for client-side Web Speech synthesis
        return {
            "mode": "client_speech",
            "text": text,
            "language": language,
            "estimated_duration_seconds": estimated_duration,
            "voice": voice,
            "visemes": [
                {"time": 0.0, "value": "sil"},
                {"time": 0.1, "value": "aa"},
                {"time": 0.2, "value": "ee"},
                {"time": 0.3, "value": "oo"}
            ]
        }

class DemoSTTProvider(STTProvider):
    async def transcribe(self, audio_data: bytes, language: Optional[str] = None) -> str:
        return "Current increases when resistance increases"

class DemoAvatarProvider(AvatarProvider):
    async def generate_avatar_cues(self, text: str, mood: str = "explaining") -> Dict[str, Any]:
        word_count = len(text.split())
        duration = max(2.0, word_count * 0.35)
        return {
            "mood": mood,  # neutral, explaining, happy, thinking, encouraging, adjusting
            "duration_seconds": duration,
            "visemes": [
                {"time": 0.0, "value": "sil"},
                {"time": 0.1, "value": "aa"},
                {"time": 0.2, "value": "ee"},
                {"time": 0.3, "value": "oo"},
                {"time": 0.4, "value": "sil"}
            ],
            "visemes_rate": 3.5,
            "gesture": "pointing_visual" if mood == "explaining" else "nodding",
            "mouth_open_sequence": [0.1, 0.6, 0.9, 0.4, 0.8, 0.2, 0.7, 0.0]
        }
