"use client";

import { CheckCircle2, XCircle, AlertCircle, Clock, ChevronRight, Play } from "lucide-react";
import { useState } from "react";

type Status = "correct" | "wrong" | "review" | "pending";

const cases: {
  id: string;
  q: string;
  expected: string;
  actual: string;
  score: number;
  status: Status;
}[] = [
  {
    id: "Q01",
    q: "UML là gì?",
    expected: "Ngôn ngữ mô hình hoá thống nhất dùng để mô tả hệ thống phần mềm.",
    actual: "UML là ngôn ngữ mô hình hoá trực quan tiêu chuẩn để mô tả hệ thống phần mềm.",
    score: 0.94,
    status: "correct",
  },
  {
    id: "Q02",
    q: "Liệt kê các loại sơ đồ UML hành vi.",
    expected: "Use case, sequence, activity, state, communication, timing, interaction overview.",
    actual: "Use case, sequence, activity, state.",
    score: 0.71,
    status: "review",
  },
  {
    id: "Q03",
    q: "Microservices là gì?",
    expected: "Kiến trúc chia hệ thống thành các dịch vụ nhỏ, độc lập.",
    actual:
      "Microservices là kiến trúc với các service nhỏ, triển khai độc lập, giao tiếp qua API.",
    score: 0.91,
    status: "correct",
  },
  {
    id: "Q04",
    q: "Khác biệt giữa MVC và MVVM?",
    expected: "MVVM dùng data binding hai chiều giữa View và ViewModel.",
    actual: "MVC và MVVM đều tách logic, nhưng MVVM dùng binding.",
    score: 0.62,
    status: "review",
  },
  {
    id: "Q05",
    q: "TDD là gì?",
    expected: "Test-Driven Development: viết test trước, code sau.",
    actual: "TDD là chu trình red-green-refactor, viết test trước rồi triển khai.",
    score: 0.88,
    status: "correct",
  },
  {
    id: "Q06",
    q: "CI/CD viết tắt của gì?",
    expected: "Continuous Integration / Continuous Delivery.",
    actual: "Continuous Integration và Continuous Deployment.",
    score: 0.45,
    status: "wrong",
  },
  {
    id: "Q07",
    q: "Scrum có những vai trò nào?",
    expected: "Product Owner, Scrum Master, Development Team.",
    actual: "—",
    score: 0,
    status: "pending",
  },
];

const statusConfig: Record<Status, { label: string; class: string; icon: typeof CheckCircle2 }> = {
  correct: {
    label: "Đúng",
    class: "bg-secondary-soft text-secondary-foreground",
    icon: CheckCircle2,
  },
  wrong: { label: "Sai", class: "bg-destructive/20 text-destructive-foreground", icon: XCircle },
  review: {
    label: "Cần xem lại",
    class: "bg-warning/30 text-warning-foreground",
    icon: AlertCircle,
  },
  pending: { label: "Chưa đánh giá", class: "bg-muted text-muted-foreground", icon: Clock },
};

export function EvaluationView() {
  const [selected, setSelected] = useState<string | null>("Q02");
  const cur = cases.find((c) => c.id === selected) ?? cases[0];

  const stats = {
    total: 50,
    correct: 38,
    wrong: 5,
    review: 4,
    pending: 3,
    acc: 76,
  };

  return (
    <div className="scrollbar-thin h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Evaluation</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bộ 50 câu hỏi kiểm thử so sánh với ground truth.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">
              Xuất kết quả
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-soft hover:opacity-90">
              <Play className="h-3.5 w-3.5" />
              Chạy đánh giá
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard label="Tổng" value={stats.total} tone="muted" />
          <StatCard label="Đúng" value={stats.correct} tone="secondary" />
          <StatCard label="Sai" value={stats.wrong} tone="destructive" />
          <StatCard label="Xem lại" value={stats.review} tone="warning" />
          <StatCard label="Độ chính xác" value={`${stats.acc}%`} tone="primary" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_400px]">
          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center gap-2 border-b border-border p-3">
              {["Tất cả", "Đúng", "Sai", "Xem lại", "Chưa đánh giá"].map((t, i) => (
                <button
                  key={t}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    i === 0
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-3 py-3 font-medium">Câu hỏi</th>
                  <th className="px-3 py-3 font-medium">Score</th>
                  <th className="px-3 py-3 font-medium">Trạng thái</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => {
                  const s = statusConfig[c.status];
                  const Icon = s.icon;
                  const active = c.id === selected;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c.id)}
                      className={`cursor-pointer border-b border-border/60 last:border-0 ${active ? "bg-primary-soft/40" : "hover:bg-muted/40"}`}
                    >
                      <td className="px-4 py-3 tabular-nums text-xs text-muted-foreground">
                        {c.id}
                      </td>
                      <td className="px-3 py-3">
                        <span className="line-clamp-1 text-foreground">{c.q}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${c.score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(c.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${s.class}`}
                        >
                          <Icon className="h-3 w-3" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detail */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <span className="tabular-nums text-xs text-muted-foreground">{cur.id}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusConfig[cur.status].class}`}
              >
                {statusConfig[cur.status].label}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{cur.q}</h3>

            <div className="mt-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Expected answer
              </div>
              <div className="rounded-xl border border-border bg-secondary-soft/40 p-3 text-sm text-foreground">
                {cur.expected}
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Bot answer
              </div>
              <div className="rounded-xl border border-border bg-primary-soft/40 p-3 text-sm text-foreground">
                {cur.actual || <span className="text-muted-foreground">Chưa có phản hồi</span>}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">Similarity</span>
              <span className="text-sm font-semibold text-foreground">
                {(cur.score * 100).toFixed(0)}%
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted">
                Đánh dấu đúng
              </button>
              <button className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted">
                Chạy lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "muted" | "secondary" | "destructive" | "warning" | "primary";
}) {
  const toneClass = {
    muted: "text-foreground",
    secondary: "text-secondary-foreground",
    destructive: "text-destructive-foreground",
    warning: "text-warning-foreground",
    primary: "text-primary",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
