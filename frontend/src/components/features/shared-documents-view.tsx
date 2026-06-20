"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Search, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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

interface Document {
  id: string;
  title: string;
  description: string | null;
  subject_name: string | null;
  academic_term_name: string | null;
  owner_email: string | null;
  created_at: string;
  slug: string;
}

export function SharedDocumentsView() {
  const pathname = usePathname();
  const router = useRouter();
  const role = pathname.split("/")[1] || "student";
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const useMockData = () => {
    const mockDocuments: Document[] = [
      {
        id: "1",
        title: "Giáo trình Lập trình Web - Chương 1",
        description: "Giới thiệu về HTML, CSS và JavaScript cơ bản",
        subject_name: "Lập trình Web",
        academic_term_name: "HK1 2024-2025",
        owner_email: "lecturer1@school.edu.vn",
        created_at: "2024-01-15T10:30:00Z",
        slug: "giao-trinh-lap-trinh-web-chuong-1",
      },
      {
        id: "2",
        title: "Bài giảng Cơ sở dữ liệu - Chương 3",
        description: "SQL và các câu truy vấn cơ bản",
        subject_name: "Cơ sở dữ liệu",
        academic_term_name: "HK1 2024-2025",
        owner_email: "lecturer2@school.edu.vn",
        created_at: "2024-01-20T14:00:00Z",
        slug: "bai-giang-co-so-du-lieu-chuong-3",
      },
      {
        id: "3",
        title: "Tài liệu ôn thi Toán cao cấp",
        description: "Tổng hợp các bài tập và lý thuyết",
        subject_name: "Toán cao cấp",
        academic_term_name: "HK2 2024-2025",
        owner_email: "lecturer3@school.edu.vn",
        created_at: "2024-02-01T09:15:00Z",
        slug: "tai-lieu-on-thi-toan-cao-cap",
      },
      {
        id: "4",
        title: "Lý thuyết Mạng máy tính",
        description: "Các mô hình mạng và giao thức truyền thông",
        subject_name: "Mạng máy tính",
        academic_term_name: "HK1 2024-2025",
        owner_email: "lecturer4@school.edu.vn",
        created_at: "2024-01-25T11:00:00Z",
        slug: "ly-thuyet-mang-may-tinh",
      },
      {
        id: "5",
        title: "Hướng dẫn thực hành Lập trình Java",
        description: "Các bài thực hành từ cơ bản đến nâng cao",
        subject_name: "Lập trình Java",
        academic_term_name: "HK2 2024-2025",
        owner_email: "lecturer5@school.edu.vn",
        created_at: "2024-02-10T15:30:00Z",
        slug: "huong-dan-thuc-hanh-lap-trinh-java",
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
      const response = await fetch("http://localhost:8080/api/documents?visibility=school_wide", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.warn("Failed to fetch shared documents, falling back to mock data");
        useMockData();
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          Tài liệu chung
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Tài liệu công khai từ tất cả giảng viên</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu công khai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border/60 bg-white pl-11 pr-4 text-sm shadow-soft focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5"
          />
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
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {searchQuery ? "Không tìm thấy tài liệu nào" : "Chưa có tài liệu công khai nào"}
            </h3>
            <p className="text-sm">
              {searchQuery ? "Thử từ khóa khác" : "Tài liệu công khai sẽ hiển thị ở đây."}
            </p>
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
                <TableHead>Đăng bởi</TableHead>
                <TableHead>Ngày đăng</TableHead>
                <TableHead className="pr-5 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
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
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {doc.owner_email || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/${role}/documents/${doc.slug || doc.id}`)}
                      className="rounded-xl hover:bg-primary-soft hover:text-primary transition-colors text-xs font-semibold h-9 px-3"
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
