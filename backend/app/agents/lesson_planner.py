import json
from typing import Dict, Any, Optional, List
from app.ai.factory import get_llm_provider
from app.agents.prompts import LESSON_PLANNER_PROMPT
from app.agents.learner_analyzer import LearnerAnalyzer
from app.agents.visual_planner import VisualPlanner
from app.models.user import LearnerProfile
from app.utils.logger import logger

class LessonPlanner:
    def __init__(self):
        self.llm = get_llm_provider()

class LessonPlanner:
    def __init__(self):
        self.llm = get_llm_provider()

    async def create_plan(
        self,
        topic: Optional[str],
        profile: Optional[LearnerProfile],
        rag_context: Optional[str] = None,
        duration_minutes: int = 60,
        target_level: str = "Beginner",
        language: str = "English",
        learning_mode: str = "complete_learning"
    ) -> Dict[str, Any]:
        learner_info = LearnerAnalyzer.analyze_profile(profile)
        subject_name = topic or "General Science"

        prompt = f"""
Generate a COMPLETE TOPIC CURRICULUM lesson plan for:
Requested Topic: {topic or 'Core Fundamentals'}
Learning Mode: {learning_mode} (complete_learning, quick_overview, exam_prep, revision, deep_dive, chapter_mode)
Target Level: {target_level} (Beginner, Intermediate, Advanced)
Available Time Budget: {duration_minutes} minutes
Preferred Language: {language}
Learner Profile: {json.dumps(learner_info)}

RAG Grounding Document Context:
{rag_context or 'No specific document uploaded. Ground in complete, validated subject curriculum.'}

MANDATORY RULES:
1. Decompose '{topic or "the topic"}' systematically into ALL essential concepts from BEGINNING -> END.
2. For 'complete_learning', generate 6 to 16 ordered concepts. DO NOT stop after concept 1.
3. Order concepts strictly by prerequisite dependencies.
4. Each concept MUST have:
   - title, concept, explanation_text, example_text, analogy_text
   - prerequisites: array of prerequisite concept names
   - importance: 'essential' | 'high' | 'medium' | 'advanced'
   - status: 'not_started' for future concepts, 'in_progress' for the first concept
   - 5 to 7 multi-scene video objects (Intro, Explanation, Visual Lab, Analogy, Checkpoint Quiz, Remedy, Mastery)
   - 1 or 2 diagnostic questions
5. Return JSON strictly matching the LESSON_PLANNER_PROMPT schema.
"""
        try:
            raw_response = await self.llm.generate(
                prompt=prompt,
                system_prompt=LESSON_PLANNER_PROMPT,
                temperature=0.5,
                response_format="json"
            )
            plan = json.loads(raw_response)
            
            plan["learning_mode"] = learning_mode
            
            # Enrich visuals and scenes for each section
            sections = plan.get("sections", [])
            for idx, section in enumerate(sections):
                section["section_index"] = idx
                section["status"] = "in_progress" if idx == 0 else "not_started"
                if not section.get("prerequisites"):
                    section["prerequisites"] = [sections[idx-1]["concept"]] if idx > 0 else []
                if not section.get("importance"):
                    section["importance"] = "essential" if idx < 3 else "high"
                
                # Visual planning fallback
                if not section.get("visual_data"):
                    vis = VisualPlanner.plan_visual(plan.get("subject", subject_name), section.get("concept", ""))
                    section["visual_type"] = vis["visual_type"]
                    section["visual_data"] = vis["visual_data"]
                    section["visual_caption"] = vis["visual_caption"]
                
                # Multi-scene video lesson fallback
                if not section.get("scenes"):
                    section["scenes"] = [
                        {"scene_id": 1, "title": f"Intro to {section.get('concept')}", "type": "talking_head", "script": f"Welcome! Let's explore {section.get('concept')}."},
                        {"scene_id": 2, "title": "Core Explanation", "type": "explanation", "text": section.get("explanation_text")},
                        {"scene_id": 3, "title": "Interactive Visual Lab", "type": "simulation", "visual_type": section.get("visual_type")},
                        {"scene_id": 4, "title": "Real-World Analogy", "type": "analogy", "text": section.get("analogy_text")},
                        {"scene_id": 5, "title": "Checkpoint Question", "type": "interactive_quiz"},
                        {"scene_id": 6, "title": "Concept Mastery", "type": "celebration"}
                    ]

            plan["curriculum_summary"] = {
                "total_concepts": len(sections),
                "completed_concepts_count": 0,
                "estimated_total_minutes": duration_minutes,
                "prerequisites_tree": [f"{s.get('concept')} (Prereq: {', '.join(s.get('prerequisites', [])) or 'None'})" for s in sections],
                "continuation_plan": f"Systematic multi-session coverage of all {len(sections)} concepts in {topic or 'the topic'}."
            }
            
            return plan
        except Exception as e:
            logger.error(f"Lesson planner failed to parse LLM output: {e}. Generating structured multi-concept curriculum fallback.")
            return self._generate_fallback_curriculum(topic or "Ohm's Law & Circuit Dynamics", target_level, duration_minutes, learning_mode)

    def _generate_fallback_curriculum(self, topic: str, target_level: str, duration_minutes: int, learning_mode: str) -> Dict[str, Any]:
        """Generates a complete multi-concept curriculum fallback for key subjects."""
        topic_lower = topic.lower()
        if "os" in topic_lower or "operating system" in topic_lower:
            concepts = [
                ("Introduction to Operating Systems", "OS Architecture & Kernel Roles", "essential", "katex", "Like a building manager coordinating tenants and elevator access."),
                ("OS Functions & Services", "Process, Memory, and File System Abstractions", "essential", "flowchart", "Like an API translating generic requests to specific hardware drivers."),
                ("Processes & Process States", "Process Control Blocks (PCB) & Lifecycle", "high", "mermaid", "A program is a recipe on paper; a process is the chef actively cooking it."),
                ("Process Scheduling", "Preemptive vs Non-Preemptive CPU Schedulers", "high", "speedometer", "Like an air traffic controller directing planes on runways."),
                ("Threads & Concurrency", "User vs Kernel Threads & Multithreading", "high", "code", "Like multiple chefs working in the same kitchen sharing spices."),
                ("Synchronization & Mutexes", "Critical Sections, Race Conditions & Semaphores", "high", "mermaid", "Like a single bathroom key at a coffee shop."),
                ("Deadlocks & Banker's Algorithm", "Coffman Conditions & Deadlock Avoidance", "high", "mermaid", "Four cars arriving simultaneously at a 4-way stop intersection."),
                ("Memory Management & Paging", "Physical vs Logical Address Spaces", "high", "katex", "Like cataloging books in a library by row and shelf numbers."),
                ("Virtual Memory & Page Faults", "Demand Paging & Page Replacement Algorithms", "advanced", "speedometer", "Using a small desk while keeping most books in a storage cabinet."),
                ("File Systems & I/O", "Inodes, Directories & Disk Scheduling", "medium", "flowchart", "A filing cabinet index mapping named files to drawer locations.")
            ]
            subject = "Computer Science"
        else:
            # Default Physics / Ohm's Law complete curriculum
            concepts = [
                ("Voltage & Electric Potential", "Voltage as Electromotive Force (V)", "essential", "circuit_simulation", "Water pressure generated by a pump in a closed loop."),
                ("Current & Charge Flow", "Current Flow Rate (I = Q/t)", "essential", "circuit_simulation", "Gallons of water flowing through the pipe per second."),
                ("Resistance & Resistivity", "Electrical Resistance (R = rho * L / A)", "essential", "circuit_simulation", "Narrowing or friction inside the water pipe."),
                ("Ohm's Law Governing Equation", "V = I * R Relationship", "essential", "katex", "Pushing harder (higher V) increases flow (I) unless restricted (R)."),
                ("Power & Energy Dissipation", "Joule Heating & Power (P = V * I)", "high", "katex", "Heat generated by friction as water forces through narrow valve."),
                ("Series & Parallel Circuits", "Equivalent Resistance Calculations", "high", "circuit_simulation", "Single path vs multiple parallel pipes carrying water flow.")
            ]
            subject = "Physics"

        sections = []
        for idx, (title, concept, importance, vis_type, analogy) in enumerate(concepts):
            default_vis = VisualPlanner.plan_visual(subject, concept)
            sections.append({
                "section_index": idx,
                "title": f"{idx+1}. {title}",
                "concept": concept,
                "prerequisites": [concepts[idx-1][1]] if idx > 0 else [],
                "importance": importance,
                "status": "in_progress" if idx == 0 else "not_started",
                "explanation_text": f"Systematic breakdown of {concept}. Understanding its role in {topic}.",
                "example_text": f"Practical application of {concept} in real-world engineering.",
                "analogy_text": analogy,
                "visual_type": default_vis["visual_type"],
                "visual_data": default_vis["visual_data"],
                "visual_caption": default_vis["visual_caption"],
                "key_points": [f"Core principle of {concept}", "Prerequisite for subsequent concepts"],
                "narration_script": f"Welcome to concept {idx+1}: {title}. Let's understand {concept}.",
                "estimated_minutes": 5,
                "scenes": [
                    {"scene_id": 1, "title": f"Intro to {concept}", "type": "talking_head"},
                    {"scene_id": 2, "title": "Visual Lab", "type": "simulation", "visual_type": default_vis["visual_type"]},
                    {"scene_id": 3, "title": "Checkpoint Quiz", "type": "interactive_quiz"}
                ],
                "questions": [
                    {
                        "question_type": "mcq",
                        "question_text": f"What is the fundamental role of {concept} in {topic}?",
                        "options": [
                            {"id": "A", "text": f"It establishes the foundation for {title}"},
                            {"id": "B", "text": "It is an unrelated auxiliary component"},
                            {"id": "C", "text": "It decreases system performance"},
                            {"id": "D", "text": "It applies only in quantum mechanics"}
                        ],
                        "correct_answer": "A",
                        "explanation": f"{title} forms a critical prerequisite building block.",
                        "difficulty": "medium",
                        "concept_tested": concept
                    }
                ]
            })

        return {
            "title": f"Complete Curriculum: {topic}",
            "subject": subject,
            "learning_mode": learning_mode,
            "learning_objective": f"Master the complete scope of {topic} systematically from fundamentals to applications.",
            "target_level": target_level,
            "duration_minutes": duration_minutes,
            "curriculum_summary": {
                "total_concepts": len(sections),
                "completed_concepts_count": 0,
                "estimated_total_minutes": duration_minutes,
                "prerequisites_tree": [f"{s['concept']} (Prereq: {', '.join(s['prerequisites']) or 'None'})" for s in sections],
                "continuation_plan": f"Complete multi-session coverage of all {len(sections)} concepts in {topic}."
            },
            "sections": sections
        }
