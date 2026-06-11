"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

interface AcademicTerm {
  id: string;
  name: string;
  order: number;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  academic_term_id: string | null;
}

type SavingAction =
  | "create-term"
  | `update-term-${string}`
  | `delete-term-${string}`
  | `create-subject-${string}`
  | `update-subject-${string}`
  | `delete-subject-${string}`;

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

function authOnlyHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeTerm(term: any): AcademicTerm {
  return {
    id: String(term.id),
    name: term.name || "",
    order: Number(term.order ?? term.term_order ?? 0),
  };
}

function normalizeSubject(subject: any): Subject {
  return {
    id: String(subject.id),
    code: subject.code || "",
    name: subject.name || "",
    academic_term_id:
      subject.academic_term_id ??
      subject.academicTermId ??
      subject.academicTermID ??
      null,
  };
}

async function readApiError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null);
  return payload?.error || fallback;
}

export function AdminCurriculumView() {
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingAction, setSavingAction] = useState<SavingAction | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editingTermName, setEditingTermName] = useState("");
  const [editingTermOrder, setEditingTermOrder] = useState(0);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectCode, setEditingSubjectCode] = useState("");
  const [editingSubjectName, setEditingSubjectName] = useState("");

  const [addingTerm, setAddingTerm] = useState(false);
  const [newTermName, setNewTermName] = useState("");
  const [newTermOrder, setNewTermOrder] = useState(1);
  const [addingSubjectForTerm, setAddingSubjectForTerm] = useState<string | null>(null);
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  const sortedTerms = useMemo(
    () => [...terms].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [terms]
  );

  const nextTermOrder = useMemo(() => {
    if (terms.length === 0) return 1;
    return Math.max(...terms.map((term) => term.order)) + 1;
  }, [terms]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/documents/lookups`, {
        headers: authOnlyHeaders(),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Không thể tải danh sách học kỳ."));
      }

      const data = await res.json();
      setTerms((data.academicTerms || []).map(normalizeTerm));
      setSubjects(Array.isArray(data.subjects) ? data.subjects.map(normalizeSubject) : []);
    } catch (err) {
      console.error("Failed to fetch curriculum data:", err);
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu học kỳ.");
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
      const res = await fetch(`${API}/api/admin/academic-terms`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name, order: newTermOrder }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Tạo học kỳ thất bại."));
      }

      resetTermForm();
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo học kỳ.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleUpdateTerm = async (term: AcademicTerm) => {
    const name = editingTermName.trim();
    if (!name || savingAction) return;

    const action: SavingAction = `update-term-${term.id}`;
    setSavingAction(action);
    try {
      const res = await fetch(`${API}/api/admin/academic-terms/${term.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ name, order: editingTermOrder }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Cập nhật học kỳ thất bại."));
      }

      setEditingTermId(null);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật học kỳ.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleDeleteTerm = async (term: AcademicTerm) => {
    const termSubjects = subjectsForTerm(term.id);
    const message =
      termSubjects.length > 0
        ? `Xóa học kỳ "${term.name}"? ${termSubjects.length} môn học trong kỳ này sẽ bị gỡ liên kết.`
        : `Xóa học kỳ "${term.name}"?`;

    if (!confirm(message) || savingAction) return;

    const action: SavingAction = `delete-term-${term.id}`;
    setSavingAction(action);
    try {
      const res = await fetch(`${API}/api/admin/academic-terms/${term.id}`, {
        method: "DELETE",
        headers: authOnlyHeaders(),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Xóa học kỳ thất bại."));
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi khi xóa học kỳ.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleCreateSubject = async (termId: string) => {
    if (!newSubjectCode.trim() || !newSubjectName.trim() || savingAction) return;

    const action: SavingAction = `create-subject-${termId}`;
    setSavingAction(action);
    try {
      const res = await fetch(`${API}/api/admin/subjects`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          code: newSubjectCode.trim(),
          name: newSubjectName.trim(),
          academicTermId: termId,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Tạo môn học thất bại."));
      }

      setNewSubjectCode("");
      setNewSubjectName("");
      setAddingSubjectForTerm(null);
      setExpandedTerms((prev) => new Set(prev).add(termId));
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo môn học.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleUpdateSubject = async (sub: Subject) => {
    if (!editingSubjectCode.trim() || !editingSubjectName.trim() || savingAction) return;

    const action: SavingAction = `update-subject-${sub.id}`;
    setSavingAction(action);
    try {
      const res = await fetch(`${API}/api/admin/subjects/${sub.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          code: editingSubjectCode.trim(),
          name: editingSubjectName.trim(),
          academicTermId: sub.academic_term_id,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Cập nhật môn học thất bại."));
      }

      setEditingSubjectId(null);
      if (sub.academic_term_id) {
        setExpandedTerms((prev) => new Set(prev).add(sub.academic_term_id as string));
      }
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật môn học.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Xóa môn học này?") || savingAction) return;

    const action: SavingAction = `delete-subject-${subjectId}`;
    setSavingAction(action);
    try {
      const res = await fetch(`${API}/api/admin/subjects/${subjectId}`, {
        method: "DELETE",
        headers: authOnlyHeaders(),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Xóa môn học thất bại."));
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi khi xóa môn học.");
    } finally {
      setSavingAction(null);
    }
  };

  const subjectsForTerm = (termId: string) =>
    subjects.filter((subject) => subject.academic_term_id === termId);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý học kỳ &amp; Môn học
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Thêm, sửa, xóa học kỳ và môn học trong hệ thống
          </p>
        </div>
        <Button
          onClick={startAddingTerm}
          disabled={savingAction !== null}
          className="rounded-2xl bg-primary px-6 font-semibold text-white shadow-soft hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm học kỳ
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {addingTerm && (
            <div className="rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-5">
              <p className="mb-3 text-sm font-semibold text-primary">Học kỳ mới</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  autoFocus
                  placeholder="Tên học kỳ, ví dụ: HK1 2026-2027"
                  value={newTermName}
                  onChange={(event) => setNewTermName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleCreateTerm();
                    if (event.key === "Escape") resetTermForm();
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="number"
                  min={0}
                  aria-label="Thứ tự học kỳ"
                  value={newTermOrder}
                  onChange={(event) => setNewTermOrder(Number(event.target.value))}
                  className="w-full rounded-xl border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-28"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTerm}
                    disabled={!newTermName.trim() || savingAction === "create-term"}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingAction === "create-term" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Lưu
                  </button>
                  <button
                    onClick={resetTermForm}
                    disabled={savingAction === "create-term"}
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-4 text-xs text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {sortedTerms.length === 0 && !addingTerm && (
            <div className="rounded-3xl border border-dashed border-border/60 bg-white p-12 text-center">
              <Layers className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Chưa có học kỳ nào. Nhấn &ldquo;Thêm học kỳ&rdquo; để bắt đầu.
              </p>
            </div>
          )}

          {sortedTerms.map((term) => {
            const termSubjects = subjectsForTerm(term.id);
            const isExpanded = expandedTerms.has(term.id);
            const isUpdatingTerm = savingAction === `update-term-${term.id}`;
            const isDeletingTerm = savingAction === `delete-term-${term.id}`;

            return (
              <div key={term.id} className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-soft">
                <div className="flex items-center gap-4 px-6 py-4">
                  <button
                    onClick={() => toggleTerm(term.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                  >
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    {editingTermId === term.id ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          autoFocus
                          value={editingTermName}
                          onChange={(event) => setEditingTermName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") handleUpdateTerm(term);
                            if (event.key === "Escape") setEditingTermId(null);
                          }}
                          className="min-w-0 flex-1 rounded-xl border border-primary bg-white px-3 py-1.5 text-base font-semibold focus:outline-none"
                        />
                        <input
                          type="number"
                          min={0}
                          aria-label="Thứ tự học kỳ"
                          value={editingTermOrder}
                          onChange={(event) => setEditingTermOrder(Number(event.target.value))}
                          className="w-full rounded-xl border border-primary bg-white px-3 py-1.5 text-sm focus:outline-none sm:w-24"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateTerm(term)}
                            disabled={!editingTermName.trim() || isUpdatingTerm}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdatingTerm ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Lưu
                          </button>
                          <button
                            onClick={() => setEditingTermId(null)}
                            disabled={isUpdatingTerm}
                            className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <button onClick={() => toggleTerm(term.id)} className="text-left">
                          <h2 className="text-lg font-semibold text-foreground transition-colors hover:text-primary">
                            {term.name}
                          </h2>
                        </button>
                        <p className="text-xs text-muted-foreground">
                          Thứ tự {term.order} · {termSubjects.length} môn học
                        </p>
                      </div>
                    )}
                  </div>

                  {editingTermId !== term.id && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => startEditingTerm(term)}
                        disabled={savingAction !== null}
                        className="p-2 text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        title="Sửa học kỳ"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTerm(term)}
                        disabled={savingAction !== null}
                        className="p-2 text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                        title="Xóa học kỳ"
                      >
                        {isDeletingTerm ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-border/40 px-6 pb-6 pt-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Danh sách môn học
                      </h3>
                      <button
                        onClick={() => startAddingSubject(term.id)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        + Thêm môn học
                      </button>
                    </div>

                    {addingSubjectForTerm === term.id && (
                      <div className="mb-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
                        <p className="mb-3 text-xs font-semibold text-primary">Môn học mới</p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            autoFocus
                            placeholder="Mã môn, ví dụ: SWD392"
                            value={newSubjectCode}
                            onChange={(event) => setNewSubjectCode(event.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-36"
                          />
                          <input
                            placeholder="Tên môn học"
                            value={newSubjectName}
                            onChange={(event) => setNewSubjectName(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") handleCreateSubject(term.id);
                              if (event.key === "Escape") setAddingSubjectForTerm(null);
                            }}
                            className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCreateSubject(term.id)}
                              disabled={
                                !newSubjectCode.trim() ||
                                !newSubjectName.trim() ||
                                savingAction === `create-subject-${term.id}`
                              }
                              className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {savingAction === `create-subject-${term.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              Lưu
                            </button>
                            <button
                              onClick={() => setAddingSubjectForTerm(null)}
                              className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-4 text-xs text-muted-foreground hover:bg-muted"
                            >
                              <X className="h-3.5 w-3.5" />
                              Hủy
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {termSubjects.length === 0 && addingSubjectForTerm !== term.id ? (
                      <div className="rounded-2xl border border-dashed border-border/40 bg-muted/10 py-8 text-center">
                        <p className="text-sm text-muted-foreground">Chưa có môn học nào trong kỳ này</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {termSubjects.map((sub) => {
                          const isUpdatingSubject = savingAction === `update-subject-${sub.id}`;
                          const isDeletingSubject = savingAction === `delete-subject-${sub.id}`;

                          return (
                            <div key={sub.id} className="rounded-2xl border border-border/40 bg-muted/20 p-4">
                              {editingSubjectId === sub.id ? (
                                <div className="flex flex-col gap-2 sm:flex-row">
                                  <input
                                    autoFocus
                                    placeholder="Mã môn"
                                    value={editingSubjectCode}
                                    onChange={(event) => setEditingSubjectCode(event.target.value)}
                                    className="w-full rounded-xl border border-primary bg-white px-3 py-2 text-sm focus:outline-none sm:w-32"
                                  />
                                  <input
                                    placeholder="Tên môn học"
                                    value={editingSubjectName}
                                    onChange={(event) => setEditingSubjectName(event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") handleUpdateSubject(sub);
                                      if (event.key === "Escape") setEditingSubjectId(null);
                                    }}
                                    className="flex-1 rounded-xl border border-primary bg-white px-3 py-2 text-sm focus:outline-none"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateSubject(sub)}
                                      disabled={
                                        !editingSubjectCode.trim() ||
                                        !editingSubjectName.trim() ||
                                        isUpdatingSubject
                                      }
                                      className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isUpdatingSubject ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Check className="h-3.5 w-3.5" />
                                      )}
                                      Lưu
                                    </button>
                                    <button
                                      onClick={() => setEditingSubjectId(null)}
                                      disabled={isUpdatingSubject}
                                      className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-4 text-xs text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                      Hủy
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border/20">
                                      <BookOpen className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="block text-xs font-bold text-muted-foreground">{sub.code}</span>
                                      <h4 className="truncate font-semibold text-foreground">{sub.name}</h4>
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-1">
                                    <button
                                      onClick={() => startEditingSubject(sub)}
                                      disabled={savingAction !== null}
                                      className="p-1.5 text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                                      title="Sửa môn học"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSubject(sub.id)}
                                      disabled={savingAction !== null}
                                      className="p-1.5 text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                                      title="Xóa môn học"
                                    >
                                      {isDeletingSubject ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
