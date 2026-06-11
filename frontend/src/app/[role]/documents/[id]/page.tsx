"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  File,
  FileText,
  Globe,
  Loader2,
  Lock,
  Share2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const CHUNK_PAGE_SIZE = 10;

interface DocumentFile {
  id: string;
  original_filename: string;
  file_url?: string | null;
  mime_type?: string | null;
  file_size_bytes: number;
  page_count?: number | null;
  extraction_status?: string;
}

interface DocumentChapter {
  id: string;
  title: string;
  summary?: string | null;
  chapter_order: number;
  start_page?: number | null;
  end_page?: number | null;
}

interface DocumentChunk {
  id: string;
  chunk_order: number;
  page_number?: number | null;
  content: string;
}

interface DocumentDetails {
  id: string;
  title: string;
  description?: string | null;
  subject_name?: string | null;
  academic_term_name?: string | null;
  visibility: string;
  status: string;
  document_type_name?: string | null;
  language_name?: string | null;
  document_source_name?: string | null;
  total_chunks: number;
  total_chapters: number;
  view_count: number;
  download_count: number;
  file_count: number;
  files: DocumentFile[];
  chapters: DocumentChapter[];
  chunks: DocumentChunk[];
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatFileSize(bytes: number) {
  if (!bytes) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function visibilityLabel(visibility: string) {
  if (visibility === "private") return "Riêng tư";
  if (visibility === "school_wide") return "Toàn trường";
  return "Công khai";
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;
  const role = params.role as string;
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [chunkPage, setChunkPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        chunkPage: String(chunkPage),
        chunkPageSize: String(CHUNK_PAGE_SIZE),
      });

      const response = await fetch(`${API_BASE_URL}/api/documents/${slug}?${query.toString()}`, {
        headers: getAuthHeaders(),
        signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Không thể tải tài liệu này.");
      }

      const data = await response.json();
      setDocument({
        ...data,
        files: Array.isArray(data.files) ? data.files : [],
        chapters: Array.isArray(data.chapters) ? data.chapters : [],
        chunks: Array.isArray(data.chunks) ? data.chunks : [],
        total_chunks: data.total_chunks || 0,
        total_chapters: data.total_chapters || 0,
        view_count: data.view_count || 0,
        download_count: data.download_count || 0,
        file_count: data.file_count || 0,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Error fetching document details:", err);
      
      // Fallback mock data for SWD392 preview
      setDocument({
        id: "mock-1",
        title: "Bài giảng 1: Giới thiệu môn học Software Architecture",
        description: "Tài liệu này bao gồm tổng quan về môn học SWD392, các khái niệm cơ bản về kiến trúc phần mềm, vai trò của Software Architect và các mẫu kiến trúc phổ biến (Architectural Patterns). Đọc kỹ trước khi làm Quiz 1.",
        subject_name: "SWD392 - Software Architecture",
        academic_term_name: "Kỳ học 1 (Spring)",
        visibility: "school_wide",
        status: "Đã xử lý",
        document_type_name: "Bài giảng (Slide)",
        language_name: "Tiếng Việt",
        total_chunks: 42,
        total_chapters: 3,
        view_count: 156,
        download_count: 89,
        file_count: 1,
        files: [
          {
            id: "f1",
            original_filename: "SWD392_Lec1_Intro.pdf",
            file_size_bytes: 2500000,
            page_count: 45,
            extraction_status: "Hoàn tất"
          }
        ],
        chapters: [
          {
            id: "c1",
            title: "Chương 1: Tổng quan về Kiến trúc Phần mềm",
            summary: "Định nghĩa về Kiến trúc phần mềm, tầm quan trọng của nó trong vòng đời phát triển phần mềm (SDLC).",
            chapter_order: 1,
            start_page: 1,
            end_page: 15
          },
          {
            id: "c2",
            title: "Chương 2: Vai trò của Software Architect",
            summary: "Nhiệm vụ, kỹ năng cần thiết và trách nhiệm của một kiến trúc sư phần mềm trong team Agile.",
            chapter_order: 2,
            start_page: 16,
            end_page: 30
          },
          {
            id: "c3",
            title: "Chương 3: Các mẫu Kiến trúc phổ biến",
            summary: "Giới thiệu về Client-Server, Layered Architecture, Microservices và Event-Driven.",
            chapter_order: 3,
            start_page: 31,
            end_page: 45
          }
        ],
        chunks: [
          {
            id: "ch1",
            chunk_order: 0,
            page_number: 1,
            content: "Chào mừng các bạn đến với môn học SWD392 - Software Architecture.\n\nTrong môn học này, chúng ta sẽ tìm hiểu về cách thiết kế một hệ thống phần mềm lớn, từ việc xác định các module, thành phần cốt lõi đến cách chúng giao tiếp với nhau."
          },
          {
            id: "ch2",
            chunk_order: 1,
            page_number: 3,
            content: "Định nghĩa: Kiến trúc phần mềm của một hệ thống là cấu trúc hoặc các cấu trúc của hệ thống, bao gồm các thành phần phần mềm, các thuộc tính có thể nhìn thấy từ bên ngoài của các thành phần đó và các mối quan hệ giữa chúng."
          },
          {
            id: "ch3",
            chunk_order: 2,
            page_number: 5,
            content: "Tại sao Kiến trúc phần mềm lại quan trọng?\n1. Nó đóng vai trò là phương tiện giao tiếp giữa các bên liên quan.\n2. Nó nắm bắt các quyết định thiết kế sớm, có ảnh hưởng sâu sắc đến sự phát triển, triển khai và bảo trì hệ thống.\n3. Nó là một mô hình trừu tượng, tương đối nhỏ của hệ thống, giúp chúng ta dễ hiểu và quản lý độ phức tạp."
          }
        ]
      });
      // setError(err instanceof Error ? err.message : "Không thể tải tài liệu này.");
    } finally {
      setLoading(false);
    }
  }, [chunkPage, slug]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDocument(controller.signal);
    return () => controller.abort();
  }, [fetchDocument]);

