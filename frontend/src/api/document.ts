import { ragApi } from "./client";

export type DocStatus = "completed" | "pending" | "rejected" | "processing" | "failed";

export interface AdminDocument {
  id: string;
  title: string;
  subject_name: string | null;
  owner_name: string;
  owner_initials: string;
  created_at: string;
  status: DocStatus;
  visibility: string;
}

export interface DocumentsResponse {
  documents: any[];
  total_documents: number;
  total_pages: number;
}

export interface ComparisonDifference {
  topic: string;
  document1: string;
  document2: string;
  explanation: string;
}

export interface ComparisonResult {
  differences: ComparisonDifference[];
  commonThemes: string[];
  summary: string;
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

  approveDocument: async (docId: string): Promise<any> => {
    const response = await ragApi.post(`/admin/documents/${docId}/approve`);
    return response.data;
  },

  rejectDocument: async (docId: string): Promise<any> => {
    const response = await ragApi.post(`/admin/documents/${docId}/reject`);
    return response.data;
  },

  deleteDocument: async (docId: string): Promise<any> => {
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
};
