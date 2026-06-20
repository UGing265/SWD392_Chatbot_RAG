import { ragApi } from "./client";

export interface ChatSession {
  id: string;
  course_id: string;
  title: string;
  is_starred: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  chunk_id: string;
  file_name: string;
  page_label: string;
  excerpt: string;
  relevance_score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  out_of_scope: boolean;
  citations?: Citation[];
  created_at: string;
}

export interface SendMessageResponse {
  user_message: ChatMessage;
  bot_message: ChatMessage;
}

export const chatApi = {
  listSessions: async (): Promise<ChatSession[]> => {
    const response = await ragApi.get<ChatSession[]>("/chat/sessions");
    return response.data;
  },

  createSession: async (courseId: string, title?: string): Promise<ChatSession> => {
    const response = await ragApi.post<ChatSession>("/chat/sessions", {
      course_id: courseId,
      title,
    });
    return response.data;
  },

  getSession: async (id: string): Promise<ChatSession> => {
    const response = await ragApi.get<ChatSession>(`/chat/sessions/${id}`);
    return response.data;
  },

  getHistory: async (id: string): Promise<ChatMessage[]> => {
    const response = await ragApi.get<ChatMessage[]>(`/chat/sessions/${id}/messages`);
    return response.data;
  },

  sendMessage: async (id: string, content: string): Promise<SendMessageResponse> => {
    const response = await ragApi.post<SendMessageResponse>(`/chat/sessions/${id}/messages`, {
      content,
    });
    return response.data;
  },

  deleteSession: async (id: string): Promise<void> => {
    await ragApi.delete(`/chat/sessions/${id}`);
  },
};
