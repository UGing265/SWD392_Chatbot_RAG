"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Search, FileText, Loader2, BookOpen, Calendar, Globe, Users, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    // Mock data for development
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
    setLoading(false);

    // Uncomment to use real API
    // fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/documents?visibility=public", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto max-w-6xl p-6 py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Tài liệu chung
              </h1>
              <p className="text-muted-foreground">Tài liệu công khai từ tất cả giảng viên</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm tài liệu công khai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-gray-200 focus:border-green-500 focus:ring-green-500 shadow-sm"
            />
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 animate-in fade-in duration-500">
            <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <div className="flex h-24 w-24 items-center justify-center mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? "Không tìm thấy tài liệu nào" : "Chưa có tài liệu công khai nào"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Thử từ khóa khác" : "Tài liệu công khai sẽ hiển thị ở đây"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => router.push(`/${role}/documents/${doc.id}`)}
                className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Công khai
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                  {doc.title}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <span>{doc.subject_name || "Không có môn học"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>{doc.academic_term_name || "Không có kỳ học"}</span>
                  </div>
                </div>
                {doc.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
                  {doc.owner_email && (
                    <span className="text-xs text-gray-400 truncate">
                      Đăng bởi: {doc.owner_email}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <Button variant="outline" className="w-full h-10 rounded-xl border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors gap-2">
                  <Download className="h-4 w-4" />
                  Xem chi tiết
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
