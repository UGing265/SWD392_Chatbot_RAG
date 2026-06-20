import { useState, useEffect, useCallback } from "react";
import { moderationApi, ReportedDocument } from "@/api/moderation";
import { notify } from "@/lib/notifications";

const MOCK_REPORTS: ReportedDocument[] = [
  {
    id: "R-001",
    documentId: "doc-123",
    documentTitle: "Slides_SWD392_Session05.pptx",
    lecturerName: "Trần Thị Thu",
    reporterEmail: "trietlm@fpt.edu.vn",
    reason: "SLIDE BỊ LỖI HIỂN THỊ PHÔNG CHỮ Ở MỘT SỐ TRANG SAU.",
    subjectCode: "SWD392",
    createdAt: new Date().toISOString(),
  },
];

export function useModeration() {
  const [reports, setReports] = useState<ReportedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await moderationApi.getReports();
      // If the backend returns camelCase or snake_case, map it here
      const mapped = (data || []).map((rep: any) => ({
        id: rep.id,
        documentId: rep.document_id || rep.documentId,
        documentTitle: rep.document_title || rep.documentTitle || "Tài liệu không tên",
        lecturerName: rep.lecturer_name || rep.lecturerName || "Không rõ",
        reporterEmail: rep.reporter_email || rep.reporterEmail || "Ẩn danh",
        reason: rep.reason || "Không có lý do chi tiết",
        subjectCode: rep.subject_code || rep.subjectCode || "N/A",
        createdAt: rep.created_at || rep.createdAt || new Date().toISOString(),
      }));
      setReports(mapped);
    } catch (err: any) {
      console.warn("Failed to fetch moderation reports, using mock data", err);
      setReports(MOCK_REPORTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (reportId: string, resolution: "delete" | "ignore") => {
    const confirmMsg =
      resolution === "delete"
        ? "Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài liệu này?"
        : "Bạn có chắc chắn muốn bỏ qua báo cáo này?";

    if (!confirm(confirmMsg)) return;

    try {
      await moderationApi.resolveReport(reportId, resolution);
      notify.success(resolution === "delete" ? "Đã xóa tài liệu thành công" : "Đã bỏ qua báo cáo");
      fetchReports();
    } catch (err: any) {
      notify.error("Xử lý thất bại", err.message || "Vui lòng thử lại sau.");
    }
  };

  return {
    reports,
    loading,
    handleResolve,
    refresh: fetchReports,
  };
}
