import { ragApi } from "./client";

export interface Subject {
  id: string;
  code: string;
  name: string;
}

export interface LookupData {
  subjects: any[];
}

export const curriculumApi = {
  getLookups: async (): Promise<LookupData> => {
    const response = await ragApi.get("/documents/lookups");
    return response.data;
  },

  createSubject: async (code: string, name: string): Promise<any> => {
    const response = await ragApi.post("/admin/subjects", { code, name });
    return response.data;
  },

  updateSubject: async (
    subjectId: string,
    code: string,
    name: string,
  ): Promise<any> => {
    const response = await ragApi.put(`/admin/subjects/${subjectId}`, {
      code,
      name,
    });
    return response.data;
  },

  deleteSubject: async (subjectId: string): Promise<any> => {
    const response = await ragApi.delete(`/admin/subjects/${subjectId}`);
    return response.data;
  },
};
