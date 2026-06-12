"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Loader2, Save, UserCheck } from "lucide-react";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

type Lecturer = {
  id: string;
  name: string;
  email: string;
};

type Subject = {
  id: string;
  code: string;
  name: string;
};

type Assignment = {
  userId: string;
  subjectId: string;
  createdAt: string;
  lecturerEmail?: string;
  lecturerName?: string;
  subjectCode?: string;
  subjectName?: string;
};

type ApiUser = {
  id: string;
  name?: string;
  email?: string;
  role_id?: number | string;
};

type ApiSubject = {
  id: string;
  code?: string;
  name?: string;
};

type ApiLookups = {
  subjects?: ApiSubject[];
};

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data as T;
}

export function AdminAssignmentsView() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const assignedBySubject = useMemo(() => {
    const map = new Map<string, Assignment>();
    assignments.forEach((assignment) => map.set(assignment.subjectId, assignment));
    return map;
  }, [assignments]);

  useEffect(() => {
    let cancelled = false;

    async function loadAssignmentsData() {
      setLoading(true);
      try {
        const headers = getAuthHeaders();
        const [usersData, lookupsData, assignmentsData] = await Promise.all([
          fetch(`${API}/api/admin/users`, { headers }).then((response) =>
            readJson<ApiUser[]>(response),
          ),
          fetch(`${API}/api/documents/lookups`, { headers }).then((response) =>
            readJson<ApiLookups>(response),
          ),
          fetch(`${API}/api/admin/user-subjects`, { headers }).then((response) =>
            readJson<Assignment[]>(response),
          ),
        ]);

        if (cancelled) return;

        const lecturerUsers = usersData
          .filter((user) => Number(user.role_id) === 2)
          .map((user) => ({
            id: String(user.id),
            name: user.name || user.email || "Lecturer",
            email: user.email || "",
          }));

        const subjectList = (lookupsData.subjects || []).map((subject) => ({
          id: String(subject.id),
          code: subject.code || "",
          name: subject.name || "",
        }));

        const firstLecturerId = lecturerUsers[0]?.id || "";

        setLecturers(lecturerUsers);
        setSubjects(subjectList);
        setAssignments(assignmentsData);
        setSelectedLecturer(firstLecturerId);
        setAssignedSubjects(
          assignmentsData
            .filter((assignment) => assignment.userId === firstLecturerId)
            .map((assignment) => assignment.subjectId),
        );
      } catch (err: unknown) {
        console.error("Error loading assignments data:", err);
        if (!cancelled) {
          notify.error("Không thể tải dữ liệu phân công", getErrorMessage(err, "Vui lòng thử lại sau."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAssignmentsData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectLecturer = (lecturerId: string) => {
    setSelectedLecturer(lecturerId);
    setAssignedSubjects(
      assignments
        .filter((assignment) => assignment.userId === lecturerId)
        .map((assignment) => assignment.subjectId),
    );
  };

  const toggleSubject = (subjectId: string) => {
    const existing = assignedBySubject.get(subjectId);
    if (existing && existing.userId !== selectedLecturer) {
      notify.error("Môn học đã được phân công", `${existing.subjectCode || "Môn này"} đang thuộc ${
        existing.lecturerEmail || "giảng viên khác"
      }.`);
      return;
    }

    setAssignedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    );
  };

  const handleSave = async () => {
    if (!selectedLecturer) {
      notify.error("Vui lòng chọn giảng viên.");
      return;
    }

    setSaving(true);
    try {
      const url = `${API}/api/admin/lecturers/${selectedLecturer}/subjects`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ subjectIds: assignedSubjects }),
      });

      const savedAssignments = await readJson<Assignment[]>(response);
      setAssignments((prev) => [
        ...prev.filter((assignment) => assignment.userId !== selectedLecturer),
        ...savedAssignments,
      ]);
      notify.success("Đã lưu phân công môn học thành công.");
    } catch (err: unknown) {
      console.error("Error saving assignments:", err);
      notify.error("Lưu phân công thất bại", getErrorMessage(err, "Vui lòng thử lại sau."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Phân công môn học giảng dạy
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Thiết lập danh sách môn học mà giảng viên có quyền quản lý và tải tài liệu
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-border/60 bg-white p-8 shadow-soft">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Phân công môn học cho giảng viên</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Chọn giảng viên
                </label>
                <div className="relative">
                  <select
                    value={selectedLecturer}
                    onChange={(e) => handleSelectLecturer(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border bg-muted/30 px-4 text-sm font-medium transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5"
                  >
                    {lecturers.length === 0 ? (
                      <option value="">Chưa có giảng viên</option>
                    ) : (
                      lecturers.map((lecturer) => (
                        <option key={lecturer.id} value={lecturer.id}>
                          {lecturer.name} ({lecturer.email})
                        </option>
                      ))
                    )}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-4 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Môn học phân công
                </label>
                <div className="grid gap-3">
                  {subjects.map((subject) => {
                    const existing = assignedBySubject.get(subject.id);
                    const assignedToOther = Boolean(
                      existing && existing.userId !== selectedLecturer,
                    );
                    const checked = assignedSubjects.includes(subject.id);

                    return (
                      <button
                        type="button"
                        key={subject.id}
                        disabled={assignedToOther}
                        onClick={() => toggleSubject(subject.id)}
                        className={cn(
                          "group flex cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-all hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-55",
                          checked ? "border-primary/30 bg-primary/5" : "border-border/60 bg-white",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                              checked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-white group-hover:border-primary/50",
                            )}
                          >
                            {checked && (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-foreground">
                              {subject.code}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {subject.name}
                            </span>
                          </span>
                        </div>
                        {assignedToOther && (
                          <span className="max-w-36 truncate text-right text-[11px] font-medium text-muted-foreground">
                            {existing?.lecturerEmail}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedLecturer}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-deep py-4 text-sm font-bold text-white shadow-soft transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Lưu phân công môn học
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

