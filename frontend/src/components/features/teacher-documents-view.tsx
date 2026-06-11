import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { 
  CloudUpload, Filter, Search, FileText, CheckCircle2, 
  Loader2, AlertCircle, Trash2, Download, Video, 
  FileSpreadsheet, Plus, MoreVertical, Edit2, ChevronRight, ChevronDown, Upload, File, FolderOpen, Calendar, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
  items: Item[];
}

interface Material {
  id: string;
  resource: string;
  subjectId: string;
  date: string;
  format: string;
  status: string;
  chapters: Chapter[];
}

// API response types
interface ApiAcademicTerm {
  id: string;
  name: string;
  order: number;
  created_at: string;
}

interface ApiSubject {
  id: string;
  code: string;
  name: string;
  academic_term_id?: string;
  created_at: string;
}

interface ApiDocument {
  id: string;
  slug: string;
  title: string;
  subject_id?: string;
  subject_name?: string;
  subject_code?: string;
  academic_term_name?: string;
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  file_count: number;
  chunk_count: number;
  preview_text: string;
  view_count: number;
}

// Helper: extract year from term name (e.g. "HK1 2024-2025" -> "2024-2025")
function extractYearFromTermName(name: string): string {
  const match = name.match(/(\d{4}[-–]\d{4})/);
  if (match) return match[1];
  const yearMatch = name.match(/(\d{4})/);
  if (yearMatch) return yearMatch[1];
  return "Khác";
}

