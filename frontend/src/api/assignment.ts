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

const mapAssignment = (a: any): Assignment => ({
  userId: a.user_id,
  subjectId: a.subject_id,
  createdAt: a.created_at,
  lecturerEmail: a.lecturer_email,
  lecturerName: a.lecturer_name,
  subjectCode: a.subject_code,
  subjectName: a.subject_name,
});

export const assignmentApi = {
  getAssignments: async (): Promise<Assignment[]> => {
    const response = await ragApi.get("/admin/user-subjects");
    return (response.data || []).map(mapAssignment);
  },

  saveAssignments: async (lecturerId: string, subjectIds: string[]): Promise<Assignment[]> => {
    const response = await ragApi.put(`/admin/lecturers/${lecturerId}/subjects`, { subjectIds });
    return (response.data || []).map(mapAssignment);
  },
};
