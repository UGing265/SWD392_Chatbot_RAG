import { useState, useMemo, useRef, useEffect } from "react";
import { 
  CloudUpload, Filter, Search, FileText, CheckCircle2, 
  Loader2, AlertCircle, Trash2, Download, Video, 
  FileSpreadsheet, Plus, MoreVertical, Edit2, ChevronRight, ChevronDown, Upload, File
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

const initialSubjects = [
  { id: "S1", name: "Mathematics" },
  { id: "S2", name: "Computer Science" },
  { id: "S3", name: "Economics" },
];

const initialMaterials: Material[] = [
  { 
    id: "1", 
    resource: "Advanced Calculus Chapter 4", 
    subjectId: "S1", 
    date: "Oct 24, 2023", 
    format: "PDF", 
    status: "Ready",
    chapters: [
      { 
        id: "C1", 
        name: "Chapter 4.1: Derivatives",
        items: [
          { id: "I1", name: "Chain Rule" },
          { id: "I2", name: "Power Rule" }
        ]
      },
      { 
        id: "C2", 
        name: "Chapter 4.2: Integrals",
        items: [
          { id: "I3", name: "Substitution Method" }
        ]
      },
    ]
  },
  { 
    id: "2", 
    resource: "Intro to Machine Learning", 
    subjectId: "S2", 
    date: "Oct 25, 2023", 
    format: "PDF", 
    status: "Processing",
    chapters: [
      { 
        id: "C3", 
        name: "Chapter 1: Neurons",
        items: [
          { id: "I4", name: "Activation Functions" }
        ]
      }
    ]
  },
];

export function DocumentsView() {
  const [step, setStep] = useState<"subject" | "documents" | "chapters" | "viewing">("subject");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [mounted, setMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedMaterials = localStorage.getItem('study_mate_materials');
    const savedSubjects = localStorage.getItem('study_mate_subjects');
    
    if (savedMaterials) {
      try {
        setMaterials(JSON.parse(savedMaterials));
      } catch (e) {
        console.error("Failed to parse materials", e);
      }
    }
    
    if (savedSubjects) {
      try {
        setSubjects(JSON.parse(savedSubjects));
      } catch (e) {
        console.error("Failed to parse subjects", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('study_mate_materials', JSON.stringify(materials));
    }
  }, [materials, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('study_mate_subjects', JSON.stringify(subjects));
    }
  }, [subjects, isLoaded]);
  
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Partial<Material> | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMaterials = useMemo(() => 
    selectedSubject 
      ? materials.filter(m => m.subjectId === selectedSubject)
      : []
  , [materials, selectedSubject]);

  const activeMaterial = useMemo(() => 
    materials.find(m => m.id === selectedMaterialId)
  , [materials, selectedMaterialId]);

  const handleSaveSubject = () => {
    if (newSubjectName.trim()) {
      const newSubject = {
        id: "S" + (subjects.length + 1),
        name: newSubjectName.trim()
      };
      setSubjects([...subjects, newSubject]);
      setNewSubjectName("");
      setIsAddSubjectModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (currentMaterial?.id) {
      setMaterials(materials.filter(m => m.id !== currentMaterial.id));
      setIsDeleteModalOpen(false);
      setCurrentMaterial(null);
    }
  };

  const handleSave = () => {
    if (currentMaterial?.id) {
      // Edit
      setMaterials(materials.map(m => m.id === currentMaterial.id ? { ...m, ...currentMaterial } as Material : m));
    } else {
      // Add
      const newMaterial: Material = {
        ...(currentMaterial as any),
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "Ready",
        format: "PDF",
        chapters: currentMaterial?.chapters || []
      };
      setMaterials([...materials, newMaterial]);
    }
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentMaterial(null);
    setSelectedFile(null);
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

  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all", step === "subject" ? "bg-primary text-white scale-110 shadow-soft" : "bg-muted text-muted-foreground")}>1</div>
            <div className="h-px w-8 bg-border" />
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all", step === "documents" ? "bg-primary text-white scale-110 shadow-soft" : "bg-muted text-muted-foreground")}>2</div>
            <div className="h-px w-8 bg-border" />
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all", step === "chapters" ? "bg-primary text-white scale-110 shadow-soft" : "bg-muted text-muted-foreground")}>3</div>
            <div className="h-px w-8 bg-border" />
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all", step === "viewing" ? "bg-primary text-white scale-110 shadow-soft" : "bg-muted text-muted-foreground")}>4</div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {step === "subject" && "Chọn Môn Học"}
            {step === "documents" && "Quản Lý Tài Liệu"}
            {step === "chapters" && "Nội Dung Tài Liệu"}
            {step === "viewing" && "Xem Tài Liệu"}
          </h1>
        </div>

        {step === "documents" && (
          <Button onClick={() => { setCurrentMaterial({ subjectId: selectedSubject || "" }); setIsUploadModalOpen(true); }} className="rounded-xl shadow-soft hover:shadow-pop transition-all bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Tải lên tài liệu
          </Button>
        )}
      </div>

      {step === "subject" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelectedSubject(s.id); setStep("documents"); }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left shadow-soft transition-all hover:border-primary/50 hover:shadow-pop"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="font-bold text-lg text-foreground">{s.name}</div>
              </div>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
            </button>
          ))}
          <button
            onClick={() => setIsAddSubjectModalOpen(true)}
            className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 text-left transition-all hover:border-primary/50 hover:bg-muted/30"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110">
                <Plus className="h-6 w-6" />
              </div>
              <div className="font-bold text-lg text-muted-foreground group-hover:text-foreground">Thêm môn học</div>
            </div>
          </button>
        </div>
      )}

      {step === "documents" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setStep("subject")} className="text-sm font-medium text-primary hover:underline mb-4 flex items-center gap-1 group">
            <ChevronRight className="h-4 w-4 rotate-180 transform group-hover:-translate-x-1 transition-transform" /> 
            Quay lại chọn môn
          </button>
          <div className="rounded-2xl border border-border shadow-soft overflow-hidden bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Tài liệu</th>
                  <th className="px-6 py-4">Ngày tải lên</th>
                  <th className="px-6 py-4">Định dạng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMaterials.length > 0 ? filteredMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-foreground">{m.resource}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{m.date}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.format}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", m.status === "Ready" ? "bg-green-500" : "bg-amber-500")} />
                        <span className="text-xs font-medium">{m.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={() => { setCurrentMaterial(m); setIsEditModalOpen(true); }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onClick={() => { setCurrentMaterial(m); setIsDeleteModalOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => { setSelectedMaterialId(m.id); setStep("chapters"); }}
                          className="rounded-xl h-8 px-4 text-xs font-bold transition-all shadow-soft hover:shadow-pop"
                        >
                          Xem cấu trúc
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Chưa có tài liệu nào cho môn học này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === "chapters" && activeMaterial && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep("documents")} className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group">
              <ChevronRight className="h-4 w-4 rotate-180 transform group-hover:-translate-x-1 transition-transform" /> 
              Quay lại danh sách tài liệu
            </button>
            <div className="text-sm text-muted-foreground font-medium">
              Tài liệu: <span className="text-foreground font-bold">{activeMaterial.resource}</span>
            </div>
          </div>
          
          <div className="grid gap-4">
            {activeMaterial.chapters.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
                <label className="flex items-center gap-4 p-4 border-b border-border bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
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
                  <span className="font-bold text-foreground flex-1">{c.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </label>
                <div className="p-2 space-y-1">
                  {c.items.map((item) => (
                    <label key={item.id} className="flex items-center gap-4 p-3 pl-12 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedItemIds.has(item.id)}
                        onChange={() => {
                          const next = new Set(selectedItemIds);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          setSelectedItemIds(next);
                        }}
                      />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" className="rounded-xl px-8" onClick={() => setStep("documents")}>Hủy</Button>
            <Button 
              className="rounded-xl px-8 font-bold shadow-pop"
              onClick={() => setStep("viewing")}
              disabled={selectedChapterIds.size === 0 && selectedItemIds.size === 0}
            >
              Xác nhận lựa chọn
            </Button>
          </div>
        </div>
      )}

      {step === "viewing" && activeMaterial && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep("chapters")} className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group">
              <ChevronRight className="h-4 w-4 rotate-180 transform group-hover:-translate-x-1 transition-transform" /> 
              Quay lại chọn đề mục
            </button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl">
                <Download className="mr-2 h-4 w-4" /> Tải xuống
              </Button>
              <Button size="sm" className="rounded-xl">
                Lưu vào kho bài giảng
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-white p-8 md:p-12 shadow-pop relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                  Study Material
                </div>
                <h2 className="text-4xl font-black tracking-tight text-foreground leading-[1.1]">
                  {activeMaterial.resource}
                </h2>
                <div className="text-muted-foreground flex items-center justify-center gap-4 text-sm font-medium">
                  <span>Biology Dept.</span>
                  <div className="h-1 w-1 rounded-full bg-border" />
                  <span>{activeMaterial.date}</span>
                </div>
              </div>

              <div className="space-y-16">
                {activeMaterial.chapters
                  .filter(c => selectedChapterIds.has(c.id) || c.items.some(i => selectedItemIds.has(i.id)))
                  .map((c) => (
                  <section key={c.id} className="space-y-8">
                    <div className="space-y-2 border-b border-border pb-4">
                      <h3 className="text-2xl font-bold text-foreground">{c.name}</h3>
                      <div className="h-1 w-20 bg-primary/20 rounded-full" />
                    </div>
                    
                    <div className="space-y-12">
                      {c.items
                        .filter(i => selectedItemIds.has(i.id))
                        .map((item) => (
                        <div key={item.id} className="space-y-4">
                          <h4 className="text-xl font-bold text-primary flex items-center gap-2">
                            <Plus className="h-4 w-4 rotate-45" /> {item.name}
                          </h4>
                          <div className="text-muted-foreground leading-relaxed text-lg space-y-4 prose prose-slate max-w-none">
                            <p>
                              Nội dung chi tiết cho mục <span className="font-bold text-foreground">"{item.name}"</span> đang được hệ thống RAG xử lý. 
                              Đây là kiến thức quan trọng nằm trong chương <span className="font-medium text-foreground">{c.name}</span>.
                            </p>
                            <p>
                              Hệ thống StudyMate AI đang phân tích tài liệu để trích xuất các ý chính, định nghĩa quan trọng và ví dụ minh họa 
                              giúp sinh viên dễ dàng nắm bắt kiến thức một cách khoa học nhất.
                            </p>
                            <div className="p-6 rounded-2xl bg-muted/30 border border-border italic text-base">
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
      )}

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
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer",
                    selectedFile ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
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
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 shrink-0 text-destructive"
                        onClick={() => {
                          const newChapters = currentMaterial?.chapters?.filter((_, i) => i !== chIdx);
                          setCurrentMaterial(prev => ({ ...prev, chapters: newChapters }));
                        }}
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
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 shrink-0"
                            onClick={() => {
                              const newChapters = [...(currentMaterial?.chapters || [])];
                              newChapters[chIdx].items = newChapters[chIdx].items.filter((_, i) => i !== itemIdx);
                              setCurrentMaterial(prev => ({ ...prev, chapters: newChapters }));
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] h-7 px-2"
                        onClick={() => {
                          const newChapters = [...(currentMaterial?.chapters || [])];
                          newChapters[chIdx].items.push({ id: Math.random().toString(), name: "" });
                          setCurrentMaterial(prev => ({ ...prev, chapters: newChapters }));
                        }}
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
                >
                  + Thêm chương mới
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsUploadModalOpen(false); setIsEditModalOpen(false); }} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSave} className="rounded-xl font-bold">Lưu thay đổi</Button>
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
  );
}
