import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notifications";
import { ragApi } from "@/api/client";


export interface DocumentDetails {
  id: string;
  title: string;
  description: string | null;
  subject_id: string | null;
  document_type_id: string | null;
  academic_term_id: string | null;
  language_id: string | null;
  document_source_id: string | null;
  visibility: string;
}

export function useEditDocument(slug: string, role: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [document, setDocument] = useState<DocumentDetails | null>(null);

  // Lookups
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [documentSources, setDocumentSources] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [termId, setTermId] = useState<string | null>(null);
  const [documentTypeId, setDocumentTypeId] = useState<string | null>(null);
  const [languageId, setLanguageId] = useState<string | null>(null);
  const [documentSourceId, setDocumentSourceId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState("school_wide");

  const fetchLookupsAndDocument = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Lookups
      const lookupsRes = await ragApi.get("/documents/lookups");
      const lookupsData = lookupsRes.data;
      setSubjects(lookupsData.subjects || []);
      setTerms(lookupsData.academicTerms || []);
      setDocumentTypes(lookupsData.documentTypes || []);
      setLanguages(lookupsData.languages || []);
      setDocumentSources(lookupsData.documentSources || []);

      // Fetch Document Details
      const docRes = await ragApi.get(`/documents/${slug}`);
      const docInfo = docRes.data;
      setDocument(docInfo);
      
      // Initialize form
      setTitle(docInfo.title || "");
      setDescription(docInfo.description || "");
      setSubjectId(docInfo.subject_id || null);
      setTermId(docInfo.academic_term_id || null);
      setDocumentTypeId(docInfo.document_type_id || null);
      setLanguageId(docInfo.language_id || null);
      setDocumentSourceId(docInfo.document_source_id || null);
      setVisibility(docInfo.visibility || "school_wide");
    } catch (err) {
      console.error("Failed to fetch data:", err);
      notify.error("Không tìm thấy tài liệu hoặc lỗi tải dữ liệu.");
      router.push(`/${role}/documents/my`);
    } finally {
      setLoading(false);
    }
  }, [slug, role, router]);

  useEffect(() => {
    fetchLookupsAndDocument();
  }, [fetchLookupsAndDocument]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    if (!title.trim()) {
      notify.error("Vui lòng nhập tiêu đề tài liệu.");
      return;
    }

    setSaving(true);
    try {
      await ragApi.post(`/documents/${slug}/edit`, {
        id: document.id,
        title: title.trim(),
        description: description.trim() || null,
        subject_id: subjectId,
        document_type_id: documentTypeId,
        academic_term_id: termId,
        language_id: languageId,
        document_source_id: documentSourceId,
        visibility: visibility,
      });

      notify.success("Cập nhật tài liệu thành công.");
      router.push(`/${role}/documents/my`);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || "Đã xảy ra lỗi khi lưu.";
      notify.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    subjects,
    terms,
    documentTypes,
    languages,
    documentSources,
    
    title, setTitle,
    description, setDescription,
    subjectId, setSubjectId,
    termId, setTermId,
    documentTypeId, setDocumentTypeId,
    languageId, setLanguageId,
    documentSourceId, setDocumentSourceId,
    visibility, setVisibility,
    
    handleSubmit,
    router,
    role,
  };
}
