"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Search, FileText, Loader2, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  description: string | null;
  subject_name: string | null;
  academic_term_name: string | null;
  visibility: string;
  status: string;
  created_at: string;
  slug?: string;
}

export function MyDocumentsView() {
  const pathname = usePathname();
  const router = useRouter();
  const role = pathname.split("/")[1] || "student";
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "subject" | "term">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const useMockData = () => {
    const mockDocuments: Document[] = [
      {
        id: "1",
        title: "Giáo trình Lập trình Web - Chương 1",
        description: "Giới thiệu về HTML, CSS và JavaScript cơ bản",
        subject_name: "Lập trình Web",
        academic_term_name: "HK1 2024-2025",
        visibility: "private",
        status: "completed",
        created_at: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        title: "Bài giảng Cơ sở dữ liệu - Chương 3",
        description: "SQL và các câu truy vấn cơ bản",
        subject_name: "Cơ sở dữ liệu",
        academic_term_name: "HK1 2024-2025",
        visibility: "private",
        status: "completed",
        created_at: "2024-01-20T14:00:00Z",
      },
      {
        id: "3",
        title: "Tài liệu ôn thi Toán cao cấp",
        description: "Tổng hợp các bài tập và lý thuyết",
        subject_name: "Toán cao cấp",
        academic_term_name: "HK2 2024-2025",
        visibility: "public",
        status: "completed",
        created_at: "2024-02-01T09:15:00Z",
      },
    ];
    setDocuments(mockDocuments);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/documents/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.warn("Failed to fetch documents, falling back to mock data");
        useMockData();
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "date") {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortBy === "subject") {
      comparison = (a.subject_name || "").localeCompare(b.subject_name || "");
    } else if (sortBy === "term") {
      comparison = (a.academic_term_name || "").localeCompare(b.academic_term_name || "");
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const filteredDocuments = sortedDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (docId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/documents/${docId}/delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const toggleAll = () => {
    if (selected.size === filteredDocuments.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredDocuments.map((d) => d.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tài liệu của tôi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Quản lý tài liệu cá nhân của bạn</p>
      </div>

      {/* Search & Sort Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border/60 bg-white pl-11 pr-4 text-sm shadow-soft focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={sortBy} onValueChange={(value: "date" | "subject" | "term") => setSortBy(value)}>
            <SelectTrigger className="w-[180px] rounded-xl bg-white shadow-soft">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Ngày tạo</SelectItem>
              <SelectItem value="subject">Môn học</SelectItem>
              <SelectItem value="term">Kỳ học</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="rounded-xl bg-white shadow-soft h-10 w-10 shrink-0"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="rounded-2xl border border-border/60 bg-white shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <FileText className="mx-auto mb-4 h-12 w-12 opacity-35" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Chưa có tài liệu nào</h3>
            <p className="text-sm">Bắt đầu bằng việc tải lên tài liệu mới của bạn.</p>
          </div>
        ) : (
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
                <TableHead>Kỳ học</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Phạm vi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="pr-5 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => {
                const isCompleted = doc.status === "completed";
                const isProcessing = doc.status === "processing" || doc.status === "pending";

                return (
                  <TableRow key={doc.id}>
                    <TableCell className="pl-5">
                      <Checkbox
                        checked={selected.has(doc.id)}
                        onCheckedChange={() => toggleOne(doc.id)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-foreground max-w-[240px] truncate">
                      <button
                        onClick={() => router.push(`/${role}/documents/${doc.slug || doc.id}`)}
                        className="hover:text-primary hover:underline text-left font-semibold"
                      >
                        {doc.title}
                      </button>
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
                    <TableCell className="text-muted-foreground">
                      {doc.academic_term_name || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        doc.visibility === "public" || doc.visibility === "school_wide" ? "text-emerald-600" : "text-gray-500"
                      )}>
                        {doc.visibility === "public" || doc.visibility === "school_wide" ? "Công khai" : "Riêng tư"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold",
                        isCompleted ? "text-emerald-600" : (isProcessing ? "text-blue-600" : "text-red-600")
                      )}>
                        {isCompleted ? "Hoàn thành" : (isProcessing ? "Đang xử lý" : "Thất bại")}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa tài liệu"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
