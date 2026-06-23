import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface Document {
  id: string;
  title: string;
  description: string | null;
  subject_name: string | null;
  academic_term_name: string | null;
  visibility: string;
  status: string;
  created_at: string;
  updated_at: string;
  slug?: string;
  view_count: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  academicTermId?: string;
}

export interface AcademicTerm {
  id: string;
  name: string;
  year?: string;
  order?: number;
}

export interface DocumentType {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
}

export interface DocumentSource {
  id: string;
  name: string;
}

export function useMyDocuments() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = pathname.split("/")[1] || "student";

  // URL state
  const q = searchParams.get("q") || "";
  const subjectId = searchParams.get("subjectId") || "";
  const termId = searchParams.get("termId") || "";
  const documentTypeId = searchParams.get("documentTypeId") || "";
  const languageId = searchParams.get("languageId") || "";
  const documentSourceId = searchParams.get("documentSourceId") || "";
  const sortBy = searchParams.get("sortBy") || "date_desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Lookups
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [documentSources, setDocumentSources] = useState<DocumentSource[]>([]);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/documents/lookups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        
        // MyDocuments usually shows ALL terms/subjects the user has access to or global. 
        // We will just map them as returned.
        setSubjects((data.subjects || []).map((s: any) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          academicTermId: s.academic_term_id,
        })));
        setTerms((data.academicTerms || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          year: t.year,
          order: t.order,
        })));
        setDocumentTypes((data.documentTypes || []).map((dt: any) => ({ id: dt.id, name: dt.name })));
        setLanguages((data.languages || []).map((l: any) => ({ id: l.id, name: l.name })));
        setDocumentSources((data.documentSources || []).map((ds: any) => ({ id: ds.id, name: ds.name })));
      } catch (err) {
        console.error("Failed to fetch lookups:", err);
      }
    };
    fetchLookups();
  }, []);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy: sortBy,
      });
      if (q) params.set("q", q);
      if (subjectId) params.set("subjectId", subjectId);
      if (termId) params.set("termId", termId);
      if (documentTypeId) params.set("documentTypeId", documentTypeId);
      if (languageId) params.set("languageId", languageId);
      if (documentSourceId) params.set("documentSourceId", documentSourceId);

      const response = await fetch(`http://localhost:8080/api/documents/my?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setTotalDocuments(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, [q, subjectId, termId, documentTypeId, languageId, documentSourceId, sortBy, page]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    // Reset page to 1 when filters change (unless page is explicitly passed)
    if (!newParams.page) {
      current.delete("page");
    }
    router.push(`/${role}/documents/my?${current.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/${role}/documents/my`);
  };

  const handleDelete = async (e: React.MouseEvent, docSlug: string | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    if (!docSlug) return;
    if (!confirm("Bạn có chắc chắn muốn xoá tài liệu này không?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/documents/${docSlug}/delete`, {
        method: "POST", // Adjust to actual HTTP method if it's DELETE
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return {
    role,
    router,
    loading,
    documents,
    totalDocuments,
    totalPages,
    page,
    q,
    subjectId,
    termId,
    documentTypeId,
    languageId,
    documentSourceId,
    sortBy,
    updateFilters,
    clearFilters,
    subjects,
    terms,
    documentTypes,
    languages,
    documentSources,
    handleDelete,
  };
}
