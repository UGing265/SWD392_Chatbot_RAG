import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ragApi } from "@/api/client";

export interface Document {
  id: string;
  title: string;
  description: string | null;
  preview_text?: string | null;
  subject_name: string | null;
  subject_code?: string | null;
  academic_term_name: string | null;
  visibility: string;
  status: string;
  created_at: string;
  updated_at: string;
  slug?: string;
  view_count: number;
}

export interface ActiveUploadJob {
  id: string;
  document_id?: string;
  file_name: string;
  file_size_bytes: number;
  status: string;
  progress_percent: number;
  message?: string;
  created_at: string;
  updated_at: string;
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
  const [activeUploadJobs, setActiveUploadJobs] = useState<ActiveUploadJob[]>([]);
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
        const res = await ragApi.get("/documents/lookups");
        const data = res.data;
        
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

  const fetchDocuments = useCallback(async (isPoll = false) => {
    if (!isPoll) setLoading(true);
    try {
      const response = await ragApi.get("/documents/my", {
        params: {
          page: page.toString(),
          pageSize: pageSize.toString(),
          sortBy: sortBy,
          ...(q && { q }),
          ...(subjectId && { subjectId }),
          ...(termId && { termId }),
          ...(documentTypeId && { documentTypeId }),
          ...(languageId && { languageId }),
          ...(documentSourceId && { documentSourceId }),
        }
      });

      const data = response.data;
      setDocuments(data.documents || []);
      setTotalDocuments(data.total_documents || 0);
      setTotalPages(data.total_pages || 1);
      setActiveUploadJobs(data.active_upload_jobs || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      if (!isPoll) setDocuments([]);
    } finally {
      if (!isPoll) setLoading(false);
    }
  }, [q, subjectId, termId, documentTypeId, languageId, documentSourceId, sortBy, page]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Polling active upload jobs in background
  useEffect(() => {
    if (activeUploadJobs.length === 0) return;

    const timer = setInterval(() => {
      fetchDocuments(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeUploadJobs.length, fetchDocuments]);

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
      await ragApi.post(`/documents/${docSlug}/delete`);
      fetchDocuments();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return {
    role,
    router,
    loading,
    documents,
    activeUploadJobs,
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
