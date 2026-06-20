import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { notify } from "@/lib/notifications";

export interface Subject {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  name: string;
  items: Item[];
}

export interface Material {
  id: string;
  slug: string;
  resource: string;
  subjectId: string;
  date: string;
  format: string;
  status: string;
  chapters: Chapter[];
}

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

function extractYearFromTermName(name: string): string {
  const match = name.match(/(\d{4}[-–]\d{4})/);
  if (match) return match[1];
  const yearMatch = name.match(/(\d{4})/);
  if (yearMatch) return yearMatch[1];
  return "Khác";
}

export function useLecturerDocuments() {
  const [step, setStep] = useState<"term" | "subject" | "documents" | "chapters" | "viewing">("term");
  const [selectedTerm, setSelectedTerm] = useState<{ id: string; name: string; year: string } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; termId: string }[]>([]);
  const [terms, setTerms] = useState<{ id: string; name: string; year: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const groupedTerms = useMemo(
    () =>
      terms.reduce(
        (acc, term) => {
          if (!acc[term.year]) acc[term.year] = [];
          acc[term.year].push(term);
          return acc;
        },
        {} as Record<string, typeof terms>
      ),
    [terms]
  );

  const fetchLookups = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/documents/lookups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch lookups");
      const data = await res.json();

      const apiTerms: ApiAcademicTerm[] = data.academicTerms || [];
      const mappedTerms = apiTerms.map((t) => ({
        id: t.id,
        name: t.name,
        year: extractYearFromTermName(t.name),
      }));
      setTerms(mappedTerms);

      const apiSubjects: ApiSubject[] = data.subjects || [];
      const mappedSubjects = apiSubjects.map((s) => ({
        id: s.id,
        name: `${s.code} - ${s.name}`,
        termId: s.academic_term_id || "",
      }));
      setSubjects(mappedSubjects);
    } catch (err) {
      console.error("Failed to fetch lookups:", err);
      notify.error("Không thể tải danh sách kỳ học và môn học.");
    }
  }, []);

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
        const ext = doc.title?.split(".").pop()?.toUpperCase();
        const format = ["PDF", "DOCX", "DOC", "PPTX", "PPT"].includes(ext || "") ? ext! : "PDF";

        let status = "Processing";
        if (doc.status === "completed") status = "Ready";
        else if (doc.status === "failed") status = "Failed";

        return {
          id: doc.id,
          slug: doc.slug,
          resource: doc.title,
          subjectId: doc.subject_id || "",
          date: new Date(doc.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
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

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchLookups(), fetchMyDocuments()]);
      setIsLoading(false);
    };
    load();
  }, [fetchLookups, fetchMyDocuments]);

  const filteredMaterials = useMemo(
    () => (selectedSubject ? materials.filter((m) => m.subjectId === selectedSubject.id) : []),
    [materials, selectedSubject]
  );

  const activeMaterial = useMemo(
    () => materials.find((m) => m.id === selectedMaterialId),
    [materials, selectedMaterialId]
  );

  const handleSaveSubject = () => {
    notify.info("Tính năng thêm môn học chỉ dành cho Admin.", "Vui lòng liên hệ quản trị viên để thêm môn học mới.");
    setNewSubjectName("");
    setIsAddSubjectModalOpen(false);
  };

  const handleDelete = async () => {
    if (currentMaterial?.id) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/documents/${currentMaterial.slug}/delete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Xóa thất bại");
        }
        await fetchMyDocuments();
        notify.success("Đã xóa tài liệu thành công.");
      } catch (err: any) {
        console.error(err);
        notify.error("Xóa thất bại", err.message);
      }
      setIsDeleteModalOpen(false);
      setCurrentMaterial(null);
    }
  };

  const handleSave = async () => {
    if (currentMaterial?.id && !selectedFile) {
      setMaterials(
        materials.map((m) => (m.id === currentMaterial.id ? ({ ...m, ...currentMaterial } as Material) : m))
      );
      setIsEditModalOpen(false);
      return;
    }

    if (!selectedFile) {
      notify.error("Vui lòng chọn một tệp để tải lên.");
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

      const term = subjects.find((s) => s.id === selectedSubject?.id)?.termId;
      if (term) {
        formData.append("academic_term_id", term);
      }

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/documents/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload thất bại");
      }

      await fetchMyDocuments();
      notify.success("Tải lên thành công!", "Tài liệu của bạn đang được hệ thống RAG xử lý ngầm.");
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setCurrentMaterial(null);
    } catch (err: any) {
      console.error(err);
      notify.error("Tải lên thất bại", err.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCurrentMaterial((prev) => ({
        ...prev,
        resource: file.name.split(".").slice(0, -1).join(".") || file.name,
        format: file.name.split(".").pop()?.toUpperCase() || "PDF",
        chapters: [
          {
            id: "C" + Math.random().toString(36).substr(2, 4),
            name: "Chương 1: Tổng quan tài liệu",
            items: [
              { id: "I" + Math.random().toString(36).substr(2, 4), name: "Giới thiệu chung" },
              { id: "I" + Math.random().toString(36).substr(2, 4), name: "Mục tiêu bài học" },
            ],
          },
          {
            id: "C" + Math.random().toString(36).substr(2, 4),
            name: "Chương 2: Nội dung chi tiết",
            items: [
              { id: "I" + Math.random().toString(36).substr(2, 4), name: "Kiến thức cơ bản" },
              { id: "I" + Math.random().toString(36).substr(2, 4), name: "Ví dụ minh họa" },
            ],
          },
          {
            id: "C" + Math.random().toString(36).substr(2, 4),
            name: "Chương 3: Câu hỏi ôn tập",
            items: [{ id: "I" + Math.random().toString(36).substr(2, 4), name: "Bài tập tự luyện" }],
          },
        ],
      }));
    }
  };

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

  return {
    step,
    setStep,
    selectedTerm,
    setSelectedTerm,
    selectedSubject,
    setSelectedSubject,
    selectedMaterialId,
    setSelectedMaterialId,
    selectedChapterIds,
    setSelectedChapterIds,
    selectedItemIds,
    setSelectedItemIds,
    materials,
    subjects,
    terms,
    isLoading,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isAddSubjectModalOpen,
    setIsAddSubjectModalOpen,
    currentMaterial,
    setCurrentMaterial,
    newSubjectName,
    setNewSubjectName,
    selectedFile,
    setSelectedFile,
    fileInputRef,
    isUploading,
    groupedTerms,
    filteredMaterials,
    activeMaterial,
    handleSaveSubject,
    handleDelete,
    handleSave,
    handleFileChange,
    handleBack,
  };
}
