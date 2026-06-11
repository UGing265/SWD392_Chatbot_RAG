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
      setDocument(null);
      setError(err instanceof Error ? err.message : "Không thể tải tài liệu này.");
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
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="font-medium text-muted-foreground">Đang tải thông tin tài liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="text-center animate-in fade-in duration-500">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-100 to-red-200">
            <FileText className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Không thể mở tài liệu</h2>
          <p className="mb-6 text-muted-foreground">
            {error || "Tài liệu này không tồn tại hoặc bạn không có quyền truy cập."}
          </p>
          <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto max-w-6xl p-6 py-8">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <Button onClick={() => router.back()} variant="ghost" className="mb-4 rounded-xl hover:bg-white/60">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Badge
                  variant={document.visibility === "private" ? "secondary" : "default"}
                  className={
                    document.visibility === "private"
                      ? "border-0 bg-gradient-to-r from-gray-500 to-slate-500 text-white"
                      : "border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  }
                >
                  {document.visibility === "private" ? (
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      {visibilityLabel(document.visibility)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {visibilityLabel(document.visibility)}
                    </span>
                  )}
                </Badge>
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                  {document.document_type_name || "Tài liệu"}
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                  {document.status}
                </Badge>
              </div>

              <h1 className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-extrabold leading-tight text-transparent md:text-4xl">
                {document.title}
              </h1>

              {document.description && (
                <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
                  {document.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 lg:flex-col">
              <Button
                onClick={handleDownload}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-200 transition-all duration-300 hover:from-blue-700 hover:to-purple-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Tải xuống
              </Button>
              <Button onClick={handleShare} variant="outline" className="rounded-xl border-2">
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
              {canManage && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 delay-100 duration-500">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Môn học</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{document.subject_name || "Chưa có môn học"}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Kỳ học</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{document.academic_term_name || "Chưa có kỳ học"}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                <File className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Ngôn ngữ</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{document.language_name || "Chưa xác định"}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-600">Lượt xem</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{document.view_count}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-150 duration-500">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">File tài liệu</h2>
                  <p className="text-sm text-muted-foreground">{document.file_count} file</p>
                </div>
              </div>

              {primaryFile ? (
                <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                  <p className="line-clamp-2 font-semibold text-gray-900">{primaryFile.original_filename}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md bg-white px-2 py-1">{formatFileSize(primaryFile.file_size_bytes)}</span>
                    {primaryFile.page_count ? (
                      <span className="rounded-md bg-white px-2 py-1">{primaryFile.page_count} trang</span>
                    ) : null}
                    {primaryFile.extraction_status ? (
                      <span className="rounded-md bg-white px-2 py-1">{primaryFile.extraction_status}</span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có file đính kèm.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-200 duration-500">
              <h2 className="mb-4 text-base font-bold text-gray-900">Mục lục AI</h2>
              {document.chapters.length > 0 ? (
                <div className="space-y-3">
                  {document.chapters.map((chapter) => (
                    <div key={chapter.id} className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-gray-900">{chapter.title}</p>
                      {chapter.summary && (
                        <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{chapter.summary}</p>
                      )}
                      {(chapter.start_page || chapter.end_page) && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Trang {chapter.start_page || "?"}-{chapter.end_page || "?"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Mục lục sẽ xuất hiện sau khi hệ thống xử lý tài liệu.</p>
              )}
            </section>
          </aside>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-250 duration-500">
            <div className="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nội dung tài liệu</h2>
                <p className="text-sm text-muted-foreground">
                  Trang nội dung {chunkPage}/{totalPages} • {document.total_chunks} đoạn văn bản
                </p>
              </div>
              {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            </div>

            {document.chunks.length > 0 ? (
              <div className="space-y-5">
                {document.chunks.map((chunk) => (
                  <article key={chunk.id} className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50 p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="rounded-md bg-white px-2 py-1">Đoạn {chunk.chunk_order + 1}</span>
                      {chunk.page_number ? (
                        <span className="rounded-md bg-white px-2 py-1">Trang {chunk.page_number}</span>
                      ) : null}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800">{chunk.content}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-slate-50 p-6 text-center">
                <div>
                  <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">Chưa có nội dung trích xuất</h3>
                  <p className="text-sm text-muted-foreground">
                    Tài liệu có thể vẫn đang được xử lý sau khi giáo viên tải lên.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={chunkPage <= 1 || loading}
                onClick={() => setChunkPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Trang trước
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {chunkPage}/{totalPages}
              </span>
              <Button
                variant="outline"
                className="rounded-xl"
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
