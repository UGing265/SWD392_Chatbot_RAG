"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, MessageSquareText, Clock, Pin, ChevronRight, Plus } from "lucide-react";
import { sessionList, createSession } from "@/lib/sessions-store";

export function SessionsView() {
  const params = useParams();
  const router = useRouter();
  const role = (params?.role as string) || "student";

  const [filter, setFilter] = useState("Gần đây");

  const handleOpen = (id: string) => {
    router.push(`/${role}/chat?session=${id}`);
  };

  const handleNewSession = () => {
    const s = createSession();
    router.push(`/${role}/chat?session=${s.id}`);
  };

  return (
    <div className="scrollbar-thin h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Phiên hội thoại</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Xem lại và tiếp tục các phiên chat trước đây.
            </p>
          </div>
          <button
            onClick={handleNewSession}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Phiên mới
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-soft sm:max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Tìm theo từ khoá…"
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["Gần đây", "Quan trọng", "Tất cả"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === t
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {["Hôm nay", "Hôm qua", "Tuần này", "Trước đó"].map((group) => {
          const items = sessionList.filter((s) => s.date === group);
          if (!items.length) return null;
          return (
            <div key={group} className="mb-6">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </div>
              <div className="flex flex-col gap-2">
                {items.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleOpen(s.id)}
                    className={`group flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3.5 text-left shadow-soft transition-all hover:border-primary/40 hover:bg-primary-soft/30 hover:shadow-md ${
                      s.status === "active" ? "ring-2 ring-primary/30" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <MessageSquareText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="line-clamp-1 text-sm font-medium text-foreground">
                          {s.title}
                        </span>
                        {s.starred && <Pin className="h-3.5 w-3.5 -rotate-45 text-primary shrink-0" />}
                        {s.status === "active" && (
                          <span className="rounded-full bg-secondary-soft px-2 py-0.5 text-[10px] font-medium text-secondary-foreground shrink-0">
                            Đang mở
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {s.time}
                        </span>
                        <span>{s.msgs} tin nhắn</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
