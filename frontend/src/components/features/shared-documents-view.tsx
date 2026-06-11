"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Eye,
  FileText,
  Globe,
  Loader2,
  Search,
  Users,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

interface DocumentListItem {
  id: string;
  slug: string;
  title: string;
  preview_text?: string;
  description?: string | null;
  subject_name?: string | null;
  academic_term_name?: string | null;
  owner_email?: string | null;
  document_type_name?: string | null;
  visibility: string;
  status?: string;
  chunk_count?: number;
  view_count?: number;
  created_at: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getPreview(doc: DocumentListItem) {
  return doc.preview_text || doc.description || "";
}

export function SharedDocumentsView() {
  const pathname = usePathname();
  const router = useRouter();
  const role = pathname.split("/")[1] || "student";
  
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedTerm, setSelectedTerm] = useState<{id: string, name: string, year: string} | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<{id: string, name: string} | null>(null);

  // Mock data for UI structure
  const terms = [
    { id: "t1", name: "Kỳ học 1 (Spring)", year: "2026" },
    { id: "t2", name: "Kỳ học 2 (Summer)", year: "2026" },
    { id: "t3", name: "Kỳ học 3 (Fall)", year: "2026" },
    { id: "t4", name: "Kỳ học 1 (Spring)", year: "2025" },
    { id: "t5", name: "Kỳ học 2 (Summer)", year: "2025" },
    { id: "t6", name: "Kỳ học 3 (Fall)", year: "2025" },
  ];

  const subjects = [
    { id: "s1", name: "SWD392 - Software Architecture", termId: "t1" },
    { id: "s2", name: "PRJ301 - Java Web", termId: "t1" },
    { id: "s3", name: "PRU211 - C# .NET", termId: "t2" },
    { id: "s4", name: "DBI202 - Database Systems", termId: "t4" },
  ];

  // Group terms by year
  const groupedTerms = terms.reduce((acc, term) => {
    if (!acc[term.year]) acc[term.year] = [];
    acc[term.year].push(term);
    return acc;
  }, {} as Record<string, typeof terms>);

