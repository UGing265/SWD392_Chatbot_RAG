"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  FileText,
  User,
  Paperclip,
  CheckCircle2,
  History,
  Plus,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Citation {
  chunk_id: string;
  file_name: string;
  page_label: string;
  excerpt: string;
  relevance_score: number;
}

interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  outOfScope?: boolean;
  citations?: Citation[];
}

interface ScopedDoc {
  id: string;
  title: string;
}

export function ChatView() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const role = (params?.role as string) || "student";
  const sessionId = searchParams?.get("session") ?? null;

  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Scoped documents list
  const [availableDocs, setAvailableDocs] = useState<ScopedDoc[]>([]);
  const [scopedDocs, setScopedDocs] = useState<string[]>([]);
  const [scopeOpen, setScopeOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch documents for the active subject (course)
  const fetchSessionDocs = async (courseId: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/documents?subjectId=${courseId}&pageSize=100`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableDocs(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to load scoped docs:", err);
    }
  };

  // Fetch session meta details
  const fetchSessionDetails = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/chat/sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        if (data.course_id) {
          fetchSessionDocs(data.course_id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch session details:", err);
    }
  };

  // Fetch history for active session
  const fetchHistory = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/chat/sessions/${id}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          outOfScope: msg.out_of_scope,
          citations: (msg.citations || []).map((cit: any) => ({
            chunk_id: cit.chunk_id,
            file_name: cit.file_name,
            page_label: cit.page_label,
            excerpt: cit.excerpt,
            relevance_score: Number(cit.relevance_score || 0),
          })),
        }));
        setMessages(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if there are active sessions to redirect to
  const fetchSessionsAndRedirect = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/chat/sessions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          router.replace(`/${role}/chat?session=${data[0].id}`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch redirect sessions:", err);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      fetchSessionsAndRedirect();
    } else {
      fetchSessionDetails(sessionId);
      fetchHistory(sessionId);
      setScopedDocs([]);
      setScopeOpen(false);
    }
  }, [sessionId]);

  const toggleDoc = (id: string) => {
    setScopedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleNewSession = useCallback(() => {
    router.push(`/${role}/sessions`);
  }, [role, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMsg: Message = { id: "temp-" + Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`http://localhost:8080/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: currentInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const userRes = data.user_message;
        const botRes = data.bot_message;

        const mappedUser: Message = {
          id: userRes.id,
          role: userRes.role,
          content: userRes.content,
          outOfScope: userRes.out_of_scope,
        };

        const mappedBot: Message = {
          id: botRes.id,
          role: botRes.role,
          content: botRes.content,
          outOfScope: botRes.out_of_scope,
          citations: (botRes.citations || []).map((cit: any) => ({
            chunk_id: cit.chunk_id,
            file_name: cit.file_name,
            page_label: cit.page_label,
            excerpt: cit.excerpt,
            relevance_score: Number(cit.relevance_score || 0),
          })),
        };

        setMessages((prev) => {
          const clean = prev.filter((m) => m.id !== userMsg.id);
          return [...clean, mappedUser, mappedBot];
        });
      } else {
        alert("Gửi tin nhắn thất bại.");
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Đã xảy ra lỗi khi gửi.");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sessionId) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center p-6 bg-transparent">
        <div className="text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep shadow-soft">
            <Sparkles className="h-10 w-10 animate-pulse" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Chào mừng đến với StudyMate AI</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Bắt đầu đặt câu hỏi cho RAG AI. Chọn một phiên chat từ danh sách lịch sử hoặc khởi tạo một phiên chat mới theo môn học.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/${role}/sessions`)}
              className="w-full h-11 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors"
            >
              Chọn môn học & bắt đầu chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-transparent">
      {/* Top Header */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Sparkles className="h-5 w-5 text-primary-deep animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-green-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-none">
              {session?.title || "StudyMate AI"}
            </h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Đang kết nối với {availableDocs.length} tài liệu học tập
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/${role}/sessions`)}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all shadow-soft"
          >
            <History className="h-3.5 w-3.5" />
            Lịch sử chat
          </button>
          <button
            onClick={handleNewSession}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all shadow-soft"
          >
            <Plus className="h-3.5 w-3.5" />
            Phiên mới
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-0">
        <div className="mx-auto max-w-3xl space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="py-10 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-primary/30 mb-3" />
              <p className="text-sm text-muted-foreground">Hỏi đáp với AI. Hãy đặt câu hỏi đầu tiên của bạn!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div className="shrink-0 pt-1">
                  {msg.role === "bot" ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border shadow-soft">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={cn(
                    "flex flex-col gap-2 max-w-[80%]",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-white border border-border/60 text-foreground rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-1 space-y-2 w-full">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        Nguồn tham khảo
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cite, i) => (
                          <button
                            key={i}
                            className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 hover:bg-muted/15 transition-all shadow-soft cursor-pointer group text-left"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground group-hover:text-primary-deep line-clamp-1 max-w-[200px]">
                                {cite.file_name || "Tài liệu môn học"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {cite.page_label ? `Trang ${cite.page_label}` : "Đoạn trích dẫn"} · Độ khớp: {(cite.relevance_score * 100).toFixed(1)}%
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bot action buttons */}
                  {msg.role === "bot" && (
                    <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Sao chép">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Thử lại">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-green-100 hover:text-green-600 transition-colors" title="Hữu ích">
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-500 transition-colors" title="Không hữu ích">
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white border border-border/60 px-5 py-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-white/60 backdrop-blur-md border-t border-border/60 px-4 pt-4 pb-6 shadow-soft">
        <div className="mx-auto max-w-3xl">
          {/* Scope selector */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Phạm vi tài liệu:
              </span>
              <button
                onClick={() => setScopeOpen((o) => !o)}
                className="text-[11px] font-medium text-primary-deep hover:underline"
              >
                {scopeOpen ? "Thu gọn" : "Chọn tài liệu"}
              </button>
              {scopedDocs.length > 0 && (
                <button
                  onClick={() => setScopedDocs([])}
                  className="text-[11px] text-muted-foreground hover:text-red-500 flex items-center gap-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Bỏ chọn tất cả
                </button>
              )}
            </div>

            {/* Chips when closed */}
            {!scopeOpen && scopedDocs.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {scopedDocs.map((id) => {
                  const doc = availableDocs.find((d) => d.id === id)!;
                  if (!doc) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-soft border border-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary-deep shadow-soft"
                    >
                      <FileText className="h-3 w-3" />
                      {doc.title}
                      <button onClick={() => toggleDoc(id)} className="ml-0.5 opacity-60 hover:opacity-100">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Expanded doc list */}
            {scopeOpen && (
              <div className="grid grid-cols-2 gap-1.5">
                {availableDocs.map((doc) => {
                  const selected = scopedDocs.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all shadow-soft",
                        selected
                          ? "border-primary/40 bg-primary-soft text-primary-deep"
                          : "border-border/60 bg-white/60 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                      )}
                    >
                      <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", selected ? "bg-primary/25" : "bg-muted")}>
                        <FileText className={cn("h-3.5 w-3.5", selected ? "text-primary-deep" : "text-muted-foreground")} />
                      </div>
                      <span className="line-clamp-1 flex-1">{doc.title}</span>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary-deep" />}
                    </button>
                  );
                })}
              </div>
            )}

            {scopedDocs.length === 0 && !scopeOpen && (
              <p className="text-[11px] text-muted-foreground italic">
                Tất cả tài liệu — <span className="text-primary-deep not-italic cursor-pointer hover:underline" onClick={() => setScopeOpen(true)}>giới hạn phạm vi</span> để AI trả lời nhanh hơn.
              </p>
            )}
          </div>

          {/* Input box */}
          <div className="relative flex items-end overflow-hidden rounded-2xl border border-border/80 bg-white shadow-md focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
            <button className="flex h-14 w-14 items-center justify-center text-muted-foreground shrink-0 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors">
                <Paperclip className="h-4 w-4" />
              </div>
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="max-h-40 min-h-[56px] w-full resize-none py-4 pr-16 text-[15px] text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
              placeholder="Hỏi bất cứ điều gì về tài liệu học tập..."
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            StudyMate AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng từ tài liệu gốc.
          </p>
        </div>
      </div>
    </div>
  );
}
