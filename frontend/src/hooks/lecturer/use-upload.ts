import { useState, useEffect } from "react";

export interface Subject {
  id: string;
  name: string;
  academicTermId?: string;
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
  const [subjectId, setSubjectIdRaw] = useState("");
  const [termId, setTermIdRaw] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/documents/lookups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch lookups");
        const data = await res.json();

        // 1. Get assigned subjects for the lecturer
        const apiSubjects = data.subjects || [];
        const mappedSubjects: Subject[] = apiSubjects.map((s: any) => ({
          id: s.id,
          name: `${s.code} - ${s.name}`,
          academicTermId: s.academic_term_id || "",
        }));
        setSubjects(mappedSubjects);

        // 2. Filter terms: only include terms associated with the assigned subjects
        const assignedTermIds = new Set(apiSubjects.map((s: any) => s.academic_term_id).filter(Boolean));
        const apiTerms = data.academicTerms || [];
        const mappedTerms: AcademicTerm[] = apiTerms
          .filter((t: any) => assignedTermIds.has(t.id))
          .map((t: any) => ({
            id: t.id,
            name: t.name,
          }));
        setTerms(mappedTerms);

        // Keep mock chapters since chapters are dynamically generated after upload
        const mockChapters: Chapter[] = [
          { id: "1", name: "Chương 1: Tổng quan" },
          { id: "2", name: "Chương 2: Cơ sở lý thuyết" },
          { id: "3", name: "Chương 3: Phương pháp nghiên cứu" },
        ];
        setChapters(mockChapters);
      } catch (err) {
        console.error("Failed to fetch lookups in useUpload:", err);
      }
    };
    fetchLookups();
  }, []);

  const setSubjectId = (id: string) => {
    setSubjectIdRaw(id);
    if (id) {
      const sub = subjects.find((s) => s.id === id);
      if (sub && sub.academicTermId) {
        setTermIdRaw(sub.academicTermId);
      }
    }
  };

  const setTermId = (id: string) => {
    setTermIdRaw(id);
    if (id && subjectId) {
      const sub = subjects.find((s) => s.id === subjectId);
      if (sub && sub.academicTermId !== id) {
        setSubjectIdRaw("");
      }
    }
  };

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
    setSubjectIdRaw("");
    setTermIdRaw("");
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
