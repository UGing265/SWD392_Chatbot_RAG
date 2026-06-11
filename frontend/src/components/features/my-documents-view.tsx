"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Search, FileText, Loader2, Trash2, BookOpen, Calendar, Lock, Globe, FolderOpen, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        const errText = await response.text();
        console.warn("Failed to fetch documents:", response.status, errText);
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
    if (!confirm("Are you sure you want to delete this document?")) return;

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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-100">
      <div className="container mx-auto max-w-6xl p-6 py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tài liệu của tôi
              </h1>
              <p className="text-muted-foreground">Quản lý tài liệu cá nhân của bạn</p>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 focus:border-blue-400"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: "date" | "subject" | "term") => setSortBy(value)}>
                <SelectTrigger className="w-[180px] rounded-xl">
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
                className="rounded-xl"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 animate-in fade-in duration-500">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <div className="flex h-24 w-24 items-center justify-center mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có tài liệu nào</h3>
            <p className="text-muted-foreground">Bắt đầu tải lên tài liệu của bạn</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => router.push(`/${role}/documents/${doc.slug || doc.id}`)}
                className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      doc.visibility === "public"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {doc.visibility === "public" ? (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Công khai
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Riêng tư
                      </span>
                    )}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {doc.title}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span>{doc.subject_name || "Không có môn học"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span>{doc.academic_term_name || "Không có kỳ học"}</span>
                  </div>
                </div>
                {doc.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id)}
                    className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
