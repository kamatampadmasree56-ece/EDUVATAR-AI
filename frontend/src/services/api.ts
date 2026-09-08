import {
  User,
  Lesson,
  Course,
  EvaluationResult,
  TeacherAnswer,
  AvatarState,
  DocumentItem,
  DocumentCitation,
  Assessment,
  ReportCard,
  StudyAnalytics,
  LearningPath
} from '../types';

const RAW_API_URL = (import.meta as any).env?.VITE_API_URL || '';
const API_BASE = RAW_API_URL ? `${RAW_API_URL.replace(/\/$/, '')}/api` : '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('eduvatar_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  // If body is FormData, delete Content-Type so browser sets boundary
  if (options.body instanceof FormData) {
    delete (headers as Record<string, string>)['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch {
      // fallback to status text
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

// -------------------------------------------------------------
// Authentication API
// -------------------------------------------------------------
export const authApi = {
  async register(data: {
    email: string;
    password: string;
    full_name: string;
    education_level?: string;
    subject_interests?: string[];
    current_knowledge?: string;
    learning_goal?: string;
    preferred_language?: string;
    teaching_style?: string;
    available_daily_time?: number;
  }): Promise<{ access_token: string; user: User }> {
    const res = await request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('eduvatar_token', res.access_token);
    return res;
  },

  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('eduvatar_token', res.access_token);
    return res;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  async updateProfile(data: {
    education_level?: string;
    subject_interests?: string[];
    current_knowledge?: string;
    learning_goal?: string;
    preferred_language?: string;
    teaching_style?: string;
    available_daily_time?: number;
    difficulty_preference?: string;
  }): Promise<User['profile']> {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout() {
    localStorage.removeItem('eduvatar_token');
  }
};

// -------------------------------------------------------------
// Demo API
// -------------------------------------------------------------
export const demoApi = {
  async seedOhmsLaw(): Promise<Lesson> {
    return request<Lesson>('/demo/reset-ohms-law', {
      method: 'POST',
    });
  },

  async listCourses(): Promise<Course[]> {
    return request<Course[]>('/demo/courses');
  },

  async startCourse(slug: string): Promise<Lesson> {
    return request<Lesson>(`/demo/select-course/${slug}`, {
      method: 'POST',
    });
  },
};

// -------------------------------------------------------------
// Lessons API
// -------------------------------------------------------------
export const lessonApi = {
  async generateLesson(data: {
    title: string;
    topic?: string;
    subject?: string;
    document_id?: number;
    target_level?: string;
    duration_minutes?: number;
    language?: string;
    teaching_style?: string;
    learning_objective?: string;
    learning_mode?: string;
  }): Promise<Lesson> {
    return request<Lesson>('/lessons/generate', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        topic: data.topic || data.title,
      }),
    });
  },

  async listLessons(): Promise<Lesson[]> {
    return request<Lesson[]>('/lessons');
  },

  async getLesson(id: number): Promise<Lesson> {
    return request<Lesson>(`/lessons/${id}`);
  },

  async selectConcept(lessonId: number, sectionIndex: number): Promise<Lesson> {
    return request<Lesson>(`/lessons/${lessonId}/select-concept/${sectionIndex}`, {
      method: 'POST',
    });
  },

  async resumeLesson(lessonId: number): Promise<Lesson> {
    return request<Lesson>(`/lessons/${lessonId}/resume`, {
      method: 'POST',
    });
  }
};

// -------------------------------------------------------------
// Interactive Teaching API
// -------------------------------------------------------------
export const teachingApi = {
  async submitAnswer(lessonId: number, questionId: number, answer: string, responseTimeSec: number = 4.5): Promise<EvaluationResult> {
    return request<EvaluationResult>('/teaching/respond', {
      method: 'POST',
      body: JSON.stringify({
        lesson_id: lessonId,
        question_id: questionId,
        student_answer: answer,
        response_time_seconds: responseTimeSec,
      }),
    });
  },

  async askTeacher(lessonId: number, currentSectionIndex: number, userQuery: string): Promise<TeacherAnswer> {
    const response = await request<{
      teacher_reply: string;
      concept_referenced: string;
      source_citation?: string | null;
      recommended_focus?: string | null;
    }>('/teaching/ask', {
      method: 'POST',
      body: JSON.stringify({
        lesson_id: lessonId,
        current_section_index: currentSectionIndex,
        student_question: userQuery,
      }),
    });
    return {
      answer: response.teacher_reply,
      analogy: response.recommended_focus,
      avatar_emotion: 'explaining',
    };
  },

  async getAvatarState(emotion: string = 'explaining', isSpeaking: boolean = false): Promise<AvatarState> {
    return request<AvatarState>(`/teaching/avatar-state?emotion=${emotion}&is_speaking=${isSpeaking}`);
  }
};

// -------------------------------------------------------------
// Assessments API
// -------------------------------------------------------------
export const assessmentApi = {
  async createAssessment(lessonId?: number, title?: string, subject?: string): Promise<Assessment> {
    return request<Assessment>('/assessments/create', {
      method: 'POST',
      body: JSON.stringify({
        lesson_id: lessonId,
        title: title || 'Circuit Mastery Diagnostic',
        subject: subject || 'Physics',
      }),
    });
  },

  async getAssessment(id: number): Promise<Assessment> {
    return request<Assessment>(`/assessments/${id}`);
  },

  async submitAssessment(
    assessmentId: number,
    answers: { question_id: number; student_answer: string }[]
  ): Promise<ReportCard> {
    return request<ReportCard>(`/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }
};

// -------------------------------------------------------------
// Analytics API
// -------------------------------------------------------------
export const analyticsApi = {
  async getDashboard(): Promise<StudyAnalytics> {
    return request<StudyAnalytics>('/analytics/dashboard');
  }
};

// -------------------------------------------------------------
// Learning Paths API
// -------------------------------------------------------------
export const learningPathApi = {
  async getSubjectPath(subject: string = 'Physics'): Promise<LearningPath> {
    return request<LearningPath>(`/learning-paths/${encodeURIComponent(subject)}`);
  }
};

// -------------------------------------------------------------
// Documents & RAG API
// -------------------------------------------------------------
export const documentApi = {
  async upload(file: File, title?: string, subject?: string): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (subject) formData.append('subject', subject);

    return request<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async list(): Promise<DocumentItem[]> {
    return request<DocumentItem[]>('/documents');
  },

  async get(id: number): Promise<DocumentItem> {
    return request<DocumentItem>(`/documents/${id}`);
  },

  async query(queryText: string, documentId?: number, topK: number = 4): Promise<DocumentCitation[]> {
    return request<DocumentCitation[]>('/documents/query', {
      method: 'POST',
      body: JSON.stringify({
        query: queryText,
        document_id: documentId,
        top_k: topK,
      }),
    });
  },

  async analyze(documentId: number): Promise<{
    topic: string;
    simple_explanation: string;
    main_points: string[];
    key_terms: { term: string; simple_meaning: string }[];
    core_rules_or_formulas: string[];
    recommended_stage: string;
  }> {
    return request(`/documents/${documentId}/analyze`, {
      method: 'POST',
    });
  },

  async createLesson(documentId: number, stage: string = 'Basic'): Promise<Lesson> {
    return request<Lesson>(`/documents/${documentId}/create-lesson?stage=${encodeURIComponent(stage)}`, {
      method: 'POST',
    });
  },

  async uploadBatch(files: File[], subject: string = 'General Engineering'): Promise<DocumentItem[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('subject', subject);

    return request<DocumentItem[]>('/documents/upload-batch', {
      method: 'POST',
      body: formData,
    });
  },
};

