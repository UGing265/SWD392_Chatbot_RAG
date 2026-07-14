import { ragApi } from "./client";

export type DocStatus = "completed" | "pending" | "rejected" | "processing" | "failed";

export interface AdminDocument {
  id: string;
  title: string;
  subject_id?: string | null;
  subject_name: string | null;
  subject_code?: string | null;
  owner_name: string;
  owner_initials: string;
  created_at: string;
  status: DocStatus;
  visibility: string;
  view_count?: number;
}

export interface DocumentsResponse {
  documents: AdminDocument[];
  total_documents: number;
  total_pages: number;
}

export interface ComparisonResult {
  markdown: string;
}

export const documentApi = {
  getDocuments: async (params: {
    page: number;
    pageSize: number;
    q?: string;
  }): Promise<DocumentsResponse> => {
    const response = await ragApi.get("/admin/documents", { params });
    return response.data;
  },

  approveDocument: async (docId: string): Promise<Record<string, unknown>> => {
    const response = await ragApi.post(`/admin/documents/${docId}/approve`);
    return response.data;
  },

  rejectDocument: async (docId: string): Promise<Record<string, unknown>> => {
    const response = await ragApi.post(`/admin/documents/${docId}/reject`);
    return response.data;
  },

  deleteDocument: async (docId: string): Promise<Record<string, unknown>> => {
    const response = await ragApi.post(`/admin/documents/${docId}/delete`);
    return response.data;
  },

  compareDocuments: async (documentIds: string[], question: string): Promise<ComparisonResult> => {
    const response = await ragApi.post<ComparisonResult>("/documents/compare", {
      document_ids: documentIds,
      question: question,
    });
    return response.data;
  },

  exportCompareDocuments: async (documentIds: string[], question: string): Promise<Blob> => {
    const response = await ragApi.post("/documents/compare/export", {
      document_ids: documentIds,
      question: question,
    }, {
      responseType: "blob"
    });
    return response.data;
  },

  getPublicDocuments: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    subjectId?: string;
    sortBy?: string;
  }): Promise<{ documents: any[]; total: number }> => {
    const response = await ragApi.get("/documents", { params });
    return response.data;
  },

  getBookmarks: async (): Promise<{ documents: any[] }> => {
    const response = await ragApi.get("/documents/bookmarks");
    const docs = Array.isArray(response.data) ? response.data : (response.data?.documents || []);
    return { documents: docs };
  },

  toggleBookmark: async (slugOrId: string): Promise<{ bookmarked: boolean }> => {
    const response = await ragApi.post(`/documents/${slugOrId}/bookmark`);
    return response.data;
  },
};
