import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface DocumentListItem {
  id: string;
  slug: string;
  title: string;
  preview_text?: string;
  description?: string | null;
  subject_name?: string | null;
  subject_code?: string | null;
  academic_term_name?: string | null;
  owner_email?: string | null;
  document_type_name?: string | null;
  visibility: string;
  status?: string;
  view_count?: number;
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

export function useSharedDocuments() {
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

  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const fetchDocuments = useCallback(async (signal?: AbortSignal) => {
    // We only fetch documents if we are in "Search mode" or "Subject mode"
    // Wait, .NET also shows documents when searching globally.
    // Let's just always fetch, or only fetch when needed. We'll handle the condition in the component.
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

      const response = await fetch(`http://localhost:8080/api/documents?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        signal,
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setTotalDocuments(data.total_documents || 0);
        setTotalPages(data.total_pages || 1);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, [q, subjectId, termId, documentTypeId, languageId, documentSourceId, sortBy, page]);

  useEffect(() => {
    // Only fetch if we are NOT in root mode and NOT in term mode
    // (i.e. we are in subject mode or search mode)
    // Actually, .NET searches if `q` or `subjectId` or other filters are set.
    const isSearchMode = !!q || !!documentTypeId || !!languageId || !!documentSourceId;
    const isSubjectMode = !!subjectId;
    // In .NET, if you select just a Term, it shows the list of Subjects. It does NOT fetch documents.
    // Unless we are in SearchMode.
    const shouldFetchDocs = isSearchMode || isSubjectMode;

    if (shouldFetchDocs) {
      const controller = new AbortController();
      fetchDocuments(controller.signal);
      return () => controller.abort();
    } else {
      // Clear documents
      setDocuments([]);
      setTotalDocuments(0);
      setTotalPages(1);
    }
  }, [fetchDocuments, q, subjectId, termId, documentTypeId, languageId, documentSourceId]);

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
    router.push(`/${role}/documents/shared?${current.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/${role}/documents/shared`);
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
  };
}
