"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, MessageSquareText, Clock, Pin, ChevronRight, Plus, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Session {
  id: string;
  course_id: string;
  title: string;
  is_starred: boolean;
  status: "active" | "done";
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: string;
  name: string;
}

export function SessionsView() {
  const params = useParams();
  const router = useRouter();
  const role = (params?.role as string) || "student";

  const [filter, setFilter] = useState("Tất cả");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create session dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/chat/sessions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data || []);
      } else {
        console.warn("Failed to fetch sessions");
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/documents/lookups", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchSubjects();
  }, []);

  const handleOpen = (id: string) => {
    router.push(`/${role}/chat?session=${id}`);
  };

  const handleNewSessionClick = () => {
    setSessionTitle("");
    setSelectedSubjectId("");
    setCreateOpen(true);
  };

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      alert("Vui lòng chọn môn học.");
      return;
    }

    setCreating(true);
    try {
      const subjectName = subjects.find(s => s.id === selectedSubjectId)?.name || "Môn học";
      const titleText = sessionTitle.trim() || `Hỏi đáp ${subjectName}`;

      const res = await fetch("http://localhost:8080/api/chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          course_id: selectedSubjectId,
          title: titleText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreateOpen(false);
        router.push(`/${role}/chat?session=${data.id}`);
      } else {
        alert("Không thể tạo phiên chat mới.");
      }
    } catch (err) {
      console.error("Create session error:", err);
      alert("Đã xảy ra lỗi.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc muốn xóa phiên trò chuyện này?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/chat/sessions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        fetchSessions();
      } else {
        alert("Xóa phiên chat thất bại.");
      }
    } catch (err) {
      console.error("Delete session error:", err);
    }
  };

  // Date grouping helper
  const getGroupLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return "Tuần này";
    return "Trước đó";
  };

  // Formatting helper
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " " + date.toLocaleDateString("vi-VN");
  };

  const filteredSessions = sessions.filter((s) => {
    // Search query filter
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Star filter
    if (filter === "Quan trọng") return s.is_starred;
    if (filter === "Gần đây") {
      const diffDays = Math.floor((new Date().getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 2;
    }
    return true;
  });

  // Grouping
  const groups: Record<string, Session[]> = {
    "Hôm nay": [],
    "Hôm qua": [],
    "Tuần này": [],
    "Trước đó": [],
  };

  filteredSessions.forEach((s) => {
    const label = getGroupLabel(s.created_at);
    groups[label].push(s);
  });

  return (
    <div className="scrollbar-thin h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Phiên hội thoại</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Xem lại và tiếp tục các phiên chat trước đây.
            </p>
          </div>
          <button
            onClick={handleNewSessionClick}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Phiên mới
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-soft sm:max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Tìm theo tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["Gần đây", "Quan trọng", "Tất cả"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  filter === t
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "border border-border bg-white text-muted-foreground hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Loading and List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <MessageSquareText className="mx-auto mb-4 h-12 w-12 opacity-35" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Không tìm thấy phiên chat nào</h3>
            <p className="text-sm">Hãy tạo một phiên mới để bắt đầu học tập.</p>
          </div>
        ) : (
          ["Hôm nay", "Hôm qua", "Tuần này", "Trước đó"].map((group) => {
            const items = groups[group];
            if (!items.length) return null;
            return (
              <div key={group} className="mb-6">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  {group}
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleOpen(s.id)}
                      className={`group flex items-center gap-4 rounded-2xl border border-border bg-white px-4 py-3.5 text-left shadow-soft transition-all hover:border-primary/40 hover:bg-primary-soft/10 cursor-pointer ${
                        s.status === "active" ? "ring-2 ring-primary/30" : ""
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep font-semibold shadow-sm">
                        <MessageSquareText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="line-clamp-1 text-sm font-semibold text-foreground">
                            {s.title}
                          </span>
                          {s.is_starred && <Pin className="h-3.5 w-3.5 -rotate-45 text-primary-deep shrink-0" />}
                          {s.status === "active" && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 uppercase tracking-wide shrink-0">
                              Đang mở
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatTimeAgo(s.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          title="Xóa phiên chat"
                          className="opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Session Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <form onSubmit={handleCreateSessionSubmit}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Bắt đầu phiên học mới</DialogTitle>
              <DialogDescription className="text-sm">
                Chọn môn học để bắt đầu đặt câu hỏi cho RAG AI. Câu hỏi sẽ được trả lời dựa trên tài liệu của môn học này.
              </DialogDescription>
            </DialogHeader>

            <div className="my-5 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="createSubject" className="text-xs font-semibold text-foreground">Môn học *</Label>
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                  <SelectTrigger id="createSubject" className="h-11 rounded-xl border border-border bg-white shadow-soft">
                    <SelectValue placeholder="Chọn môn học để hỏi đáp" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="createTitle" className="text-xs font-semibold text-foreground">Tiêu đề phiên học (tùy chọn)</Label>
                <Input
                  id="createTitle"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="Nhập tiêu đề cuộc trò chuyện..."
                  className="h-11 text-sm rounded-xl border border-border bg-white shadow-soft"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="rounded-xl" disabled={!selectedSubjectId || creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Bắt đầu chat"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
