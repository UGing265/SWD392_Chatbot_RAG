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
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Message,
  getMessages,
  addMessage,
  createSession,
} from "@/lib/sessions-store";


const availableDocs = [
  { id: "1", title: "Cơ bản về Mạng Nơ-ron", type: "PDF" },
  { id: "2", title: "Hô hấp tế bào và Quang hợp", type: "DOCX" },
  { id: "3", title: "Tối ưu hóa Gradient Descent", type: "PDF" },
  { id: "4", title: "Nhập môn Di truyền học", type: "PDF" },
];

export function ChatView() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const role = (params?.role as string) || "student";
  const sessionId = searchParams?.get("session") ?? null;

  const [messages, setMessages] = useState<Message[]>(() =>
    sessionId ? getMessages(sessionId) : getMessages("default")
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [scopedDocs, setScopedDocs] = useState<string[]>([]);
  const [scopeOpen, setScopeOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reload messages when session changes
  useEffect(() => {
    setMessages(sessionId ? getMessages(sessionId) : getMessages("default"));
    setScopedDocs([]);
    setScopeOpen(false);
  }, [sessionId]);

  const toggleDoc = (id: string) => {
    setScopedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleNewSession = useCallback(() => {
    const s = createSession();
    router.push(`/${role}/chat?session=${s.id}`);
  }, [role, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "Tôi đã hiểu câu hỏi của bạn. Đây là câu trả lời dựa trên tài liệu môn học...",
      };
      if (sessionId) addMessage(sessionId, botMsg);
      setMessages((prev) => [...prev, botMsg]);
    }, 1500);
  };



  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Top Header — logo only, no background row */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Sparkles className="h-5 w-5 text-[#0b4870]" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-green-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-none">StudyMate AI</h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Đang kết nối với {availableDocs.length} tài liệu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/${role}/sessions`)}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white transition-colors shadow-sm"
          >
            <History className="h-3.5 w-3.5" />
            Lịch sử chat
          </button>
          <button
            onClick={handleNewSession}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Phiên mới
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-0">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {/* Avatar */}
              <div className="shrink-0 pt-1">
                {msg.role === "bot" ? (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b4870] to-[#3e8ced] text-white shadow-md">
                    <Sparkles className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-md">
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
                      ? "bg-gradient-to-br from-[#0b4870] to-[#1a6aa0] text-white rounded-tr-sm"
                      : "bg-white border border-border/60 text-foreground rounded-tl-sm"
                  )}
                >
                  {msg.content}

                  {msg.bullets && (
                    <ul className="mt-4 space-y-2.5">
                      {msg.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="text-[#3e8ced] shrink-0 mt-0.5 font-bold">•</span>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: bullet.replace(
                                /\*\*(.*?)\*\*/g,
                                "<strong>$1</strong>"
                              ),
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Citations */}
                {msg.citations && (
                  <div className="mt-1 space-y-2 w-full">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Nguồn tham khảo
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cite, i) => (
                        <button
                          key={i}
                          className="flex items-center gap-2 rounded-xl border border-blue-200/70 bg-blue-50/60 px-3 py-2 hover:bg-blue-100/60 hover:border-blue-300 transition-all shadow-sm cursor-pointer group text-left"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#0b4870] group-hover:text-blue-700 line-clamp-1">
                              {cite.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{cite.pages}</p>
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
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b4870] to-[#3e8ced] text-white shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white border border-border/60 px-5 py-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#3e8ced] animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 rounded-full bg-[#3e8ced] animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-[#3e8ced] animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-white/80 backdrop-blur-md border-t border-border/60 px-4 pt-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
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
                className="text-[11px] font-medium text-[#3e8ced] hover:underline"
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
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full bg-[#0b4870]/10 border border-[#0b4870]/20 px-2.5 py-1 text-[11px] font-medium text-[#0b4870]"
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
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all",
                        selected
                          ? "border-[#3e8ced]/60 bg-[#3e8ced]/10 text-[#0b4870]"
                          : "border-border/60 bg-white/60 text-muted-foreground hover:border-[#3e8ced]/30 hover:text-foreground"
                      )}
                    >
                      <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", selected ? "bg-[#3e8ced]/20" : "bg-muted")}>
                        <FileText className={cn("h-3.5 w-3.5", selected ? "text-[#3e8ced]" : "text-muted-foreground")} />
                      </div>
                      <span className="line-clamp-1 flex-1">{doc.title}</span>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#3e8ced]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {scopedDocs.length === 0 && !scopeOpen && (
              <p className="text-[11px] text-muted-foreground italic">
                Tất cả tài liệu — <span className="text-[#3e8ced] not-italic cursor-pointer hover:underline" onClick={() => setScopeOpen(true)}>giới hạn phạm vi</span> để AI trả lời nhanh hơn.
              </p>
            )}
          </div>

          {/* Input box */}
          <div className="relative flex items-end overflow-hidden rounded-2xl border border-border/80 bg-white shadow-md focus-within:border-[#3e8ced]/60 focus-within:ring-4 focus-within:ring-[#3e8ced]/10 transition-all">
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
              className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b4870] to-[#3e8ced] text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
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