  const fetchDocuments = useCallback(async (signal?: AbortSignal) => {
    if (!selectedTerm || !selectedSubject) return;
    
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: "1",
        pageSize: "12",
        sortBy: "date_desc",
        term: selectedTerm.id,
        subject: selectedSubject.id,
      });

      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }

      const response = await fetch(`${API_BASE_URL}/api/documents?${params.toString()}`, {
        headers: getAuthHeaders(),
        signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Không thể tải danh sách tài liệu.");
      }

      const data = await response.json();
      const docs = Array.isArray(data.documents) ? data.documents : [];
      
      // Inject mock data if empty (for preview purposes)
      if (docs.length === 0 && selectedSubject?.id === "s1") {
        setDocuments([
          {
            id: "doc-1",
            slug: "bai-giang-1",
            title: "Bài giảng 1: Giới thiệu môn học",
            preview_text: "Tổng quan về môn học và phương pháp đánh giá.",
            subject_name: selectedSubject.name,
            academic_term_name: selectedTerm.name,
            visibility: "school_wide",
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        setDocuments(docs);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Failed to fetch shared documents:", err);
      // Fallback mock data if API fails
      if (selectedSubject?.id === "s1") {
        setDocuments([
          {
            id: "doc-1",
            slug: "bai-giang-1",
            title: "Bài giảng 1: Giới thiệu môn học",
            preview_text: "Tổng quan về môn học và phương pháp đánh giá.",
            subject_name: selectedSubject.name,
            academic_term_name: selectedTerm.name,
            visibility: "school_wide",
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        setDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTerm, selectedSubject]);

  useEffect(() => {
    if (!selectedTerm || !selectedSubject) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchDocuments(controller.signal);
    }, searchQuery.trim() ? 250 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [fetchDocuments, searchQuery, selectedTerm, selectedSubject]);

  const filteredDocuments = useMemo(() => documents, [documents]);

  const handleBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
    } else if (selectedTerm) {
      setSelectedTerm(null);
    }
    setSearchQuery("");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50">
      <div className="container mx-auto max-w-5xl p-6 py-12">
        
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d8282] shadow-lg">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0d8282]">
                  Tài liệu chung
                </h1>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mt-1">
                  <span 
                    className={`cursor-pointer hover:text-foreground transition-colors ${!selectedTerm ? 'text-foreground' : ''}`}
                    onClick={() => { setSelectedTerm(null); setSelectedSubject(null); }}
                  >
                    Tất cả năm học
                  </span>
                  
                  {selectedTerm && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span 
                        className={`cursor-pointer hover:text-foreground transition-colors ${!selectedSubject ? 'text-foreground' : ''}`}
                        onClick={() => setSelectedSubject(null)}
                      >
                        Năm {selectedTerm.year} - {selectedTerm.name}
                      </span>
                    </>
                  )}

                  {selectedSubject && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span className="text-foreground">{selectedSubject.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {(selectedTerm || selectedSubject) && (
              <Button variant="outline" onClick={handleBack} className="rounded-xl">
                Quay lại
              </Button>
            )}
          </div>
        </div>

        {/* Level 1: Select Term grouped by Year */}
        {!selectedTerm ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {Object.entries(groupedTerms).sort((a,b) => Number(b[0]) - Number(a[0])).map(([year, yearTerms]) => (
              <div key={year}>
                <h2 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#0d8282]" />
                  Năm học {year}
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {yearTerms.map((term) => (
                    <div
                      key={term.id}
                      onClick={() => setSelectedTerm(term)}
                      className="cursor-pointer rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:border-[#0d8282] hover:shadow-md group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0d8282]/10 text-[#0d8282] group-hover:bg-[#0d8282] group-hover:text-white transition-colors">
                          <FolderOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-zinc-800 group-hover:text-[#0d8282] transition-colors">{term.name}</h3>
                          <p className="text-sm text-zinc-500 mt-0.5">Bấm để chọn kỳ học</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !selectedSubject ? (
          /* Level 2: Select Subject */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#0d8282]" />
              Chọn Môn Học
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjects
                .filter(s => s.termId === selectedTerm.id)
                .map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className="cursor-pointer rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:border-[#0d8282] hover:shadow-md group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0d8282]/10 text-[#0d8282] group-hover:bg-[#0d8282] group-hover:text-white transition-colors">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-zinc-800 group-hover:text-[#0d8282] transition-colors line-clamp-2">{subject.name}</h3>
                      <p className="text-[13px] text-zinc-500 mt-1">Bấm để xem tài liệu</p>
                    </div>
                  </div>
                </div>
              ))}
              {subjects.filter(s => s.termId === selectedTerm.id).length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-zinc-300">
                  <p className="text-zinc-500">Chưa có môn học nào trong kỳ này.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Level 3: Documents List */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-12 rounded-2xl border-zinc-200 pl-12 shadow-sm focus:border-[#0d8282] focus:ring-[#0d8282]"
              />
            </div>
            {error && <p className="mb-4 text-sm font-medium text-red-600">{error}</p>}

            {loading ? (
              <div className="flex items-center justify-center py-20 animate-in fade-in duration-500">
                <Loader2 className="h-10 w-10 animate-spin text-[#0d8282]" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm animate-in fade-in duration-500">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100">
                  <FileText className="h-10 w-10 text-zinc-300" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-700">
                  {searchQuery ? "Không tìm thấy tài liệu nào" : "Chưa có tài liệu nào"}
                </h3>
                <p className="text-zinc-400 font-medium">
                  {searchQuery ? "Hãy thử một từ khóa khác." : "Giảng viên chưa tải lên tài liệu cho môn học này."}
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 delay-200 duration-500">
                {filteredDocuments.map((doc) => (
                  <article
                    key={doc.id}
                    onClick={() => router.push(`/${role}/documents/${doc.slug || doc.id}`)}
                    className="group cursor-pointer rounded-3xl border border-zinc-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#0d8282]/40 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d8282]/10 text-[#0d8282] transition-transform duration-300 group-hover:bg-[#0d8282] group-hover:text-white">
                        <FileText className="h-7 w-7" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d8282]/10 px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#0d8282] uppercase">
                        <Globe className="h-3 w-3" />
                        {doc.visibility === "school_wide" ? "Toàn trường" : "Công khai"}
                      </span>
                    </div>

                    <h3 className="mb-3 line-clamp-2 text-[17px] font-bold text-zinc-900 transition-colors group-hover:text-[#0d8282]">
                      {doc.title}
                    </h3>

                    {getPreview(doc) && (
                      <p className="mb-5 line-clamp-2 text-[14px] leading-relaxed text-zinc-500">{getPreview(doc)}</p>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-5 mt-auto">
                      <span className="truncate text-[12px] font-medium text-zinc-400">
                        {doc.owner_email ? `Bởi: ${doc.owner_email}` : "Bởi: Giảng viên"}
                      </span>
                      <span className="shrink-0 text-[12px] font-medium text-zinc-400">
                        {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
