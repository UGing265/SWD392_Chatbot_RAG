import { useState, useEffect, useCallback, useMemo } from "react";
import { curriculumApi, Subject } from "@/api/curriculum";
import { documentApi } from "@/api/document";
import { notify } from "@/lib/notifications";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const getString = (value: unknown) => (typeof value === "string" ? value : "");

const getErrorMessage = (err: unknown, fallback: string) => {
  const errorRecord = asRecord(err);
  const responseRecord = asRecord(errorRecord.response);
  const dataRecord = asRecord(responseRecord.data);
  const apiError = dataRecord.error;
  const message = errorRecord.message;

  if (typeof apiError === "string") return apiError;
  if (typeof message === "string") return message;
  return fallback;
};

export type SavingAction =
  | `create-subject-standalone`
  | `update-subject-${string}`
  | `delete-subject-${string}`;

export function useCurriculum() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingAction, setSavingAction] = useState<SavingAction | null>(null);
  const [subjectAccessCounts, setSubjectAccessCounts] = useState<Record<string, number>>({});

  // Form states for creating/editing subjects
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectCode, setEditingSubjectCode] = useState("");
  const [editingSubjectName, setEditingSubjectName] = useState("");

  const [addingStandaloneSubject, setAddingStandaloneSubject] = useState(false);

  const normalizeSubject = (subject: unknown): Subject => {
    const data = asRecord(subject);
    return {
      id: String(data.id ?? ""),
      code: getString(data.code),
      name: getString(data.name),
    };
  };

  const fetchSubjectAccessCounts = useCallback(async () => {
    const counts: Record<string, number> = {};
    let page = 1;
    let totalPages = 1;

    try {
      do {
        const data = await documentApi.getDocuments({ page, pageSize: 100 });

        for (const doc of data.documents || []) {
          const subjectId = doc.subject_id;
          if (!subjectId) continue;

          counts[String(subjectId)] =
            (counts[String(subjectId)] || 0) + Number(doc.view_count || 0);
        }

        totalPages = data.total_pages || 1;
        page += 1;
      } while (page <= totalPages);

      setSubjectAccessCounts(counts);
    } catch (err) {
      console.warn("Failed to fetch subject access counts", err);
      setSubjectAccessCounts({});
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await curriculumApi.getLookups();
      setSubjects(Array.isArray(data.subjects) ? data.subjects.map(normalizeSubject) : []);
      await fetchSubjectAccessCounts();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Không thể tải dữ liệu chương trình học.");
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchSubjectAccessCounts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEditingSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setEditingSubjectCode(subject.code);
    setEditingSubjectName(subject.name);
  };

  const handleCreateSubject = async () => {
    const code = newSubjectCode.trim();
    const name = newSubjectName.trim();
    if (!code || !name || savingAction) return;

    setSavingAction(`create-subject-standalone`);
    try {
      await curriculumApi.createSubject(code, name);
      notify.success("Tạo môn học thành công");
      setNewSubjectCode("");
      setNewSubjectName("");
      setAddingStandaloneSubject(false);
      await fetchData();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Tạo môn học thất bại.");
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
      await curriculumApi.updateSubject(subject.id, code, name);
      notify.success("Cập nhật môn học thành công");
      setEditingSubjectId(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Cập nhật môn học thất bại.");
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
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Xóa môn học thất bại.");
      notify.error(msg);
    } finally {
      setSavingAction(null);
    }
  };

  return {
    subjects,
    loading,
    error,
    savingAction,
    subjectAccessCounts,
    newSubjectCode,
    newSubjectName,
    editingSubjectId,
    editingSubjectCode,
    editingSubjectName,
    addingStandaloneSubject,
    setAddingStandaloneSubject,
    setNewSubjectCode,
    setNewSubjectName,
    setEditingSubjectCode,
    setEditingSubjectName,
    startEditingSubject,
    setEditingSubjectId,
    handleCreateSubject,
    handleUpdateSubject,
    handleDeleteSubject,
    refresh: fetchData,
  };
}
