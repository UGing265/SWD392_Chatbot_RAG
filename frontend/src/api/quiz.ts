import { ragApi } from "./client";

export interface GenerateQuizRequest {
  subject_id: string;
  document_ids: string[];
  total_questions: number;
  true_false_count: number;
  single_choice_count: number;
  multiple_choice_count: number;
}

export interface GenerateQuizResponse {
  job_id: string;
  message: string;
}

export interface QuizJobStatus {
  ID: string;
  SubjectID: string;
  LecturerID: string;
  Status: string;
  Progress: number;
  ResultQuizID: string | null;
  ErrorMessage: string | null;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface QuizSummary {
  ID: string;
  SubjectID: string;
  LecturerID?: string;
  Title: string;
  Status: string;
  TotalQuestions: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface QuizOption {
  ID: string;
  Content: string;
  IsCorrect: boolean;
  OrderIndex: number;
}

export interface QuizQuestion {
  ID: string;
  QuizID: string;
  QuestionType: string;
  Content: string;
  OrderIndex: number;
  Options: QuizOption[];
}

export interface QuizDetailResponse {
  quiz: {
    ID: string;
    SubjectID: string;
    Title: string;
    Status: string;
    TotalQuestions: number;
  };
  questions: QuizQuestion[];
}

export interface StartAttemptResponse {
  ID: string;
  QuizID: string;
  UserID: string;
  Score: number;
  TotalCorrect: number;
  IsPreview: boolean;
  StartedAt: string;
  CompletedAt: string | null;
}

export interface SubmitAttemptAnswer {
  question_id: string;
  selected_option_ids: string[];
}

export interface SubmitAttemptRequest {
  attempt_id: string;
  answers: SubmitAttemptAnswer[];
}

export interface SubmitAttemptResponse {
  ID: string;
  QuizID: string;
  UserID: string;
  Score: number;
  TotalCorrect: number;
  IsPreview: boolean;
  StartedAt: string;
  CompletedAt: string;
}

export interface AttemptHistoryResponse {
  data: SubmitAttemptResponse[];
}

export interface SubjectWithQuiz {
  id: string;
  code: string;
  name: string;
}

export const quizApi = {
  // Shared
  getSubjectsWithQuizzes: async (): Promise<{ data: SubjectWithQuiz[] }> => {
    const res = await ragApi.get("/quizzes/subjects");
    return res.data;
  },

  getQuizDetail: async (quizId: string): Promise<QuizDetailResponse> => {
    const res = await ragApi.get(`/quizzes/${quizId}/detail`);
    return res.data;
  },

  // Lecturer
  generateQuiz: async (data: GenerateQuizRequest): Promise<GenerateQuizResponse> => {
    const res = await ragApi.post("/quizzes/lecturer/generate", data);
    return res.data;
  },

  getJobStatus: async (jobId: string): Promise<QuizJobStatus> => {
    const res = await ragApi.get(`/quizzes/lecturer/jobs/${jobId}`);
    return res.data;
  },

  publishQuiz: async (quizId: string): Promise<{ message: string }> => {
    const res = await ragApi.post(`/quizzes/lecturer/${quizId}/publish`);
    return res.data;
  },

  listQuizzesForLecturer: async (subjectId: string): Promise<QuizSummary[]> => {
    const res = await ragApi.get(`/quizzes/lecturer/subject/${subjectId}`);
    return res.data;
  },

  // Student
  listQuizzesForStudent: async (subjectId: string): Promise<QuizSummary[]> => {
    const res = await ragApi.get(`/quizzes/student/subject/${subjectId}`);
    return res.data;
  },

  startAttempt: async (quizId: string, preview: boolean = false): Promise<StartAttemptResponse> => {
    const res = await ragApi.post(`/quizzes/student/${quizId}/attempt${preview ? "?preview=true" : ""}`);
    return res.data;
  },

  submitAttempt: async (data: SubmitAttemptRequest): Promise<SubmitAttemptResponse> => {
    const res = await ragApi.post("/quizzes/student/attempt/submit", data);
    return res.data;
  },

  getAttemptHistory: async (quizId: string): Promise<AttemptHistoryResponse> => {
    const res = await ragApi.get(`/quizzes/student/${quizId}/attempts`);
    return res.data;
  },
};
