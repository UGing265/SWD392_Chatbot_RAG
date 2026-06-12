import { ragApi } from "./client";

export interface Assignment {
  userId: string;
  subjectId: string;
  createdAt: string;
  lecturerEmail?: string;
  lecturerName?: string;
  subjectCode?: string;
  subjectName?: string;
}

export const assignmentApi = {
  getAssignments: async (): Promise<Assignment[]> => {
    const response = await ragApi.get("/admin/user-subjects");
    return response.data;
  },

  saveAssignments: async (lecturerId: string, subjectIds: string[]): Promise<Assignment[]> => {
    const response = await ragApi.put(`/admin/lecturers/${lecturerId}/subjects`, { subjectIds });
    return response.data;
  },
};
