export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  profile?: LearnerProfile;
}

export interface LearnerProfile {
  id?: number;
  education_level: string;
  subject_interests: string[];
  current_knowledge: string;
  learning_goal: string;
  preferred_language: string;
  teaching_style: string;
  available_daily_time: number;
  difficulty_preference: string;
  study_streak_days: number;
  total_study_minutes: number;
  completed_lessons_count: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  question_type: string;
  question_text: string;
  options: QuestionOption[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  concept_tested: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subject: string;
  level: string;
  duration: string;
  sections_count: number;
  description: string;
  icon: string;
  color: string;
  featured: boolean;
  visual_type: string;
}

export interface LessonScene {
  scene_id: number;
  title: string;
  type: string;
  script?: string;
  text?: string;
  visual_type?: string;
}

export interface LessonSection {
  id?: number;
  section_index: number;
  title: string;
  concept: string;
  explanation_text: string;
  example_text?: string;
  analogy_text?: string;
  prerequisites?: string[];
  importance?: 'essential' | 'high' | 'medium' | 'advanced';
  status?: 'not_started' | 'in_progress' | 'completed' | 'review_needed' | 'locked';
  scenes?: LessonScene[];
  visual_type: 'katex' | 'svg_diagram' | 'circuit_simulation' | 'mermaid' | 'code' | 'flowchart' | 'neural_net' | 'speedometer' | 'energy_diagram' | 'dna_helix';
  visual_data: Record<string, any>;
  visual_caption?: string;
  key_points: string[];
  narration_script?: string;
  estimated_minutes: number;
  questions: Question[];
}

export interface CurriculumSummary {
  total_concepts: number;
  completed_concepts_count: number;
  estimated_total_minutes: number;
  prerequisites_tree?: string[];
  continuation_plan?: string;
}

export interface Lesson {
  id: number;
  user_id: number;
  document_id?: number | null;
  title: string;
  subject: string;
  learning_objective: string;
  learning_mode?: 'complete_learning' | 'quick_overview' | 'exam_prep' | 'revision' | 'deep_dive' | 'chapter_mode';
  target_level: string;
  duration_minutes: number;
  language: string;
  teaching_style: string;
  total_sections: number;
  current_section_index: number;
  current_mastery: number;
  status: string;
  curriculum_summary?: CurriculumSummary;
  sections: LessonSection[];
  created_at: string;
}

export interface EvaluationResult {
  is_correct: boolean;
  confidence: number;
  detected_misconception?: string | null;
  ai_feedback: string;
  adaptation_action: string; // CONTINUE, SIMPLIFY, REEXPLAIN, NEW_ANALOGY, MORE_EXAMPLES, LOWER_DIFFICULTY, INCREASE_DIFFICULTY
  remedial_analogy?: string | null;
  remedial_visual?: Record<string, any> | null;
  updated_mastery: number;
  next_action: string;
}

export interface TeacherAnswer {
  answer: string;
  analogy?: string | null;
  suggested_visual?: Record<string, any> | null;
  avatar_emotion: string;
  follow_up_question?: string | null;
}

export interface AvatarState {
  emotion: 'explaining' | 'encouraging' | 'thinking' | 'celebratory' | 'surprised' | 'listening';
  is_speaking: boolean;
  viseme: 'sil' | 'aa' | 'ee' | 'oo' | 'mm';
  gesture: string;
}

export interface DocumentChunk {
  id: number;
  chunk_index: number;
  page_number: number;
  chapter: string;
  section_title: string;
  content: string;
  metadata: Record<string, any>;
}

export interface DocumentItem {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  title: string;
  subject: string;
  total_pages: number;
  total_chunks: number;
  status: string;
  created_at: string;
}

export interface DocumentCitation {
  document_id: number;
  filename: string;
  page: number;
  chapter: string;
  section: string;
  chunk_id: number;
  snippet: string;
  relevance_score: number;
}

export interface AssessmentQuestion {
  id: number;
  question_text: string;
  question_type: string;
  options: { id: string; text: string }[];
  concept: string;
  points?: number;
}

export interface Assessment {
  id: number;
  user_id: number;
  lesson_id?: number | null;
  title: string;
  subject: string;
  total_score: number;
  passed: boolean;
  strong_concepts: string[];
  weak_concepts: string[];
  misconceptions: string[];
  recommended_revision: string;
  recommended_next_topic: string;
  questions: AssessmentQuestion[];
  created_at: string;
}

export interface ConceptReviewItem {
  concept: string;
  status: 'mastered' | 'review_needed';
  feedback: string;
  remedial_tip?: string | null;
}

export interface ReportCard {
  assessment_id: number;
  score_percentage: number;
  total_score: number;
  max_score: number;
  passed: boolean;
  grade: string;
  teacher_summary: string;
  mastered_concepts: string[];
  detected_misconceptions: { concept: string; misconception: string }[];
  concept_reviews: ConceptReviewItem[];
  next_recommended_topic: string;
  next_recommended_lesson_id?: number | null;
}

export interface ConceptRadarPoint {
  concept: string;
  mastery: number;
  subject: string;
}

export interface StudyAnalytics {
  streak_days: number;
  total_minutes: number;
  completed_lessons: number;
  average_mastery: number;
  strong_concepts: string[];
  weak_concepts: string[];
  concept_radar: ConceptRadarPoint[];
  recent_activity: { action: string; topic: string; time: string; badge: string }[];
}

export interface RoadmapNode {
  id: string;
  title: string;
  subject: string;
  description: string;
  prerequisites: string[];
  difficulty: string;
  estimated_minutes: number;
  mastery_level: number;
  is_unlocked: boolean;
  is_completed: boolean;
}

export interface LearningPath {
  id: number;
  subject: string;
  title: string;
  nodes: RoadmapNode[];
  edges: { from: string; to: string }[];
  current_node_id?: string | null;
  overall_progress: number;
}