export function DocumentsView() {
  const [step, setStep] = useState<"term" | "subject" | "documents" | "chapters" | "viewing">("term");
  const [selectedTerm, setSelectedTerm] = useState<{id: string, name: string, year: string} | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<{id: string, name: string} | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<{id: string, name: string, termId: string}[]>([]);
  const [terms, setTerms] = useState<{id: string, name: string, year: string}[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const groupedTerms = useMemo(() => terms.reduce((acc, term) => {
    if (!acc[term.year]) acc[term.year] = [];
    acc[term.year].push(term);
    return acc;
  }, {} as Record<string, typeof terms>), [terms]);

  // Fetch lookups (terms, subjects) from API
  const fetchLookups = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/documents/lookups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch lookups");
      const data = await res.json();

      // Map academic terms
      const apiTerms: ApiAcademicTerm[] = data.academicTerms || [];
      const mappedTerms = apiTerms.map((t) => ({
        id: t.id,
        name: t.name,
        year: extractYearFromTermName(t.name),
      }));
      setTerms(mappedTerms);

      // Map subjects (they have academic_term_id)
      const apiSubjects: ApiSubject[] = data.subjects || [];
      const mappedSubjects = apiSubjects.map((s) => ({
        id: s.id,
        name: `${s.code} - ${s.name}`,
        termId: s.academic_term_id || "",
      }));
      setSubjects(mappedSubjects);
    } catch (err) {
      console.error("Failed to fetch lookups:", err);
      toast.error("Không thể tải danh sách kỳ học và môn học.");
    }
  }, []);

  // Fetch my documents from API
  const fetchMyDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/documents/my?pageSize=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();

      const apiDocs: ApiDocument[] = data.documents || [];
      const mapped: Material[] = apiDocs.map((doc) => {
        // Determine format from title extension or default
        const ext = doc.title?.split(".").pop()?.toUpperCase();
        const format = ["PDF", "DOCX", "DOC", "PPTX", "PPT"].includes(ext || "") ? ext! : "PDF";

        // Map status
        let status = "Processing";
        if (doc.status === "completed") status = "Ready";
        else if (doc.status === "failed") status = "Failed";

        return {
          id: doc.id,
          resource: doc.title,
          subjectId: doc.subject_id || "",
          date: new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          format,
          status,
          chapters: [],
        };
      });
      setMaterials(mapped);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    setMounted(true);
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchLookups(), fetchMyDocuments()]);
      setIsLoading(false);
    };
    load();
  }, [fetchLookups, fetchMyDocuments]);
  
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Partial<Material> | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredMaterials = useMemo(() => 
    selectedSubject 
      ? materials.filter(m => m.subjectId === selectedSubject.id)
      : []
  , [materials, selectedSubject]);

  const activeMaterial = useMemo(() => 
    materials.find(m => m.id === selectedMaterialId)
  , [materials, selectedMaterialId]);

  const handleSaveSubject = () => {
    toast.info("Tính năng thêm môn học chỉ dành cho Admin.", {
      description: "Vui lòng liên hệ quản trị viên để thêm môn học mới."
    });
    setNewSubjectName("");
    setIsAddSubjectModalOpen(false);
  };

  const handleDelete = async () => {
    if (currentMaterial?.id) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/documents/${currentMaterial.id}/delete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Xóa thất bại");
        }
        // Re-fetch from API
        await fetchMyDocuments();
        toast.success("Đã xóa tài liệu thành công.");
      } catch (err: any) {
        console.error(err);
        toast.error("Xóa thất bại", { description: err.message });
      }
      setIsDeleteModalOpen(false);
      setCurrentMaterial(null);
    }
  };

  const handleSave = async () => {
    if (currentMaterial?.id && !selectedFile) {
      // Logic Edit (Mock)
      setMaterials(materials.map(m => m.id === currentMaterial.id ? { ...m, ...currentMaterial } as Material : m));
      setIsEditModalOpen(false);
      return;
    }

    if (!selectedFile) {
      toast.error("Vui lòng chọn một tệp để tải lên.");
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (currentMaterial?.resource) {
        formData.append("title", currentMaterial.resource);
      }
      if (selectedSubject) {
        formData.append("subject_id", selectedSubject.id);
      }
      
      const term = subjects.find(s => s.id === selectedSubject?.id)?.termId;
      if (term) {
        formData.append("academic_term_id", term);
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/documents/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload thất bại");
      }

      // Re-fetch documents from API to show the new upload
      await fetchMyDocuments();

      toast.success("Tải lên thành công!", {
        description: "Tài liệu của bạn đang được hệ thống RAG xử lý ngầm."
      });

      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setCurrentMaterial(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Tải lên thất bại", {
        description: err.message || "Đã xảy ra lỗi, vui lòng thử lại."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCurrentMaterial(prev => ({ 
        ...prev, 
        resource: file.name.split('.').slice(0, -1).join('.') || file.name,
        format: file.name.split('.').pop()?.toUpperCase() || "PDF",
        chapters: [
          { id: "C" + Math.random().toString(36).substr(2, 4), name: "Chương 1: Tổng quan tài liệu", items: [{ id: "I" + Math.random().toString(36).substr(2, 4), name: "Giới thiệu chung" }, { id: "I" + Math.random().toString(36).substr(2, 4), name: "Mục tiêu bài học" }] },
          { id: "C" + Math.random().toString(36).substr(2, 4), name: "Chương 2: Nội dung chi tiết", items: [{ id: "I" + Math.random().toString(36).substr(2, 4), name: "Kiến thức cơ bản" }, { id: "I" + Math.random().toString(36).substr(2, 4), name: "Ví dụ minh họa" }] },
          { id: "C" + Math.random().toString(36).substr(2, 4), name: "Chương 3: Câu hỏi ôn tập", items: [{ id: "I" + Math.random().toString(36).substr(2, 4), name: "Bài tập tự luyện" }] },
        ]
      }));
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#0d8282]" />
        <p className="text-sm text-zinc-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const handleBack = () => {
    if (step === "viewing") setStep("chapters");
    else if (step === "chapters") setStep("documents");
    else if (selectedSubject) {
      setSelectedSubject(null);
      setStep("subject");
    } else if (selectedTerm) {
      setSelectedTerm(null);
      setStep("term");
    }
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
                  Tài liệu riêng
                </h1>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mt-1">
                  <span 
                    className={`cursor-pointer hover:text-foreground transition-colors ${!selectedTerm ? 'text-foreground' : ''}`}
                    onClick={() => { setSelectedTerm(null); setSelectedSubject(null); setStep("term"); }}
                  >
                    Tất cả năm học
                  </span>
                  
                  {selectedTerm && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span 
                        className={`cursor-pointer hover:text-foreground transition-colors ${!selectedSubject ? 'text-foreground' : ''}`}
                        onClick={() => { setSelectedSubject(null); setStep("subject"); }}
                      >
                        Năm {selectedTerm.year} - {selectedTerm.name}
                      </span>
                    </>
                  )}

                  {selectedSubject && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span className={`cursor-pointer hover:text-foreground transition-colors ${step === "documents" ? 'text-foreground' : ''}`}
                            onClick={() => setStep("documents")}
                      >
                        {selectedSubject.name}
                      </span>
                    </>
                  )}

                  {step === "chapters" && activeMaterial && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span className="text-foreground">Cấu trúc: {activeMaterial.resource}</span>
                    </>
                  )}

                  {step === "viewing" && activeMaterial && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span className="text-foreground">Xem nội dung</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {(selectedTerm || selectedSubject || step === "chapters" || step === "viewing") && (
                <Button variant="outline" onClick={handleBack} className="rounded-xl border-zinc-200 hover:bg-zinc-100">
                  Quay lại
                </Button>
              )}
              {selectedSubject && step === "documents" && (
                <Button onClick={() => { setCurrentMaterial({ subjectId: selectedSubject.id || "" }); setIsUploadModalOpen(true); }} className="rounded-xl bg-[#0d8282] hover:bg-[#0a6666] text-white shadow-sm transition-all">
                  <Plus className="mr-2 h-4 w-4" /> Tải lên tài liệu
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Level 1: Select Term */}
        {!selectedTerm ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {terms.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm animate-in fade-in duration-500">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100">
                  <Calendar className="h-10 w-10 text-zinc-300" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-700">Chưa có kỳ học nào</h3>
                <p className="text-zinc-400 font-medium">Liên hệ quản trị viên để thêm kỳ học.</p>
              </div>
            ) : (
            Object.entries(groupedTerms).sort((a,b) => {
              const yearA = parseInt(a[0]) || 0;
              const yearB = parseInt(b[0]) || 0;
              return yearB - yearA;
            }).map(([year, yearTerms]) => (
              <div key={year}>
                <h2 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#0d8282]" />
                  Năm học {year}
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {yearTerms.map((term) => (
                    <div
                      key={term.id}
                      onClick={() => { setSelectedTerm(term); setStep("subject"); }}
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
            ))
            )}
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
                .length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <BookOpen className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500 font-medium">Chưa có môn học nào trong kỳ này.</p>
                </div>
              )}
              {subjects
                .filter(s => s.termId === selectedTerm.id)
                .map((subject) => {
                const docCount = materials.filter(m => m.subjectId === subject.id).length;
                return (
                <div
                  key={subject.id}
                  onClick={() => { setSelectedSubject(subject); setStep("documents"); }}
                  className="cursor-pointer rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:border-[#0d8282] hover:shadow-md group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0d8282]/10 text-[#0d8282] group-hover:bg-[#0d8282] group-hover:text-white transition-colors">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-zinc-800 group-hover:text-[#0d8282] transition-colors line-clamp-2">{subject.name}</h3>
                      <p className="text-[13px] text-zinc-500 mt-1">{docCount > 0 ? `${docCount} tài liệu` : "Chưa có tài liệu"}</p>
                    </div>
                  </div>
                </div>
                );
              })}
              
              <div
                onClick={() => setIsAddSubjectModalOpen(true)}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-5 transition-all hover:border-[#0d8282]/50 hover:bg-[#0d8282]/5 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 group-hover:bg-[#0d8282]/10 group-hover:text-[#0d8282] transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-zinc-600 group-hover:text-[#0d8282] transition-colors">Thêm môn học</h3>
                    <p className="text-[13px] text-zinc-400 mt-1">Tạo môn học mới</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : step === "documents" ? (
          /* Level 3: Documents List (Cards) */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {filteredMaterials.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm animate-in fade-in duration-500">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100">
                  <FileText className="h-10 w-10 text-zinc-300" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-700">Chưa có tài liệu nào</h3>
                <p className="text-zinc-400 font-medium mb-6">Bạn chưa tải lên tài liệu nào cho môn học này.</p>
                <Button onClick={() => { setCurrentMaterial({ subjectId: selectedSubject.id || "" }); setIsUploadModalOpen(true); }} className="rounded-xl bg-[#0d8282] hover:bg-[#0a6666] text-white">
                  <Plus className="mr-2 h-4 w-4" /> Tải lên tài liệu đầu tiên
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMaterials.map((m) => (
                  <article
                    key={m.id}
                    className="group flex flex-col rounded-3xl border border-zinc-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#0d8282]/40 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d8282]/10 text-[#0d8282] transition-transform duration-300 group-hover:bg-[#0d8282] group-hover:text-white">
                        <FileText className="h-7 w-7" />
                      </div>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide", m.status === "Ready" ? "bg-green-100 text-green-700" : m.status === "Failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                        <div className={cn("h-1.5 w-1.5 rounded-full", m.status === "Ready" ? "bg-green-500" : m.status === "Failed" ? "bg-red-500" : "bg-amber-500")} />
                        {m.status}
                      </span>
                    </div>

                    <h3 className="mb-3 line-clamp-2 text-[17px] font-bold text-zinc-900">
                      {m.resource}
                    </h3>
                    
                    <div className="mb-5 flex items-center gap-4 text-[13px] font-medium text-zinc-500">
                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {m.date}</span>
                      <span className="flex items-center gap-1.5"><File className="h-4 w-4" /> {m.format}</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-100 pt-5">
                      <div className="flex gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"
                          onClick={(e) => { e.stopPropagation(); setCurrentMaterial(m); setIsEditModalOpen(true); }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl hover:bg-red-50 text-zinc-500 hover:text-red-600"
                          onClick={(e) => { e.stopPropagation(); setCurrentMaterial(m); setIsDeleteModalOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => { setSelectedMaterialId(m.id); setStep("chapters"); }}
                        variant="outline"
                        className="rounded-xl h-9 px-4 text-[13px] font-bold border-zinc-200 text-[#0d8282] hover:bg-[#0d8282]/5"
                      >
                        Cấu trúc
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : step === "chapters" && activeMaterial ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4">
              {activeMaterial.chapters.map((c) => (
                <div key={c.id} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                  <label className="flex items-center gap-4 p-5 border-b border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-zinc-300 text-[#0d8282] focus:ring-[#0d8282]"
                      checked={selectedChapterIds.has(c.id)}
                      onChange={() => {
                        const nextChapters = new Set(selectedChapterIds);
                        const nextItems = new Set(selectedItemIds);
                        
                        if (nextChapters.has(c.id)) {
                          nextChapters.delete(c.id);
                          c.items.forEach(item => nextItems.delete(item.id));
                        } else {
                          nextChapters.add(c.id);
                          c.items.forEach(item => nextItems.add(item.id));
                        }
                        
                        setSelectedChapterIds(nextChapters);
                        setSelectedItemIds(nextItems);
                      }}
                    />
                    <span className="font-bold text-zinc-800 flex-1">{c.name}</span>
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  </label>
                  <div className="p-3 space-y-1">
                    {c.items.map((item) => (
                      <label key={item.id} className="flex items-center gap-4 p-3 pl-14 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-zinc-300 text-[#0d8282] focus:ring-[#0d8282]"
                          checked={selectedItemIds.has(item.id)}
                          onChange={() => {
                            const next = new Set(selectedItemIds);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            setSelectedItemIds(next);
                          }}
                        />
                        <span className="text-[15px] font-medium text-zinc-500 group-hover:text-zinc-800 transition-colors">{item.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" className="rounded-xl h-12 px-8 font-medium border-zinc-200" onClick={() => setStep("documents")}>Hủy</Button>
              <Button 
                className="rounded-xl h-12 px-8 font-bold bg-[#0d8282] hover:bg-[#0a6666] text-white shadow-sm"
                onClick={() => setStep("viewing")}
                disabled={selectedChapterIds.size === 0 && selectedItemIds.size === 0}
              >
                Xác nhận lựa chọn
              </Button>
            </div>
          </div>
        ) : step === "viewing" && activeMaterial ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 md:p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-[#0d8282]" />
              <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-[#0d8282]/10 text-[#0d8282] text-[11px] font-bold uppercase tracking-widest">
                    Study Material
                  </div>
                  <h2 className="text-4xl font-black tracking-tight text-zinc-900 leading-[1.2]">
                    {activeMaterial.resource}
                  </h2>
                  <div className="text-zinc-500 flex items-center justify-center gap-4 text-[14px] font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {activeMaterial.date}</span>
                    <div className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span className="flex items-center gap-1.5"><File className="h-4 w-4" /> {activeMaterial.format}</span>
                  </div>
                </div>

                <div className="space-y-16">
                  {activeMaterial.chapters
                    .filter(c => selectedChapterIds.has(c.id) || c.items.some(i => selectedItemIds.has(i.id)))
                    .map((c) => (
                    <section key={c.id} className="space-y-8">
                      <div className="space-y-3 border-b border-zinc-100 pb-5">
                        <h3 className="text-2xl font-bold text-zinc-800">{c.name}</h3>
                        <div className="h-1 w-16 bg-[#0d8282] rounded-full" />
                      </div>
                      
                      <div className="space-y-10">
                        {c.items
                          .filter(i => selectedItemIds.has(i.id))
                          .map((item) => (
                          <div key={item.id} className="space-y-5">
                            <h4 className="text-xl font-bold text-[#0d8282] flex items-center gap-2">
                              <Plus className="h-5 w-5" /> {item.name}
                            </h4>
                            <div className="text-zinc-600 leading-[1.8] text-[16px] space-y-4">
                              <p>
                                Nội dung chi tiết cho mục <span className="font-bold text-zinc-800">"{item.name}"</span> đang được hệ thống RAG xử lý. 
                                Đây là kiến thức quan trọng nằm trong chương <span className="font-medium text-zinc-800">{c.name}</span>.
                              </p>
                              <p>
                                Hệ thống StudyMate AI đang phân tích tài liệu để trích xuất các ý chính, định nghĩa quan trọng và ví dụ minh họa 
                                giúp sinh viên dễ dàng nắm bắt kiến thức một cách khoa học nhất.
                              </p>
                              <div className="p-6 rounded-2xl bg-[#0d8282]/5 border border-[#0d8282]/20 text-[15px] italic text-zinc-700 font-medium">
                                "Kiến thức là nền tảng của sự phát triển. Việc nắm bắt các khái niệm cơ bản trong {item.name} sẽ là chìa khóa 
                                để giải quyết các bài tập phức tạp hơn sau này."
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

      {/* CRUD Modals */}
      <Dialog open={isUploadModalOpen || isEditModalOpen} onOpenChange={(open) => { !open && (setIsUploadModalOpen(false), setIsEditModalOpen(false)); }}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? "Chỉnh sửa tài liệu" : "Tải lên tài liệu mới"}</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tài liệu và cấu trúc các chương mục.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {!isEditModalOpen && (
              <div className="grid gap-2">
                <Label className="font-bold">Tài liệu tải lên</Label>
                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer",
                    isUploading ? "opacity-50 cursor-not-allowed" : "",
                    selectedFile ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    disabled={isUploading}
                  />
                  {selectedFile ? (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary text-white">
                        <File className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-foreground truncate max-w-[250px]">{selectedFile.name}</div>
                        <div className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <div className="text-sm font-medium text-foreground text-center">Chọn tệp từ máy tính</div>
                      <div className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX (Tối đa 50MB)</div>
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-bold">Tên tài liệu</Label>
              <Input 
                id="name" 
                value={currentMaterial?.resource || ""} 
                onChange={(e) => setCurrentMaterial(prev => ({ ...prev, resource: e.target.value }))}
                className="rounded-xl"
                placeholder="Ví dụ: Advanced Calculus Chapter 4"
                disabled={isUploading}
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Cấu trúc đề mục</Label>
              <div className="space-y-4 max-h-[300px] overflow-auto p-1">
                {currentMaterial?.chapters?.map((ch, chIdx) => (
                  <div key={chIdx} className="p-3 rounded-xl border border-border bg-muted/10 space-y-3">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Tên chương" 
                        value={ch.name} 
                        onChange={(e) => {
                          const newChapters = [...(currentMaterial?.chapters || [])];
                          newChapters[chIdx].name = e.target.value;
                          setCurrentMaterial(prev => ({ ...prev, chapters: newChapters }));
                        }}
                        className="rounded-lg h-9"
                        disabled={isUploading}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 shrink-0 text-destructive"
                        onClick={() => {
                          const newChapters = currentMaterial?.chapters?.filter((_, i) => i !== chIdx);
                          setCurrentMaterial(prev => ({ ...prev, chapters: newChapters }));
                        }}
                        disabled={isUploading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="pl-4 space-y-2">
                      {ch.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-2">
                          <Input 
                            placeholder="Tên mục nhỏ" 
                            value={item.name} 
                            onChange={(e) => {
                              const newChapters = [...(currentMaterial?.chapters || [])];
                              newChapters[chIdx].items[itemIdx].name = e.target.value;
                              setCurrentMaterial(prev => ({ ...prev, chapters: newChapters }));
                            }}
                            className="rounded-lg h-8 text-xs"
                            disabled={isUploading}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 shrink-0 text-destructive opacity-50 hover:opacity-100"
                            onClick={() => {
                              const newChapters = [...(currentMaterial?.chapters || [])];
                              newChapters[chIdx].items = newChapters[chIdx].items.filter((_, i) => i !== itemIdx);
                              setCurrentMaterial(prev => ({ ...prev, chapters: newChapters }));
                            }}
                            disabled={isUploading}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-[10px] h-7 px-2"
                        onClick={() => {
                          const newChapters = [...(currentMaterial?.chapters || [])];
                          newChapters[chIdx].items.push({ id: Math.random().toString(), name: "" });
                          setCurrentMaterial(prev => ({ ...prev, chapters: newChapters }));
                        }}
                        disabled={isUploading}
                      >
                        + Thêm mục nhỏ
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl border-dashed"
                  onClick={() => {
                    const newChapters = [...(currentMaterial?.chapters || []), { id: Math.random().toString(), name: "", items: [] }];
                    setCurrentMaterial(prev => ({ ...prev, chapters: newChapters }));
                  }}
                  disabled={isUploading}
                >
                  + Thêm chương mới
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsUploadModalOpen(false); setIsEditModalOpen(false); }} className="rounded-xl" disabled={isUploading}>Hủy</Button>
            <Button onClick={handleSave} className="rounded-xl font-bold" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài liệu</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài liệu <span className="font-bold text-foreground">{currentMaterial?.resource}</span>? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl font-bold">Xác nhận xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSubjectModalOpen} onOpenChange={setIsAddSubjectModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Thêm môn học mới</DialogTitle>
            <DialogDescription>
              Nhập tên môn học bạn muốn giảng dạy. Tài liệu sẽ được tổ chức theo từng môn học này.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subjectName" className="font-bold text-sm">Tên môn học</Label>
              <Input 
                id="subjectName" 
                placeholder="Ví dụ: Biology, Chemistry, v.v." 
                value={newSubjectName} 
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSubject()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubjectModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSaveSubject} className="rounded-xl font-bold">Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
