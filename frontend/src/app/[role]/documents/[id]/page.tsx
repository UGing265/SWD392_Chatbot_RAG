"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, BookOpen, Calendar, Lock, Globe, Download, Share2, Trash2, Edit3, User, Clock, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  title: string;
  description: string;
  subject_name: string;
  academic_term_name: string;
  visibility: string;
  owner_email: string;
  owner_name: string;
  file_name: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  document_type_name: string;
  language_name: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const role = params.role as string;
    setUserRole(role);

    const mockDocument: Document = {
      id: documentId,
      title: "Giáo trình Lập trình Web - Chương 1-5",
      description: "Giáo trình chi tiết về lập trình web bao gồm HTML, CSS, JavaScript và các framework hiện đại. Tài liệu được biên soạn cho sinh viên năm 2 ngành Công nghệ thông tin.",
      subject_name: "Lập trình Web",
      academic_term_name: "HK1 2024-2025",
      visibility: "public",
      owner_email: "lecturer@studymate.vn",
      owner_name: "Nguyễn Văn A",
      file_name: "lap-trinh-web-chuong-1-5.pdf",
      file_size: 5242880,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-20T14:45:00Z",
      document_type_name: "PDF",
      language_name: "Tiếng Việt",
    };

    const fetchDocument = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const mappedDoc: Document = {
            id: data.id,
            title: data.title,
            description: data.description || "Không có mô tả",
            subject_name: data.subject_name || "Không có môn học",
            academic_term_name: data.academic_term_name || "Không có kỳ học",
            visibility: data.visibility,
            owner_email: data.owner_email || "lecturer@studymate.vn",
            owner_name: data.owner_name || "Giảng viên",
            file_name: data.files && data.files.length > 0 ? data.files[0].original_filename : "document.pdf",
            file_size: data.files && data.files.length > 0 ? data.files[0].file_size_bytes : 0,
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
            document_type_name: data.document_type_name || "Tài liệu",
            language_name: data.language_name || "Chưa xác định",
          };
          setDocument(mappedDoc);
        } else {
          console.warn("Failed to fetch document details, using mock data");
          setDocument(mockDocument);
        }
      } catch (err) {
        console.error("Error fetching document details:", err);
        setDocument(mockDocument);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, params.role]);

  const handleDelete = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/documents/${documentId}/delete`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          router.back();
        } else {
          alert("Xóa tài liệu thất bại");
        }
      } catch (err) {
        console.error("Error deleting document:", err);
        alert("Xóa tài liệu thất bại");
      }
    }
  };

  const handleDownload = () => {
    // Implement download logic
    alert("Đang tải xuống tài liệu...");
  };

  const handleShare = () => {
    // Implement share logic
    alert("Đang sao chép liên kết...");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg animate-pulse" />
          <p className="text-muted-foreground font-medium">Đang tải thông tin tài liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="text-center animate-in fade-in duration-500">
          <div className="h-20 w-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
            <FileText className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy tài liệu</h2>
          <p className="text-muted-foreground mb-6">Tài liệu này không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = userRole === "teacher" || userRole === "lecturer";
  const isOwner = document.owner_email === "lecturer@studymate.vn";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto max-w-5xl p-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4 rounded-xl hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  variant={document.visibility === "public" ? "default" : "secondary"}
                  className={`${
                    document.visibility === "public"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                      : "bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0"
                  }`}
                >
                  {document.visibility === "public" ? (
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      Công khai
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      Riêng tư
                    </span>
                  )}
                </Badge>
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                  {document.document_type_name}
                </Badge>
              </div>
              
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 leading-tight">
                {document.title}
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                {document.description}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleDownload}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200 transition-all duration-300 hover:shadow-xl hover:shadow-blue-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải xuống
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="rounded-xl border-2"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
              {canEdit && isOwner && (
                <>
                  <Button
                    variant="outline"
                    className="rounded-xl border-2"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    className="rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Document Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {/* Subject Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Môn học</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{document.subject_name}</p>
          </div>

          {/* Term Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Kỳ học</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{document.academic_term_name}</p>
          </div>

          {/* Language Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                <File className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Ngôn ngữ</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{document.language_name}</p>
          </div>
        </div>

        {/* Owner & File Info */}
        <div className="grid gap-6 md:grid-cols-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          {/* Owner Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Người tải lên</p>
                <p className="text-lg font-bold text-gray-900">{document.owner_name}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{document.owner_email}</p>
          </div>

          {/* File Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Thông tin file</p>
                <p className="text-lg font-bold text-gray-900">{document.file_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {(document.file_size / 1024 / 1024).toFixed(2)} MB
              </span>
              <span>•</span>
              <span>{new Date(document.created_at).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Ngày tạo</p>
              <p className="text-base text-gray-900">{new Date(document.created_at).toLocaleString("vi-VN")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Cập nhật lần cuối</p>
              <p className="text-base text-gray-900">{new Date(document.updated_at).toLocaleString("vi-VN")}</p>
            </div>
          </div>
        </div>

        {/* File Content Preview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Nội dung tài liệu</h3>
              <p className="text-sm text-muted-foreground">Xem trước nội dung file</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <div className="prose prose-sm max-w-none">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Chương 1: Giới thiệu về Lập trình Web</h4>
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                Lập trình web là nghệ thuật tạo ra các trang web động và tương tác. Trong chương này, chúng ta sẽ tìm hiểu về các khái niệm cơ bản của HTML, CSS và JavaScript.
              </p>

              <h5 className="text-lg font-semibold text-gray-900 mb-3">1.1 HTML (HyperText Markup Language)</h5>
              <p className="text-gray-700 mb-4 leading-relaxed">
                HTML là ngôn ngữ đánh dấu tiêu chuẩn để tạo cấu trúc cho các trang web. Nó sử dụng các thẻ (tags) để định nghĩa các phần tử như tiêu đề, đoạn văn, hình ảnh, liên kết, v.v.
              </p>

              <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
                <code className="text-green-400 text-sm">
                  {`<!DOCTYPE html>
<html>
<head>
  <title>Trang web đầu tiên</title>
</head>
<body>
  <h1>Xin chào thế giới!</h1>
  <p>Đây là trang web đầu tiên của tôi.</p>
</body>
</html>`}
                </code>
              </div>

              <h5 className="text-lg font-semibold text-gray-900 mb-3">1.2 CSS (Cascading Style Sheets)</h5>
              <p className="text-gray-700 mb-4 leading-relaxed">
                CSS được sử dụng để định kiểu cho các trang web. Nó cho phép bạn kiểm soát màu sắc, phông chữ, khoảng cách, bố cục và nhiều khía cạnh khác của giao diện người dùng.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                <p className="text-blue-900 text-sm font-medium">
                  💡 <strong>Lưu ý:</strong> CSS có thể được viết trực tiếp trong file HTML, trong file riêng biệt (.css), hoặc sử dụng CSS frameworks như Bootstrap, Tailwind CSS.
                </p>
              </div>

              <h5 className="text-lg font-semibold text-gray-900 mb-3">1.3 JavaScript</h5>
              <p className="text-gray-700 leading-relaxed">
                JavaScript là ngôn ngữ lập trình cho phép tạo ra nội dung động, tương tác với người dùng, và thực hiện các tính năng phức tạp trên trang web.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Hiển thị trang 1-5 / 25 trang
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" disabled>
                Trang trước
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                Trang sau
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
