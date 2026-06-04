"use client";

import { useState } from "react";
import { BookOpen, UserCheck, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const lecturers = [
  { id: "L-001", name: "Nguyễn Văn Minh", email: "minhnv@fe.edu.vn" },
  { id: "L-002", name: "Trần Thị Thu", email: "thutt@fe.edu.vn" },
];

const subjects = [
  { id: "S-001", code: "PRN222", name: "Component-based Development" },
  { id: "S-002", code: "SWD392", name: "Software Architecture" },
  { id: "S-003", code: "PRU211", name: "C# Programming" },
  { id: "S-004", code: "PRN231", name: "Web API Development" },
];

export function AdminAssignmentsView() {
  const [selectedLecturer, setSelectedLecturer] = useState(lecturers[0].id);
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>(["S-001", "S-003"]);

  const toggleSubject = (id: string) => {
    setAssignedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
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
            <h2 className="text-lg font-bold text-foreground">
              Phân công môn học cho Giảng viên
            </h2>
          </div>

          <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
            Giảng viên chỉ có thể tải lên tài liệu học tập cho những môn học đã được phân công dưới đây. 
            Việc này giúp đảm bảo tính chính xác và bảo mật của dữ liệu RAG.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Chọn Giảng viên
              </label>
              <div className="relative">
                <select
                  value={selectedLecturer}
                  onChange={(e) => setSelectedLecturer(e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-border bg-muted/30 px-4 text-sm font-medium focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                >
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.email})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Môn học phân công
              </label>
              <div className="grid gap-3">
                {subjects.map((subject) => (
                  <label
                    key={subject.id}
                    className={cn(
                      "group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:bg-muted/50",
                      assignedSubjects.includes(subject.id)
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/60 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                          assignedSubjects.includes(subject.id)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-white border-border group-hover:border-primary/50"
                        )}
                        onClick={() => toggleSubject(subject.id)}
                      >
                        {assignedSubjects.includes(subject.id) && (
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
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {subject.code}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {subject.name}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-deep py-4 text-sm font-bold text-white shadow-soft transition-all hover:opacity-90 active:scale-[0.98]">
                <Save className="h-4 w-4" />
                Lưu phân công môn học
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
