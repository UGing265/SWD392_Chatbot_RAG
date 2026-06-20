"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CloudUpload, FileText, CheckCircle2, Loader2, X, BookOpen, Calendar, Lock, Globe, Languages, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Subject {
  id: string;
  name: string;
}

interface AcademicTerm {
  id: string;
  name: string;
}

interface DocumentType {
  id: string;
  name: string;
}

interface Language {
  id: string;
  name: string;
}

interface DocumentSource {
  id: string;
  name: string;
}

export function UploadView() {
  const router = useRouter();
  const pathname = usePathname();
  const role = pathname.split("/")[1] || "lecturer";

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [termId, setTermId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [langId, setLangId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [visibility, setVisibility] = useState("private");
  
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [documentSources, setDocumentSources] = useState<DocumentSource[]>([]);

  const useMockData = () => {
    const mockSubjects: Subject[] = [
      { id: "1", name: "Lập trình Web" },
      { id: "2", name: "Cơ sở dữ liệu" },
      { id: "3", name: "Toán cao cấp" },
      { id: "4", name: "Mạng máy tính" },
    ];

    const mockTerms: AcademicTerm[] = [
      { id: "1", name: "HK1 2024-2025" },
      { id: "2", name: "HK2 2024-2025" },
      { id: "3", name: "HK1 2025-2026" },
    ];

    const mockTypes: DocumentType[] = [
      { id: "1", name: "Slide Bài giảng" },
      { id: "2", name: "Giáo trình" },
      { id: "3", name: "Đề thi" },
    ];

    const mockLangs: Language[] = [
      { id: "1", name: "Tiếng Việt" },
      { id: "2", name: "Tiếng Anh" },
    ];

    const mockSources: DocumentSource[] = [
      { id: "1", name: "Tự soạn" },
      { id: "2", name: "Sưu tầm" },
    ];

    setSubjects(mockSubjects);
    setTerms(mockTerms);
    setDocumentTypes(mockTypes);
    setLanguages(mockLangs);
    setDocumentSources(mockSources);
  };

  const fetchLookups = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/documents/lookups", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
        const sortedTerms = (data.academicTerms || []).sort(
          (a: any, b: any) => (a.term_order || 0) - (b.term_order || 0)
        );
        setTerms(sortedTerms);
        setDocumentTypes(data.documentTypes || []);
        setLanguages(data.languages || []);
        setDocumentSources(data.documentSources || []);
      } else {
        console.warn("Failed to fetch lookups, falling back to mock data");
        useMockData();
      }
    } catch (error) {
      console.error("Failed to fetch lookups:", error);
      useMockData();
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Vui lòng chọn file.");
      return;
    }
    if (!subjectId) {
      alert("Vui lòng chọn môn học.");
      return;
    }
    if (!termId) {
      alert("Vui lòng chọn kỳ học.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject_id", subjectId);
    formData.append("academic_term_id", termId);
    formData.append("visibility", visibility);

    if (typeId && typeId !== "none") {
      formData.append("document_type_id", typeId);
    }
    if (langId && langId !== "none") {
      formData.append("language_id", langId);
    }
    if (sourceId && sourceId !== "none") {
      formData.append("document_source_id", sourceId);
    }

    try {
      const response = await fetch("http://localhost:8080/api/documents/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploaded(true);
        setTimeout(() => {
          setUploaded(false);
          resetForm();
          router.push(`/${role}/documents/my`);
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setSubjectId("");
    setTermId("");
    setTypeId("");
    setLangId("");
    setSourceId("");
    setVisibility("private");
  };

  const removeFile = () => {
    setFile(null);
    if (title === file?.name.replace(/\.[^/.]+$/, "")) {
      setTitle("");
    }
  };

  if (uploaded) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-6">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-soft">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Tải lên thành công!
          </h2>
          <p className="text-muted-foreground text-sm">Tài liệu của bạn đang được xử lý</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tải lên tài liệu mới
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chia sẻ tài liệu giảng dạy với sinh viên của bạn. Hỗ trợ PDF, DOC, DOCX, PPT, PPTX.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* File Upload Area */}
        <div className="relative group">
          <input
            type="file"
            id="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="file"
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-10 md:p-14 transition-all duration-300",
              file
                ? "border-primary bg-primary-soft/30 shadow-soft"
                : "border-border bg-white hover:border-primary/50 hover:bg-muted/15 hover:shadow-soft"
            )}
          >
            {file ? (
              <div className="flex w-full items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-base text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    removeFile();
                  }}
                  disabled={uploading}
                  className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <CloudUpload className="h-8 w-8" />
                </div>
                <p className="mb-1 font-semibold text-lg text-foreground">Kéo và thả file vào đây</p>
                <p className="text-sm text-muted-foreground">hoặc nhấp để chọn file từ máy tính</p>
                <div className="mt-5 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span className="px-2.5 py-1 rounded-md bg-muted">PDF</span>
                  <span className="px-2.5 py-1 rounded-md bg-muted">DOC</span>
                  <span className="px-2.5 py-1 rounded-md bg-muted">DOCX</span>
                  <span className="px-2.5 py-1 rounded-md bg-muted">PPT</span>
                  <span className="px-2.5 py-1 rounded-md bg-muted">PPTX</span>
                </div>
              </>
            )}
          </label>
        </div>

        {/* Document Details */}
        <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-soft space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm font-semibold text-foreground">Tiêu đề tài liệu</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề tài liệu"
              required
              disabled={uploading}
              className="h-11 text-sm rounded-xl border border-border bg-white focus-visible:ring-1 focus-visible:ring-primary shadow-soft"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground">Mô tả ngắn gọn</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về nội dung tài liệu..."
              rows={3}
              disabled={uploading}
              className="rounded-xl border border-border bg-white text-sm focus-visible:ring-1 focus-visible:ring-primary resize-none shadow-soft"
            />
          </div>

          {/* Academic Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Môn học *
              </Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={uploading}>
                <SelectTrigger id="subject" className="h-11 rounded-xl border border-border bg-white focus:ring-1 focus:ring-primary shadow-soft">
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="term" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Kỳ học *
              </Label>
              <Select value={termId} onValueChange={setTermId} disabled={uploading}>
                <SelectTrigger id="term" className="h-11 rounded-xl border border-border bg-white focus:ring-1 focus:ring-primary shadow-soft">
                  <SelectValue placeholder="Chọn kỳ học" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Document Metadata */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="documentType" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Loại tài liệu
              </Label>
              <Select value={typeId} onValueChange={setTypeId} disabled={uploading}>
                <SelectTrigger id="documentType" className="h-11 rounded-xl border border-border bg-white focus:ring-1 focus:ring-primary shadow-soft">
                  <SelectValue placeholder="Chọn loại học liệu (tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {documentTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="language" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" />
                Ngôn ngữ
              </Label>
              <Select value={langId} onValueChange={setLangId} disabled={uploading}>
                <SelectTrigger id="language" className="h-11 rounded-xl border border-border bg-white focus:ring-1 focus:ring-primary shadow-soft">
                  <SelectValue placeholder="Chọn ngôn ngữ (tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {languages.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="documentSource" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Nguồn tài liệu
              </Label>
              <Select value={sourceId} onValueChange={setSourceId} disabled={uploading}>
                <SelectTrigger id="documentSource" className="h-11 rounded-xl border border-border bg-white focus:ring-1 focus:ring-primary shadow-soft">
                  <SelectValue placeholder="Chọn nguồn (tùy chọn)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {documentSources.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="visibility" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Quyền riêng tư
              </Label>
              <Select value={visibility} onValueChange={setVisibility} disabled={uploading}>
                <SelectTrigger id="visibility" className="h-11 rounded-xl border border-border bg-white focus:ring-1 focus:ring-primary shadow-soft">
                  <SelectValue placeholder="Chọn quyền riêng tư" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span>Riêng tư (chỉ mình tôi)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="school_wide">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-emerald-600" />
                      <span>Công khai (tài liệu chung)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-all duration-300"
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải lên...
            </>
          ) : (
            <>
              <CloudUpload className="mr-2 h-4 w-4" />
              Tải lên tài liệu
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
