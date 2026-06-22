"use client";

import { cn } from "@/lib/utils";
import { Loader, Modal, Textarea } from "@mantine/core";
import {
  IconAlertTriangle,
  IconBookmark,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconDatabase,
  IconEdit,
  IconEye,
  IconFileText,
  IconLanguage,
  IconLock,
  IconQuote,
  IconTrash,
  IconWorld,
  IconX
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const CHUNK_PAGE_SIZE = 12; // Increased slightly for better bento filling

interface DocumentFile {
  id: string;
  original_filename: string;
  file_size_bytes: number;
  extraction_status?: string;
}

interface DocumentChapter {
  id: string;
  title: string;
  summary?: string | null;
  chapter_order: number;
  chunk_count?: number;
}

interface DocumentChunk {
  id: string;
  chunk_order: number;
  content: string;
  word_count?: number;
  has_embedding?: boolean;
}

interface DocumentDetails {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  subject_name?: string | null;
  subject_code?: string | null;
  academic_term_name?: string | null;
  visibility: string;
  document_type_name?: string | null;
  language_name?: string | null;
  total_chunks: number;
  total_chapters: number;
  view_count: number;
  file_count: number;
  files: DocumentFile[];
  chapters: DocumentChapter[];
  chunks: DocumentChunk[];
  owner_user_id?: string;
  owner_full_name?: string | null;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getUserId(): string | null {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;
  const role = params.role as string;
  const currentUserId = getUserId();

  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [chunkPage, setChunkPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<DocumentChapter | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchDocument = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ chunkPage: String(chunkPage), chunkPageSize: String(CHUNK_PAGE_SIZE) });
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
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }, [chunkPage, slug]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDocument(controller.signal);
    return () => controller.abort();
  }, [fetchDocument]);

  const totalPages = useMemo(() => {
    const totalChunks = document?.total_chunks || document?.chunks.length || 0;
    return Math.max(1, Math.ceil(totalChunks / CHUNK_PAGE_SIZE));
  }, [document]);

  const isOwner = document?.owner_user_id === currentUserId;
  const canReport = !isOwner && (role === "student" || role === "lecturer");

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${slug}/delete`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (response.ok) return router.push(`/${role}/documents/my`);
      const payload = await response.json().catch(() => null);
      alert(payload?.error || "Xóa tài liệu thất bại");
    } catch {
      alert("Xóa tài liệu thất bại");
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${slug}/report`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason })
      });
      if (response.ok) {
        alert("Đã gửi báo cáo vi phạm thành công.");
        setReportModalOpen(false);
      } else {
        alert("Gửi báo cáo thất bại.");
      }
    } catch {
      alert("Lỗi khi gửi báo cáo.");
    }
  };

  if (loading && !document) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader size="md" color="dark" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="text-center max-w-md">
          <h2 className="font-serif text-3xl text-zinc-950 mb-3">Tài liệu không tồn tại</h2>
          <p className="text-zinc-500 mb-8">{error}</p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-zinc-950 text-white rounded-full font-medium hover:bg-zinc-800 transition-transform active:scale-[0.98]">
            Quay lại thư viện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 pb-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">

        {/* HERO SECTION: Editorial style, max 4 text elements */}
        <header className="pt-16 pb-12 border-b border-zinc-100 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          <div className="max-w-3xl">
            <div className="flex items-center flex-wrap gap-3 mb-8">
              <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase">
                KHO TÀI LIỆU
              </div>
              <div className="hidden sm:block h-3 w-px bg-zinc-300"></div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-mono font-bold tracking-[0.1em] text-sky-600 uppercase">
                  {document.subject_name || document.subject_code || "Môn học chung"}
                </span>
                <span className="text-zinc-300 text-[10px]">●</span>
                <span className="text-[11px] font-mono font-bold tracking-[0.1em] text-amber-600 uppercase">
                  {document.document_type_name || "Tài liệu học thuật"}
                </span>
                <span className="text-zinc-300 text-[10px]">●</span>
                <span className="text-[11px] font-mono font-bold tracking-[0.1em] text-emerald-600 uppercase">
                  {document.academic_term_name || "Học kỳ hiện tại"}
                </span>
              </div>
            </div>

            <h1 className="font-serif text-5xl md:text-[72px] leading-[1.05] tracking-[-0.02em] text-zinc-950 mb-8">
              {document.title}
            </h1>

            <p className="text-xl md:text-[22px] font-serif text-zinc-500 leading-[1.6] max-w-[50ch]">
              {document.description || "Tài liệu này chưa có mô tả chi tiết từ tác giả."}
            </p>
          </div>
        </header>

        {/* MAIN GRID: Asymmetric Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 pb-16">

          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-16">

            {/* Chapters */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 ease-out fill-mode-both">
              <h2 className="text-[13px] font-mono font-bold tracking-[0.1em] text-zinc-400 uppercase mb-6">Cấu trúc chương học thuật</h2>
              {document.chapters.length === 0 ? (
                <div className="py-12 border border-dashed border-zinc-200 rounded-2xl text-center">
                  <div className="text-zinc-500 font-serif italic">AI chưa trích xuất được phân mục chương cho tài liệu này.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {document.chapters.map((chapter, idx) => (
                    <div
                      key={chapter.id}
                      onClick={() => setSelectedChapter(chapter)}
                      className="group relative p-8 rounded-[24px] border bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98]"
                    >
                      {/* Abstract Background Decoration */}
                      <div className="absolute -top-6 -right-6 text-[120px] font-black opacity-[0.03] select-none pointer-events-none leading-none tracking-tighter">
                        {String(chapter.chapter_order).padStart(2, '0')}
                      </div>

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200 transition-colors">
                            <IconBookmark size={16} />
                          </div>
                          <div className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">
                            Chương {String(chapter.chapter_order).padStart(2, '0')}
                          </div>
                        </div>

                        <h3 className="text-lg font-serif font-medium leading-snug mb-3 text-zinc-900">
                          {chapter.title}
                        </h3>

                        {chapter.summary && (
                          <p className="text-[14px] line-clamp-3 leading-relaxed mt-auto text-zinc-500">
                            {chapter.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Chunks */}
            <section className={cn("transition-opacity duration-500", loading ? "opacity-40" : "opacity-100")}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[13px] font-mono font-bold tracking-[0.1em] text-zinc-400 uppercase">Phân đoạn dữ liệu</h2>
                <div className="flex gap-2 items-center">
                  <span className="text-[13px] font-medium text-zinc-500 mr-2">
                    Trang {chunkPage} / {totalPages}
                  </span>
                  <button
                    disabled={chunkPage <= 1}
                    onClick={() => setChunkPage(p => p - 1)}
                    className="w-10 h-10 flex items-center justify-center border border-zinc-200 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
                  >
                    <IconChevronLeft size={18} />
                  </button>
                  <button
                    disabled={chunkPage >= totalPages}
                    onClick={() => setChunkPage(p => p + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-zinc-200 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
                  >
                    <IconChevronRight size={18} />
                  </button>
                </div>
              </div>

              {document.chunks.length === 0 ? (
                <div className="py-12 border border-dashed border-zinc-200 rounded-2xl text-center">
                  <div className="text-zinc-500 font-serif italic">Tài liệu trống hoặc đang trong hàng đợi xử lý.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {document.chunks.map((chunk) => {
                    const cleanContent = chunk.content.replace(/\\r\\n/g, " ").replace(/\\n/g, " ").replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
                    return (
                      <div
                        key={chunk.id}
                        onClick={() => setSelectedChunk(chunk)}
                        className="group relative p-6 rounded-[20px] border border-zinc-200 bg-white cursor-pointer hover:border-zinc-300 transition-all duration-300 active:scale-[0.98] flex flex-col h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
                      >
                        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-zinc-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 transition-colors">
                              <IconQuote size={12} />
                            </div>
                            <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-400">
                              CHUNK {String(chunk.chunk_order).padStart(3, '0')}
                            </span>
                          </div>
                          {chunk.has_embedding && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Đã Index</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[14px] text-zinc-600 leading-[1.8] line-clamp-4 font-serif relative z-10">
                          {cleanContent}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar (Metrics & Files) */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 ease-out fill-mode-both lg:sticky lg:top-8 self-start">

            {/* Quick Actions (Owner/Admin) */}
            {(isOwner || canReport) && (
              <div className="flex items-center gap-1 p-1.5 bg-zinc-50 border border-zinc-200/80 rounded-full w-full shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                {isOwner && (
                  <>
                    <button
                      onClick={() => router.push(`/${role}/documents/${slug}/edit`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full hover:bg-white hover:shadow-sm text-zinc-600 hover:text-zinc-900 text-[13px] font-medium transition-all"
                    >
                      <IconEdit size={16} /> Chỉnh sửa
                    </button>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full hover:bg-white hover:shadow-sm text-zinc-600 hover:text-red-600 text-[13px] font-medium transition-all"
                    >
                      <IconTrash size={16} /> Xóa
                    </button>
                  </>
                )}
                {canReport && (
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full hover:bg-white hover:shadow-sm text-zinc-600 hover:text-orange-600 text-[13px] font-medium transition-all"
                  >
                    <IconAlertTriangle size={16} /> Báo cáo
                  </button>
                )}
              </div>
            )}

            {/* Quick Metrics Card */}
            <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-[13px] font-mono font-bold tracking-[0.1em] text-zinc-400 uppercase mb-8">Thông tin tài liệu</h3>
              <div className="flex flex-col gap-6">

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <IconDatabase size={20} stroke={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 mb-1 uppercase">Số lượng</div>
                    <div className="text-[13px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none">{document.total_chunks} đoạn</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                    <IconEye size={20} stroke={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 mb-1 uppercase">Lượt xem</div>
                    <div className="text-[13px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none">{document.view_count} lượt</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
                    <IconLanguage size={20} stroke={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 mb-1 uppercase">Ngôn ngữ</div>
                    <div className="text-[13px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none">{document.language_name || "—"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                    {document.visibility === "private" ? <IconLock size={20} stroke={1.5} /> : <IconWorld size={20} stroke={1.5} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 mb-1 uppercase">Trạng thái</div>
                    <div className="text-[13px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none">
                      {document.visibility === "private" ? "Cá nhân" : document.visibility === "school_wide" ? "Nội bộ" : "Công khai"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-zinc-100/80">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0 border border-zinc-200 uppercase font-sans font-bold text-xs tracking-wider">
                    {document.owner_full_name ? document.owner_full_name.charAt(0) : "U"}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 mb-1 uppercase">Người đăng tải</div>
                    <div className="text-[13px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none truncate max-w-[150px]">
                      {document.owner_full_name || "Hệ thống"}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Files List */}
            <div>
              <h3 className="text-[13px] font-mono font-bold tracking-[0.1em] text-zinc-400 uppercase mb-4 pl-2">Tệp đính kèm</h3>
              <div className="space-y-3">
                {document.files.map(file => (
                  <div key={file.id} className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      <IconFileText size={18} className="text-zinc-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-zinc-950 truncate">{file.original_filename}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{(file.file_size_bytes / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    {file.extraction_status === "completed" && (
                      <IconCheck size={16} className="text-emerald-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Chunk Modal */}
      <Modal
        opened={!!selectedChunk}
        onClose={() => setSelectedChunk(null)}
        withCloseButton={false}
        size="lg"
        radius="xl"
        padding={0}
        centered
        overlayProps={{ blur: 4, backgroundOpacity: 0.2 }}
        styles={{ content: { border: '1px solid #e4e4e7', boxShadow: '0 24px 60px -12px rgba(0,0,0,0.15)', borderRadius: '24px' } }}
      >
        {selectedChunk && (
          <div className="relative overflow-hidden flex flex-col p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                  <IconQuote size={14} />
                </div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                  CHUNK {String(selectedChunk.chunk_order).padStart(3, '0')}
                </span>
              </div>
              <button onClick={() => setSelectedChunk(null)} className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 shadow-sm transition-colors">
                <IconX size={16} />
              </button>
            </div>

            <div className="text-zinc-700 text-[15px] leading-[1.8] font-sans text-justify bg-zinc-50/80 p-6 rounded-2xl border border-zinc-100/80">
              {selectedChunk.content.replace(/\\r\\n/g, " ").replace(/\\n/g, " ").replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\s+/g, " ").trim()}
            </div>
          </div>
        )}
      </Modal>

      {/* Chapter Modal */}
      <Modal
        opened={!!selectedChapter}
        onClose={() => setSelectedChapter(null)}
        withCloseButton={false}
        size="lg"
        radius="xl"
        padding={0}
        centered
        overlayProps={{ blur: 4, backgroundOpacity: 0.2 }}
        styles={{ content: { border: '1px solid #e4e4e7', boxShadow: '0 24px 60px -12px rgba(0,0,0,0.15)', borderRadius: '24px' } }}
      >
        {selectedChapter && (
          <div className="relative overflow-hidden flex flex-col p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                  <IconBookmark size={14} />
                </div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                  Chương {String(selectedChapter.chapter_order).padStart(2, '0')}
                </span>
              </div>
              <button onClick={() => setSelectedChapter(null)} className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 shadow-sm transition-colors">
                <IconX size={16} />
              </button>
            </div>
            {/* Title */}
            <h3 className="text-xl font-sans font-semibold text-zinc-900 mb-6 leading-snug">
              {selectedChapter.title}
            </h3>
            {/* Divider */}
            <div className="w-12 h-1 bg-zinc-200 rounded-full mb-6"></div>
            {/* Content */}
            <div className="text-zinc-600 text-[15px] leading-[1.8] font-sans text-justify">
              {selectedChapter.summary || "Chưa có nội dung tóm tắt chi tiết."}
            </div>
          </div>
        )}
      </Modal>

      {/* Report Modal */}
      <Modal
        opened={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        withCloseButton={false}
        radius="24px"
        padding={0}
        centered
        overlayProps={{ blur: 8, backgroundOpacity: 0.4 }}
        styles={{ content: { border: '1px solid #fef3c7', boxShadow: '0 24px 60px -12px rgba(217,119,6,0.15)', borderRadius: '24px' } }}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <IconAlertTriangle size={24} stroke={1.5} />
            </div>
            <button onClick={() => setReportModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 shadow-sm transition-colors">
              <IconX size={16} />
            </button>
          </div>
          <h3 className="text-2xl font-sans font-semibold text-zinc-900 mb-3 tracking-tight">
            Báo cáo vấn đề
          </h3>
          <form onSubmit={submitReport} className="space-y-6">
            <p className="text-[15px] text-zinc-600 font-sans leading-relaxed">
              Xin vui lòng mô tả chi tiết lỗi sai lệch nội dung, vi phạm bản quyền hoặc các vấn đề khác liên quan đến tài liệu này.
            </p>
            <Textarea
              value={reportReason}
              onChange={e => setReportReason(e.currentTarget.value)}
              placeholder="Nhập chi tiết báo cáo tại đây..."
              minRows={4}
              radius="xl"
              required
              styles={{ input: { fontSize: '15px', borderColor: '#e4e4e7', padding: '20px', borderRadius: '16px', backgroundColor: '#fafafa' } }}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setReportModalOpen(false)} className="px-6 py-3 rounded-full bg-zinc-100 text-zinc-700 font-medium text-[15px] hover:bg-zinc-200 transition-colors">
                Hủy
              </button>
              <button type="submit" className="px-6 py-3 rounded-full bg-amber-500 text-white font-medium text-[15px] shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:bg-amber-600 hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                Gửi báo cáo
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        withCloseButton={false}
        radius="24px"
        padding={0}
        centered
        overlayProps={{ blur: 12, backgroundOpacity: 0.2 }}
        styles={{ content: { border: '1px solid #fee2e2', boxShadow: '0 32px 64px -12px rgba(220,38,38,0.2)', borderRadius: '24px' } }}
      >
        <div className="p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-6 ring-8 ring-red-50/50">
            <IconTrash size={28} stroke={1.5} />
          </div>
          <h3 className="text-2xl font-sans font-semibold text-zinc-900 mb-4 tracking-tight">
            Xóa vĩnh viễn tài liệu?
          </h3>
          <p className="text-[15px] text-zinc-500 font-sans leading-relaxed mb-10 max-w-[280px] mx-auto">
            Hành động này sẽ xóa <strong className="text-zinc-900">{document.title}</strong> cùng toàn bộ dữ liệu vector nhúng. Không thể hoàn tác.
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleDelete}
              className="w-full py-3.5 rounded-[14px] bg-red-600 text-white font-medium text-[15px] hover:bg-red-700 transition-colors"
            >
              Vâng, Xóa vĩnh viễn
            </button>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="w-full py-3.5 rounded-[14px] bg-zinc-100 text-zinc-700 font-medium text-[15px] hover:bg-zinc-200 transition-colors"
            >
              Hủy, giữ lại tài liệu
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
