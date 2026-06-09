"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderOpen,
  Database,
  Zap,
  Filter,
  RefreshCw,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type DocStatus = "completed" | "pending" | "rejected" | "processing" | "failed";

type AdminDocument = {
  id: string;
  title: string;
  subject_name: string | null;
  owner_name: string;
  owner_initials: string;
  created_at: string;
  status: DocStatus;
  visibility: string;
};

const statusConfig: Record<
  DocStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  completed: {
    label: "Hoàn thành",
    icon: CheckCircle2,
    className: "text-emerald-600",
  },
  pending: {
    label: "Chờ duyệt",
    icon: Loader2,
    className: "text-amber-600",
  },
  rejected: {
    label: "Đã từ chối",
    icon: AlertCircle,
    className: "text-red-600",
  },
  processing: {
    label: "Đang xử lý",
    icon: Loader2,
    className: "text-blue-600",
  },
  failed: {
    label: "Thất bại",
    icon: AlertCircle,
    className: "text-red-600",
  },
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

export function AdminDocumentsView() {
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
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.set("q", searchQuery);

      const response = await fetch(
        `http://localhost:8080/api/admin/documents?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
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
      } else {
        console.warn("Failed to fetch admin documents, using mock data");
        setDocuments(MOCK_DOCUMENTS);
      }
    } catch (error) {
      console.error("Failed to fetch admin documents:", error);
      setDocuments(MOCK_DOCUMENTS);
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
      const res = await fetch(
        `http://localhost:8080/api/admin/documents/${docId}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.ok) fetchDocuments();
      else alert("Phê duyệt thất bại");
    } catch {
      alert("Đã xảy ra lỗi");
    }
  };

  const handleReject = async (docId: string) => {
    if (!confirm("Từ chối tài liệu này?")) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/documents/${docId}/reject`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.ok) fetchDocuments();
      else alert("Từ chối thất bại");
    } catch {
      alert("Đã xảy ra lỗi");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Xóa vĩnh viễn tài liệu này?")) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/documents/${docId}/delete`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.ok) fetchDocuments();
      else alert("Xóa thất bại");
    } catch {
      alert("Đã xảy ra lỗi");
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

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.subject_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quản lý tài liệu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Phê duyệt, từ chối và xóa tài liệu trong hệ thống.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên tài liệu, môn học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border/60 bg-white pl-11 pr-4 text-sm shadow-soft focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl"
          onClick={fetchDocuments}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Làm mới
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white shadow-soft">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 pl-5">
                    <Checkbox
                      checked={filteredDocuments.length > 0 && selected.size === filteredDocuments.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Tên tài liệu</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Giảng viên</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="pr-5 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      Không có tài liệu nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => {
                    const statusKey = (doc.status in statusConfig ? doc.status : "pending") as DocStatus;
                    const status = statusConfig[statusKey];
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="pl-5">
                          <Checkbox
                            checked={selected.has(doc.id)}
                            onCheckedChange={() => toggleOne(doc.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground line-clamp-1 max-w-[200px]">
                            {doc.title}
                          </span>
                        </TableCell>
                        <TableCell>
                          {doc.subject_name ? (
                            <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-sky-100 text-sky-700">
                              {doc.subject_name}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                              {doc.owner_initials}
                            </div>
                            <span className="text-sm text-foreground">{doc.owner_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell>
                          <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", status.className)}>
                            <StatusIcon
                              className={cn(
                                "h-4 w-4",
                                (doc.status === "processing" || doc.status === "pending") && "animate-spin"
                              )}
                            />
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {doc.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(doc.id)}
                                  title="Phê duyệt"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(doc.id)}
                                  title="Từ chối"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(doc.id)}
                              title="Xóa"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Hiển thị {filteredDocuments.length} tài liệu
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-medium text-primary-foreground">
                  {page}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pipeline info */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
        <h3 className="text-sm font-semibold text-foreground">Quy trình xử lý tài liệu</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Tài liệu được xử lý qua pipeline tự động: Tải lên → Phân tích → Chia đoạn → Nhúng vector → Lập chỉ mục.
          Mỗi tài liệu được chia thành các đoạn ngữ nghĩa và chuyển thành embedding 3072 chiều bằng Gemini Embedding.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {["Tải lên", "Phân tích", "Chia đoạn", "Nhúng vector", "Lập chỉ mục"].map((stage, i) => (
            <div key={stage} className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {i + 1}
              </div>
              <span className="text-xs font-medium text-muted-foreground">{stage}</span>
              {i < 4 && <span className="text-muted-foreground/40">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
