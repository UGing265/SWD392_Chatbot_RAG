import { ragApi } from "./client";

export interface AcademicTerm {
  id: string;
  name: string;
  order: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  academic_term_id: string | null;
}

export interface LookupData {
  academicTerms: any[];
  subjects: any[];
}

export const curriculumApi = {
  getLookups: async (): Promise<LookupData> => {
    const response = await ragApi.get("/documents/lookups");
    return response.data;
  },

  createTerm: async (name: string, order: number): Promise<any> => {
    const response = await ragApi.post("/admin/academic-terms", { name, order });
    return response.data;
  },

  updateTerm: async (termId: string, name: string, order: number): Promise<any> => {
    const response = await ragApi.put(`/admin/academic-terms/${termId}`, { name, order });
    return response.data;
  },

  deleteTerm: async (termId: string): Promise<any> => {
    const response = await ragApi.delete(`/admin/academic-terms/${termId}`);
    return response.data;
  },

  createSubject: async (code: string, name: string, academicTermId: string): Promise<any> => {
    const response = await ragApi.post("/admin/subjects", { code, name, academicTermId });
    return response.data;
  },

  updateSubject: async (subjectId: string, code: string, name: string, academicTermId: string | null): Promise<any> => {
    const response = await ragApi.put(`/admin/subjects/${subjectId}`, { code, name, academicTermId });
    return response.data;
  },

  deleteSubject: async (subjectId: string): Promise<any> => {
    const response = await ragApi.delete(`/admin/subjects/${subjectId}`);
    return response.data;
  },
};
