import { ragApi } from "./client";

export interface ReportedDocument {
  id: string;
  documentId: string;
  documentTitle: string;
  lecturerName: string;
  reporterEmail: string;
  reason: string;
  subjectCode: string;
  createdAt: string;
}

export const moderationApi = {
  getReports: async (): Promise<ReportedDocument[]> => {
    const response = await ragApi.get("/admin/reports");
    return response.data;
  },

  resolveReport: async (reportId: string, resolution: "delete" | "ignore"): Promise<any> => {
    const response = await ragApi.post(`/admin/reports/${reportId}/resolve`, null, {
      params: { resolution },
    });
    return response.data;
  },
};
