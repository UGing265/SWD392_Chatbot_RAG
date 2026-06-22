import { fetchEventSource } from "@microsoft/fetch-event-source";
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

  streamMessage: async (
    id: string,
    content: string,
    onMessage: (token: string) => void,
    onError: (err: any) => void,
    onClose: () => void
  ): Promise<void> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const baseURL = process.env.NEXT_PUBLIC_RAG_API_URL || "http://localhost:8080/api";
    
    await fetchEventSource(`${baseURL}/chat/sessions/${id}/messages/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
      onmessage(ev) {
        if (ev.event === "error") {
          onError(new Error(ev.data));
          return;
        }
        onMessage(ev.data);
      },
      onerror(err) {
        onError(err);
        throw err; // Stop retrying on error
      },
      onclose() {
        onClose();
      },
    });
  },
};
