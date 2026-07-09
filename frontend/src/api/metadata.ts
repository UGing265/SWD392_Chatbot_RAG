import { ragApi } from "./client";

export interface DocumentType {
  id: string;
  name: string;
  description: string | null;
}

export interface Language {
  id: string;
  code: string;
  name: string;
}

export interface DocumentSource {
  id: string;
  name: string;
}

export interface MetadataLookupData {
  documentTypes: any[];
  languages: any[];
  documentSources: any[];
}

export const metadataApi = {
  getLookups: async (): Promise<MetadataLookupData> => {
    const response = await ragApi.get("/documents/lookups");
    return response.data;
  },

  // Document Types
  createDocumentType: async (name: string, description: string | null): Promise<any> => {
    const response = await ragApi.post("/admin/document-types", { name, description });
    return response.data;
  },
  updateDocumentType: async (id: string, name: string, description: string | null): Promise<any> => {
    const response = await ragApi.put(`/admin/document-types/${id}`, { name, description });
    return response.data;
  },
  deleteDocumentType: async (id: string): Promise<any> => {
    const response = await ragApi.delete(`/admin/document-types/${id}`);
    return response.data;
  },

  // Languages
  createLanguage: async (code: string, name: string): Promise<any> => {
    const response = await ragApi.post("/admin/languages", { code, name });
    return response.data;
  },
  updateLanguage: async (id: string, code: string, name: string): Promise<any> => {
    const response = await ragApi.put(`/admin/languages/${id}`, { code, name });
    return response.data;
  },
  deleteLanguage: async (id: string): Promise<any> => {
    const response = await ragApi.delete(`/admin/languages/${id}`);
    return response.data;
  },

  // Document Sources
  createDocumentSource: async (name: string): Promise<any> => {
    const response = await ragApi.post("/admin/document-sources", { name });
    return response.data;
  },
  updateDocumentSource: async (id: string, name: string): Promise<any> => {
    const response = await ragApi.put(`/admin/document-sources/${id}`, { name });
    return response.data;
  },
  deleteDocumentSource: async (id: string): Promise<any> => {
    const response = await ragApi.delete(`/admin/document-sources/${id}`);
    return response.data;
  },
};
