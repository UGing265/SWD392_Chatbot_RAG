import { useState, useEffect } from "react";

export interface Subject {
  id: string;
  name: string;
}

export interface AcademicTerm {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  name: string;
}

export function useUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [termId, setTermId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    // Mock data for development
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

    const mockChapters: Chapter[] = [
      { id: "1", name: "Chương 1: Tổng quan" },
      { id: "2", name: "Chương 2: Cơ sở lý thuyết" },
      { id: "3", name: "Chương 3: Phương pháp nghiên cứu" },
    ];

    setSubjects(mockSubjects);
    setTerms(mockTerms);
    setChapters(mockChapters);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setSubjectId("");
    setTermId("");
    setChapterId("");
    setVisibility("private");
  };

  const removeFile = () => {
    setFile(null);
    if (title === file?.name.replace(/\.[^/.]+$/, "")) {
      setTitle("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject_id", subjectId);
    formData.append("academic_term_id", termId);
    formData.append("chapter_id", chapterId);
    formData.append("visibility", visibility);

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
          const role = window.location.pathname.split("/")[1] || "lecturer";
          window.location.href = `/${role}/documents/my`;
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

  return {
    file,
    setFile,
    title,
    setTitle,
    description,
    setDescription,
    subjectId,
    setSubjectId,
    termId,
    setTermId,
    chapterId,
    setChapterId,
    visibility,
    setVisibility,
    uploading,
    uploaded,
    subjects,
    terms,
    chapters,
    handleFileChange,
    removeFile,
    handleUpload,
    resetForm,
  };
}