  useEffect(() => {
    setChunkPage(1);
  }, [slug]);

  const primaryFile = document?.files[0] || null;
  const totalPages = useMemo(() => {
    const totalChunks = document?.total_chunks || document?.chunks.length || 0;
    return Math.max(1, Math.ceil(totalChunks / CHUNK_PAGE_SIZE));
  }, [document]);

  const canManage = role === "teacher" || role === "lecturer";

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${slug}/delete`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        router.push(`/${role}/documents/my`);
        return;
      }

      const payload = await response.json().catch(() => null);
      alert(payload?.error || "Xóa tài liệu thất bại");
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Xóa tài liệu thất bại");
    }
  };

  const handleDownload = () => {
    if (primaryFile?.file_url) {
      window.open(primaryFile.file_url, "_blank", "noopener,noreferrer");
      return;
    }

    alert("Tài liệu này chưa có đường dẫn tải xuống.");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert("Đã sao chép liên kết tài liệu.");
    } catch {
      alert(url);
    }
  };

  if (loading && !document) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <Loader2 className="h-12 w-12 animate-spin text-[#0d8282]" />
          <p className="font-medium text-muted-foreground">Đang tải thông tin tài liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-50 p-6">
        <div className="text-center animate-in fade-in duration-500">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50">
            <FileText className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-zinc-900">Không thể mở tài liệu</h2>
          <p className="mb-6 text-muted-foreground">
            {error || "Tài liệu này không tồn tại hoặc bạn không có quyền truy cập."}
          </p>
          <Button onClick={() => router.back()} variant="outline" className="rounded-xl border-zinc-200 hover:bg-zinc-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50">
      <div className="container mx-auto max-w-5xl p-6 py-8 md:py-12">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <Button onClick={() => router.back()} variant="outline" className="mb-6 rounded-xl border-zinc-200 hover:bg-white text-zinc-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className={
                    document.visibility === "private"
                      ? "border-zinc-200 bg-zinc-100 text-zinc-600 px-3 py-1 text-[13px]"
                      : "border-[#0d8282]/20 bg-[#0d8282]/5 text-[#0d8282] px-3 py-1 text-[13px]"
                  }
                >
                  {document.visibility === "private" ? (
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      {visibilityLabel(document.visibility)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Globe className="h-3.5 w-3.5" />
                      {visibilityLabel(document.visibility)}
                    </span>
                  )}
                </Badge>
                <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-600 px-3 py-1 text-[13px]">
                  {document.document_type_name || "Tài liệu"}
                </Badge>
                <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-600 px-3 py-1 text-[13px]">
                  {document.status}
                </Badge>
              </div>

              <h1 className="mb-4 text-3xl font-bold text-[#0d8282] md:text-4xl leading-tight">
                {document.title}
              </h1>

              {document.description && (
                <p className="max-w-3xl text-[15px] leading-relaxed text-zinc-500">
                  {document.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 lg:flex-col lg:w-48 shrink-0">
              <Button
                onClick={handleDownload}
                className="rounded-xl bg-[#0d8282] hover:bg-[#0a6666] shadow-sm text-white h-11"
              >
                <Download className="mr-2 h-4 w-4" />
                Tải xuống
              </Button>
              <Button onClick={handleShare} variant="outline" className="rounded-xl border-zinc-200 hover:bg-zinc-100 h-11">
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
              {canManage && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-11"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa tài liệu
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 delay-100 duration-500">
          {[
            { icon: BookOpen, label: "Môn học", value: document.subject_name || "Chưa có môn học" },
            { icon: Calendar, label: "Kỳ học", value: document.academic_term_name || "Chưa có kỳ học" },
            { icon: File, label: "Ngôn ngữ", value: document.language_name || "Chưa xác định" },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d8282]/10">
                  <stat.icon className="h-5 w-5 text-[#0d8282]" />
                </div>
                <span className="text-sm font-semibold text-zinc-500">{stat.label}</span>
              </div>
              <p className="text-[15px] font-bold text-zinc-800 line-clamp-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          {primaryFile && (
            <section className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 delay-150 duration-500">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0d8282]/10">
                  <FileText className="h-6 w-6 text-[#0d8282]" />
                </div>
                <div>
                  <p className="line-clamp-1 text-[15px] font-semibold text-zinc-800">{primaryFile.original_filename}</p>
                  <p className="text-[13px] text-zinc-500 mt-0.5">
                    {formatFileSize(primaryFile.file_size_bytes)} 
                    {primaryFile.page_count ? ` • ${primaryFile.page_count} trang` : ""}
                  </p>
                </div>
              </div>
              <Button onClick={handleDownload} variant="outline" className="shrink-0 rounded-xl border-zinc-200 hover:bg-zinc-50 text-[#0d8282]">
                <Download className="mr-2 h-4 w-4" />
                Mở file gốc
              </Button>
            </section>
          )}

          <section className="rounded-3xl border border-zinc-200/60 bg-white p-6 md:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-250 duration-500">
            <div className="mb-8 flex flex-col gap-3 border-b border-zinc-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-zinc-800 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#0d8282] rounded-full"></span>
                  Nội dung chi tiết
                </h2>
                <p className="mt-1 text-[13px] text-zinc-500">
                  Trang nội dung {chunkPage}/{totalPages} • Tổng cộng {document.total_chunks} đoạn văn bản
                </p>
              </div>
              {loading && <Loader2 className="h-5 w-5 animate-spin text-[#0d8282]" />}
            </div>

            {document.chunks.length > 0 ? (
              <div className="rounded-2xl border border-zinc-200/50 bg-zinc-50/80 p-6 md:p-10">
                <div className="prose prose-zinc max-w-none text-[16px] leading-[1.8] text-zinc-800 whitespace-pre-wrap">
                  {document.chunks.map(c => c.content).join("\n\n")}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
                <div className="max-w-[300px]">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-zinc-100 shadow-sm">
                    <FileText className="h-8 w-8 text-zinc-400" />
                  </div>
                  <h3 className="mb-2 text-[16px] font-bold text-zinc-800">Chưa có nội dung trích xuất</h3>
                  <p className="text-[14px] text-zinc-500 leading-relaxed">
                    Tài liệu này có thể vẫn đang được hệ thống xử lý hoặc nội dung trống.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-12 flex items-center justify-between gap-3 border-t border-zinc-100 pt-8">
              <Button
                variant="outline"
                className="rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium"
                disabled={chunkPage <= 1 || loading}
                onClick={() => setChunkPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Trang trước
              </Button>
              <span className="rounded-xl bg-zinc-100 px-4 py-2 text-[13px] font-bold text-zinc-600">
                {chunkPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                className="rounded-xl border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium"
                disabled={chunkPage >= totalPages || loading}
                onClick={() => setChunkPage((page) => Math.min(totalPages, page + 1))}
              >
                Trang sau
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
