"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  BookOpen,
  FileText,
  Trash2,
  Layers,
  Pencil,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API = "http://localhost:8080";
const token = () => localStorage.getItem("token");
const authHeaders = () => ({ "Authorization": `Bearer ${token()}`, "Content-Type": "application/json" });

interface AcademicTerm {
  id: string;
  name: string;
  term_order: number;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  academic_term_id: string | null;
}

export function AdminCurriculumView() {
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  // Inline editing state
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editingTermValue, setEditingTermValue] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectCode, setEditingSubjectCode] = useState("");
  const [editingSubjectName, setEditingSubjectName] = useState("");

  // Add new term / subject state
  const [addingTerm, setAddingTerm] = useState(false);
  const [newTermName, setNewTermName] = useState("");
  const [addingSubjectForTerm, setAddingSubjectForTerm] = useState<string | null>(null);
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/documents/lookups`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTerms(
          (data.academicTerms || []).sort((a: AcademicTerm, b: AcademicTerm) => a.term_order - b.term_order)
        );
        setSubjects(data.subjects || []);
      } else {
        console.warn("Failed to load lookups, using empty state");
      }
    } catch (err) {
      console.error("Failed to fetch curriculum data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTerm = (termId: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(termId)) next.delete(termId);
      else next.add(termId);
      return next;
    });
  };

  // --- Academic Term CRUD ---
  const handleCreateTerm = async () => {
    if (!newTermName.trim()) return;
    try {
      const res = await fetch(`${API}/api/admin/academic-terms`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: newTermName.trim(), order: terms.length }),
      });
      if (res.ok) {
        setNewTermName("");
        setAddingTerm(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Tạo học kỳ thất bại");
      }
    } catch {
      alert("Đã xảy ra lỗi");
    }
  };

  const handleUpdateTerm = async (term: AcademicTerm) => {
    if (!editingTermValue.trim()) return;
    try {
      const res = await fetch(`${API}/api/admin/academic-terms/${term.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ name: editingTermValue.trim(), order: term.term_order }),
      });
      if (res.ok) {
        setEditingTermId(null);
        fetchData();
      } else {
        alert("Cập nhật học kỳ thất bại");
      }
    } catch {
      alert("Đã xảy ra lỗi");
    }
  };

  const handleDeleteTerm = async (termId: string) => {
    if (!confirm("Xóa học kỳ này? Các môn học trong kỳ sẽ bị gỡ liên kết.")) return;
    try {
      const res = await fetch(`${API}/api/admin/academic-terms/${termId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) fetchData();
      else alert("Xóa học kỳ thất bại");
    } catch {
      alert("Đã xảy ra lỗi");
    }
  };

  // --- Subject CRUD ---
  const handleCreateSubject = async (termId: string) => {
    if (!newSubjectCode.trim() || !newSubjectName.trim()) return;
    try {
      const res = await fetch(`${API}/api/admin/subjects`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          code: newSubjectCode.trim(),
          name: newSubjectName.trim(),
          academic_term_id: termId,
        }),
      });
      if (res.ok) {
        setNewSubjectCode("");
        setNewSubjectName("");
        setAddingSubjectForTerm(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Tạo môn học thất bại");
      }
    } catch {
      alert("Đã xảy ra lỗi");
    }
  };

  const handleUpdateSubject = async (sub: Subject) => {
    if (!editingSubjectCode.trim() || !editingSubjectName.trim()) return;
    try {
      const res = await fetch(`${API}/api/admin/subjects/${sub.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          code: editingSubjectCode.trim(),
          name: editingSubjectName.trim(),
          academic_term_id: sub.academic_term_id,
        }),
      });
      if (res.ok) {
        setEditingSubjectId(null);
        fetchData();
      } else {
        alert("Cập nhật môn học thất bại");
      }
    } catch {
      alert("Đã xảy ra lỗi");
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Xóa môn học này?")) return;
    try {
      const res = await fetch(`${API}/api/admin/subjects/${subjectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) fetchData();
      else alert("Xóa môn học thất bại");
    } catch {
      alert("Đã xảy ra lỗi");
    }
  };

  const subjectsForTerm = (termId: string) =>
    subjects.filter((s) => s.academic_term_id === termId);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
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
          onClick={() => { setAddingTerm(true); setNewTermName(""); }}
          className="rounded-2xl bg-primary px-6 shadow-soft hover:bg-primary/90 font-semibold text-white"
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
          {/* Add new term form */}
          {addingTerm && (
            <div className="rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-5">
              <p className="mb-3 text-sm font-semibold text-primary">Học kỳ mới</p>
              <div className="flex items-center gap-3">
                <input
                  autoFocus
                  placeholder="Tên học kỳ (ví dụ: HK1 2024-2025)"
                  value={newTermName}
                  onChange={(e) => setNewTermName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateTerm(); if (e.key === "Escape") setAddingTerm(false); }}
                  className="flex-1 rounded-xl border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button onClick={handleCreateTerm} className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setAddingTerm(false)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {terms.length === 0 && !addingTerm && (
            <div className="rounded-3xl border border-dashed border-border/60 bg-white p-12 text-center">
              <Layers className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Chưa có học kỳ nào. Nhấn &ldquo;Thêm học kỳ&rdquo; để bắt đầu.</p>
            </div>
          )}

          {terms.map((term) => {
            const termSubjects = subjectsForTerm(term.id);
            const isExpanded = expandedTerms.has(term.id);

            return (
              <div key={term.id} className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-soft">
                {/* Term header */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <button
                    onClick={() => toggleTerm(term.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
                  >
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingTermId === term.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editingTermValue}
                          onChange={(e) => setEditingTermValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleUpdateTerm(term); if (e.key === "Escape") setEditingTermId(null); }}
                          className="flex-1 rounded-xl border border-primary bg-white px-3 py-1.5 text-base font-semibold focus:outline-none"
                        />
                        <button onClick={() => handleUpdateTerm(term)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditingTermId(null)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button onClick={() => toggleTerm(term.id)} className="text-left">
                          <h2 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">{term.name}</h2>
                        </button>
                        <p className="text-xs text-muted-foreground">{termSubjects.length} môn học</p>
                      </div>
                    )}
                  </div>

                  {editingTermId !== term.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setEditingTermId(term.id); setEditingTermValue(term.name); }}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        title="Sửa tên học kỳ"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTerm(term.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        title="Xóa học kỳ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Subjects list (collapsible) */}
                {isExpanded && (
                  <div className="border-t border-border/40 px-6 pb-6 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Danh sách môn học
                      </h3>
                      <button
                        onClick={() => { setAddingSubjectForTerm(term.id); setNewSubjectCode(""); setNewSubjectName(""); }}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        + Thêm môn học
                      </button>
                    </div>

                    {/* Add subject form */}
                    {addingSubjectForTerm === term.id && (
                      <div className="mb-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
                        <p className="mb-3 text-xs font-semibold text-primary">Môn học mới</p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            autoFocus
                            placeholder="Mã môn (ví dụ: SWD392)"
                            value={newSubjectCode}
                            onChange={(e) => setNewSubjectCode(e.target.value)}
                            className="w-full sm:w-36 rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <input
                            placeholder="Tên môn học"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleCreateSubject(term.id); if (e.key === "Escape") setAddingSubjectForTerm(null); }}
                            className="flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleCreateSubject(term.id)} className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-white hover:bg-primary/90">
                              <Check className="h-3.5 w-3.5" /> Lưu
                            </button>
                            <button onClick={() => setAddingSubjectForTerm(null)} className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-4 text-xs text-muted-foreground hover:bg-muted">
                              <X className="h-3.5 w-3.5" /> Hủy
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
                        {termSubjects.map((sub) => (
                          <div key={sub.id} className="rounded-2xl border border-border/40 bg-muted/20 p-4">
                            {editingSubjectId === sub.id ? (
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <input
                                  autoFocus
                                  placeholder="Mã môn"
                                  value={editingSubjectCode}
                                  onChange={(e) => setEditingSubjectCode(e.target.value)}
                                  className="w-full sm:w-32 rounded-xl border border-primary bg-white px-3 py-2 text-sm focus:outline-none"
                                />
                                <input
                                  placeholder="Tên môn học"
                                  value={editingSubjectName}
                                  onChange={(e) => setEditingSubjectName(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") handleUpdateSubject(sub); if (e.key === "Escape") setEditingSubjectId(null); }}
                                  className="flex-1 rounded-xl border border-primary bg-white px-3 py-2 text-sm focus:outline-none"
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => handleUpdateSubject(sub)} className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-white hover:bg-primary/90">
                                    <Check className="h-3.5 w-3.5" /> Lưu
                                  </button>
                                  <button onClick={() => setEditingSubjectId(null)} className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-4 text-xs text-muted-foreground hover:bg-muted">
                                    <X className="h-3.5 w-3.5" /> Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border/20 shrink-0">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="block text-xs font-bold text-muted-foreground">{sub.code}</span>
                                    <h4 className="font-semibold text-foreground truncate">{sub.name}</h4>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => { setEditingSubjectId(sub.id); setEditingSubjectCode(sub.code); setEditingSubjectName(sub.name); }}
                                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                                    title="Sửa môn học"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubject(sub.id)}
                                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                    title="Xóa môn học"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
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
