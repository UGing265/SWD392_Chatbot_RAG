import { useState, useEffect, useCallback, useMemo } from "react";
import { curriculumApi, AcademicTerm, Subject } from "@/api/curriculum";
import { notify } from "@/lib/notifications";

export type SavingAction =
  | "create-term"
  | `update-term-${string}`
  | `delete-term-${string}`
  | `create-subject-${string}`
  | `update-subject-${string}`
  | `delete-subject-${string}`;

export function useCurriculum() {
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingAction, setSavingAction] = useState<SavingAction | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  // Form states for creating/editing terms
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editingTermName, setEditingTermName] = useState("");
  const [editingTermOrder, setEditingTermOrder] = useState(0);
  const [addingTerm, setAddingTerm] = useState(false);
  const [newTermName, setNewTermName] = useState("");
  const [newTermOrder, setNewTermOrder] = useState(1);

  // Form states for creating/editing subjects
  const [addingSubjectForTerm, setAddingSubjectForTerm] = useState<string | null>(null);
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectCode, setEditingSubjectCode] = useState("");
  const [editingSubjectName, setEditingSubjectName] = useState("");

  const sortedTerms = useMemo(() => {
    return [...terms].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }, [terms]);

  const nextTermOrder = useMemo(() => {
    if (terms.length === 0) return 1;
    return Math.max(...terms.map((t) => t.order)) + 1;
  }, [terms]);

  const normalizeTerm = (term: any): AcademicTerm => ({
    id: String(term.id),
    name: term.name || "",
    order: Number(term.order ?? term.term_order ?? 0),
  });

  const normalizeSubject = (subject: any): Subject => ({
    id: String(subject.id),
    code: subject.code || "",
    name: subject.name || "",
    academic_term_id:
      subject.academic_term_id ??
      subject.academicTermId ??
      subject.academicTermID ??
      null,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await curriculumApi.getLookups();
      setTerms((data.academicTerms || []).map(normalizeTerm));
      setSubjects(Array.isArray(data.subjects) ? data.subjects.map(normalizeSubject) : []);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Không thể tải dữ liệu chương trình học.";
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (addingTerm) {
      setNewTermOrder(nextTermOrder);
    }
  }, [addingTerm, nextTermOrder]);

  const toggleTerm = (termId: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(termId)) next.delete(termId);
      else next.add(termId);
      return next;
    });
  };

  const startAddingTerm = () => {
    setAddingTerm(true);
    setNewTermName("");
    setNewTermOrder(nextTermOrder);
  };

  const startEditingTerm = (term: AcademicTerm) => {
    setAddingTerm(false);
    setEditingTermId(term.id);
    setEditingTermName(term.name);
    setEditingTermOrder(term.order);
  };

  const resetTermForm = () => {
    setAddingTerm(false);
    setNewTermName("");
    setNewTermOrder(nextTermOrder);
    setEditingTermId(null);
    setEditingTermName("");
    setEditingTermOrder(0);
  };

  const handleCreateTerm = async () => {
    const name = newTermName.trim();
    if (!name || savingAction) return;

    setSavingAction("create-term");
    try {
      await curriculumApi.createTerm(name, newTermOrder);
      notify.success("Tạo học kỳ thành công");
      resetTermForm();
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Tạo học kỳ thất bại.";
      notify.error(msg);
    } finally {
      setSavingAction(null);
    }
  };

  const handleUpdateTerm = async (termId: string) => {
    const name = editingTermName.trim();
    if (!name || savingAction) return;

    setSavingAction(`update-term-${termId}`);
    try {
      await curriculumApi.updateTerm(termId, name, editingTermOrder);
      notify.success("Cập nhật học kỳ thành công");
      setEditingTermId(null);
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Cập nhật học kỳ thất bại.";
      notify.error(msg);
    } finally {
      setSavingAction(null);
    }
  };

  const handleDeleteTerm = async (term: AcademicTerm) => {
    const termSubjects = subjects.filter((s) => s.academic_term_id === term.id);
    const message =
      termSubjects.length > 0
        ? `Xóa học kỳ "${term.name}"? ${termSubjects.length} môn học trong kỳ này sẽ bị gỡ liên kết.`
        : `Xóa học kỳ "${term.name}"?`;

    if (!confirm(message) || savingAction) return;

    setSavingAction(`delete-term-${term.id}`);
    try {
      await curriculumApi.deleteTerm(term.id);
      notify.success("Xóa học kỳ thành công");
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Xóa học kỳ thất bại.";
      notify.error(msg);
    } finally {
      setSavingAction(null);
    }
  };

  const startAddingSubject = (termId: string) => {
    setAddingSubjectForTerm(termId);
    setEditingSubjectId(null);
    setNewSubjectCode("");
    setNewSubjectName("");
    setExpandedTerms((prev) => new Set(prev).add(termId));
  };

  const startEditingSubject = (subject: Subject) => {
    setAddingSubjectForTerm(null);
    setEditingSubjectId(subject.id);
    setEditingSubjectCode(subject.code);
    setEditingSubjectName(subject.name);
  };

  const handleCreateSubject = async (termId: string) => {
    const code = newSubjectCode.trim();
    const name = newSubjectName.trim();
    if (!code || !name || savingAction) return;

    setSavingAction(`create-subject-${termId}`);
    try {
      await curriculumApi.createSubject(code, name, termId);
      notify.success("Tạo môn học thành công");
      setNewSubjectCode("");
      setNewSubjectName("");
      setAddingSubjectForTerm(null);
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Tạo môn học thất bại.";
      notify.error(msg);
    } finally {
      setSavingAction(null);
    }
  };

  const handleUpdateSubject = async (subject: Subject) => {
    const code = editingSubjectCode.trim();
    const name = editingSubjectName.trim();
    if (!code || !name || savingAction) return;

    setSavingAction(`update-subject-${subject.id}`);
    try {
      await curriculumApi.updateSubject(subject.id, code, name, subject.academic_term_id);
      notify.success("Cập nhật môn học thành công");
      setEditingSubjectId(null);
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Cập nhật môn học thất bại.";
      notify.error(msg);
    } finally {
      setSavingAction(null);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Xóa môn học này?") || savingAction) return;

    setSavingAction(`delete-subject-${subjectId}`);
    try {
      await curriculumApi.deleteSubject(subjectId);
      notify.success("Xóa môn học thành công");
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Xóa môn học thất bại.";
      notify.error(msg);
    } finally {
      setSavingAction(null);
    }
  };

  return {
    terms,
    subjects,
    loading,
    error,
    savingAction,
    expandedTerms,
    sortedTerms,
    addingTerm,
    newTermName,
    newTermOrder,
    editingTermId,
    setEditingTermId,
    editingTermName,
    editingTermOrder,
    addingSubjectForTerm,
    newSubjectCode,
    newSubjectName,
    editingSubjectId,
    editingSubjectCode,
    editingSubjectName,
    setNewTermName,
    setNewTermOrder,
    setEditingTermName,
    setEditingTermOrder,
    setNewSubjectCode,
    setNewSubjectName,
    setEditingSubjectCode,
    setEditingSubjectName,
    toggleTerm,
    startAddingTerm,
    startEditingTerm,
    resetTermForm,
    handleCreateTerm,
    handleUpdateTerm,
    handleDeleteTerm,
    startAddingSubject,
    startEditingSubject,
    setAddingSubjectForTerm,
    setEditingSubjectId,
    handleCreateSubject,
    handleUpdateSubject,
    handleDeleteSubject,
    refresh: fetchData,
  };
}
