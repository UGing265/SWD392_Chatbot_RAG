import { useState, useEffect, useCallback } from "react";
import { documentApi, AdminDocument, DocStatus } from "@/api/document";
import { notify } from "@/lib/notifications";

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

      const items = (data.documents || []).map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        subject_name: doc.subject_name || null,
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
      }));

      setDocuments(items);
      setTotalPages(Math.max(1, Math.ceil((data.total || items.length) / pageSize)));
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
    } catch (err: any) {
      notify.error("Phê duyệt thất bại", err.message || "Vui lòng thử lại");
    }
  };

  const handleReject = async (docId: string) => {
    if (!confirm("Từ chối tài liệu này?")) return;
    try {
      await documentApi.rejectDocument(docId);
      notify.success("Đã từ chối tài liệu");
      fetchDocuments();
    } catch (err: any) {
      notify.error("Từ chối thất bại", err.message || "Vui lòng thử lại");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Xóa vĩnh viễn tài liệu này?")) return;
    try {
      await documentApi.deleteDocument(docId);
      notify.success("Đã xóa tài liệu vĩnh viễn");
      fetchDocuments();
    } catch (err: any) {
      notify.error("Xóa thất bại", err.message || "Vui lòng thử lại");
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
