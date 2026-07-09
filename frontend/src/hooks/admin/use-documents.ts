import { useState, useEffect, useCallback } from "react";
import { documentApi, AdminDocument, DocStatus } from "@/api/document";
import { notify } from "@/lib/notifications";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    return err.message;
  }

  return fallback;
};

const MOCK_DOCUMENTS: AdminDocument[] = [
  {
    id: "1",
    title: "Giáo trình KTPM.pdf",
    subject_name: "Kỹ thuật phần mềm",
    owner_name: "Nguyễn Văn Minh",
    owner_initials: "NM",
    created_at: "2025-03-12T00:00:00Z",
    status: "completed",
    visibility: "school_wide",
  },
  {
    id: "2",
    title: "Slide bài giảng W04.pptx",
    subject_name: "Kỹ thuật phần mềm",
    owner_name: "Nguyễn Văn Minh",
    owner_initials: "NM",
    created_at: "2025-03-18T00:00:00Z",
    status: "pending",
    visibility: "private",
  },
  {
    id: "3",
    title: "Bài giảng Cơ sở dữ liệu.pdf",
    subject_name: "Cơ sở dữ liệu",
    owner_name: "Trần Thị Thu",
    owner_initials: "TT",
    created_at: "2025-01-20T00:00:00Z",
    status: "completed",
    visibility: "school_wide",
  },
];

export function useDocuments() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentApi.getDocuments({
        page,
        pageSize,
        q: searchQuery || undefined,
      });

      const items = (data.documents || []).map((doc: AdminDocument) => ({
        id: doc.id,
        title: doc.title,
        subject_id: doc.subject_id || null,
        subject_name: doc.subject_name || null,
        subject_code: doc.subject_code || null,
        owner_name: doc.owner_name || "Không rõ",
        owner_initials: (doc.owner_name || "??")
          .split(" ")
          .slice(-2)
          .map((w: string) => w[0])
          .join("")
          .toUpperCase(),
        created_at: doc.created_at,
        status: (doc.status as DocStatus) || "pending",
        visibility: doc.visibility || "private",
        view_count: Number(doc.view_count || 0),
      }));

      setDocuments(items);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.warn("Failed to fetch admin documents, using mock data", error);
      setDocuments(MOCK_DOCUMENTS);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleApprove = async (docId: string) => {
    if (!confirm("Phê duyệt tài liệu này?")) return;
    try {
      await documentApi.approveDocument(docId);
      notify.success("Phê duyệt tài liệu thành công");
      fetchDocuments();
    } catch (err: unknown) {
      notify.error("Phê duyệt thất bại", getErrorMessage(err, "Vui lòng thử lại"));
    }
  };

  const handleReject = async (docId: string) => {
    if (!confirm("Từ chối tài liệu này?")) return;
    try {
      await documentApi.rejectDocument(docId);
      notify.success("Đã từ chối tài liệu");
      fetchDocuments();
    } catch (err: unknown) {
      notify.error("Từ chối thất bại", getErrorMessage(err, "Vui lòng thử lại"));
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Xóa vĩnh viễn tài liệu này?")) return;
    try {
      await documentApi.deleteDocument(docId);
      notify.success("Đã xóa tài liệu vĩnh viễn");
      fetchDocuments();
    } catch (err: unknown) {
      notify.error("Xóa thất bại", getErrorMessage(err, "Vui lòng thử lại"));
    }
  };

  const toggleAll = () => {
    if (selected.size === documents.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(documents.map((d) => d.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return {
    documents,
    loading,
    selected,
    searchQuery,
    page,
    totalPages,
    setSearchQuery,
    setPage,
    handleApprove,
    handleReject,
    handleDelete,
    toggleAll,
    toggleOne,
    refresh: fetchDocuments,
  };
}
