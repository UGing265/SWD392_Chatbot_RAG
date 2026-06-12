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
  ClipboardList,
  ChevronDown,
  Mic,
  MessageSquareText,
  Search,
  Book,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Message,
  getMessages,
  addMessage,
  createSession,
  sessionList,
} from "@/lib/sessions-store";

const mockSubjects = [
  { id: "s1", name: "SWD392 - Software Architecture" },
  { id: "s2", name: "PRJ301 - Java Web" },
  { id: "s3", name: "PRU211 - C# .NET" },
];

const availableDocs: Record<string, { id: string; title: string; type: string }[]> = {
  s1: [
    { id: "1", title: "Cơ bản về Kiến trúc phần mềm", type: "PDF" },
    { id: "2", title: "Thiết kế REST API", type: "DOCX" },
    { id: "3", title: "Microservices Pattern", type: "PDF" },
  ],
  s2: [
    { id: "4", title: "Servlet và JSP", type: "PDF" },
    { id: "5", title: "Spring Boot cơ bản", type: "PDF" },
  ],
  s3: [{ id: "6", title: "C# Căn bản", type: "PDF" }],
};

function RichInputBox({
  input,
  setInput,
  handleSend,
  handleKeyDown,
  textareaRef,
  placeholder,
  scopeOpen,
  setScopeOpen,
}: {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  placeholder: string;
  scopeOpen: boolean;
  setScopeOpen: (val: boolean) => void;
}) {
  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all px-4 py-3 pb-2.5">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-none py-2 text-[16px] leading-relaxed text-foreground placeholder:text-muted-foreground outline-none bg-transparent min-h-[44px] max-h-[200px]"
        placeholder={placeholder}
        rows={1}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScopeOpen(!scopeOpen)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors border",
              scopeOpen
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted/50 text-foreground hover:bg-muted border-border/50",
            )}
          >
            <Book className="h-3.5 w-3.5" />
            <span>{scopeOpen ? "Đóng chọn tài liệu" : "Chọn tài liệu môn học"}</span>
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", scopeOpen && "rotate-180")}
            />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-[13px] font-medium text-foreground hover:bg-muted transition-colors border border-border/50">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <span>Máy tính</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors mr-2 hidden sm:flex">
            <span>Mô hình</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm transition-all hover:bg-slate-700 disabled:opacity-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20"></path>
              <path d="M17 5v14"></path>
              <path d="M22 10v4"></path>
              <path d="M7 5v14"></path>
              <path d="M2 10v4"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentSelector({
  scopedDocs,
  toggleDoc,
  selectedSubjectId,
  setSelectedSubjectId,
}: {
  scopedDocs: string[];
  toggleDoc: (id: string) => void;
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
}) {
  if (!selectedSubjectId) {
    return (
      <div className="animate-fade-in-up w-full">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          Chọn môn học để thu hẹp phạm vi tìm kiếm
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {mockSubjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left text-[13px] font-medium transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="truncate">{sub.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const subjectDocs = availableDocs[selectedSubjectId] || [];

  return (
    <div className="animate-fade-in-up w-full">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <button
            onClick={() => setSelectedSubjectId(null)}
            className="hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
          </button>
          <span>•</span>
          <span className="text-primary truncate">
            {mockSubjects.find((s) => s.id === selectedSubjectId)?.name}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          Đã chọn {subjectDocs.filter((d) => scopedDocs.includes(d.id)).length}/{subjectDocs.length}
        </span>
      </div>

      {subjectDocs.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          Không có tài liệu nào trong môn học này.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {subjectDocs.map((doc) => {
            const selected = scopedDocs.includes(doc.id);
            return (
              <button
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                  selected
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    selected ? "bg-primary text-white" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {selected ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-[13px] font-medium leading-tight">
                    {doc.title}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5">
                    {doc.type}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ChatView() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const role = (params?.role as string) || "student";
  const sessionId = searchParams?.get("session") ?? null;

  const [messages, setMessages] = useState<Message[]>(() =>
    sessionId ? getMessages(sessionId) : getMessages("default"),
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Scoped documents state
  const [scopedDocs, setScopedDocs] = useState<string[]>([]);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // If no session is specified, redirect to the most recent one
  useEffect(() => {
    if (!sessionId && sessionList.length > 0) {
      router.replace(`/${role}/chat?session=${sessionList[0].id}`);
    }
  }, [sessionId, role, router]);

  const isHome = messages.length === 0;

  // Reload messages when session changes
  useEffect(() => {
    setMessages(sessionId ? getMessages(sessionId) : getMessages("default"));
    setScopedDocs([]);
    setScopeOpen(false);
    setSelectedSubjectId(null);
  }, [sessionId]);

  const toggleDoc = (id: string) => {
    setScopedDocs((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setScopeOpen(false); // Close document selector when sending

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content:
          "Dựa trên tài liệu bạn đã chọn, đây là thông tin chi tiết về câu hỏi của bạn. Quy trình này bao gồm các bước quan trọng để đạt được kết quả tối ưu trong bối cảnh học thuật.",
        citations: [
          { id: 1, title: "Kiến trúc RAG cơ bản", pages: "Trang 12-15", type: "PDF" },
          { id: 2, title: "Tối ưu hóa Vector Search", pages: "Trang 45", type: "DOCX" },
          { id: 3, title: "Gemini Embedding Model", pages: "Phụ lục A", type: "PDF" },
        ],
        bullets: [
          "Sử dụng **pgvector** để lưu trữ và truy vấn embedding.",
          "Tích hợp **Gemini LLM** để tổng hợp câu trả lời từ ngữ cảnh.",
          "Trích dẫn nguồn chính xác giúp tăng độ tin cậy của câu trả lời.",
        ],
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
    <div className="flex h-full flex-col bg-zinc-100">
      {/* Home View Header (Hidden in thread) */}
      {isHome && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
          <div className="mb-8">
            <h1
              className="text-[40px] font-medium tracking-tight text-foreground text-center"
              style={{ fontFamily: "Georgia, serif" }}
            >
              StudyMate
            </h1>
          </div>

          <div className="w-full max-w-[800px]">
            <RichInputBox
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
              textareaRef={textareaRef}
              placeholder="Hỏi bất cứ điều gì..."
              scopeOpen={scopeOpen}
              setScopeOpen={setScopeOpen}
            />

            {/* Home Scope List (if open) */}
            {scopeOpen && (
              <div className="mt-4">
                <DocumentSelector
                  scopedDocs={scopedDocs}
                  toggleDoc={toggleDoc}
                  selectedSubjectId={selectedSubjectId}
                  setSelectedSubjectId={setSelectedSubjectId}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thread View (Messages) */}
      {!isHome && (
        <div className="flex-1 overflow-y-auto px-4 pt-10 pb-48">
          <div className="mx-auto max-w-[800px] space-y-10">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full mb-6",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#2e6d2b] text-white px-5 py-3 shadow-sm text-[15px] leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex gap-3 w-full max-w-[95%]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d8282] text-white shadow-sm mt-1">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-6 rounded-2xl rounded-tl-sm border border-border bg-card px-5 py-5 shadow-sm">
                      {/* Sources Section - Card grid */}
                      {msg.citations && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-[14px] font-semibold uppercase tracking-wider">
                              Nguồn tham khảo
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {msg.citations.map((cite, i) => (
                              <div
                                key={i}
                                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 hover:border-foreground/20 transition-all cursor-pointer shadow-sm group/card"
                              >
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground group-hover/card:text-foreground">
                                    <FileText className="h-3 w-3" />
                                  </div>
                                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                                    {idx}.{i + 1}
                                  </span>
                                </div>
                                <p className="text-[12px] font-medium text-foreground line-clamp-2 leading-tight">
                                  {cite.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-auto">
                                  {cite.pages}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bot Message Content */}
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="text-[15px] leading-[1.6] text-foreground font-normal whitespace-pre-wrap">
                            {msg.content}
                          </div>
                          {msg.bullets && (
                            <ul className="mt-4 space-y-3">
                              {msg.bullets.map((bullet, i) => (
                                <li key={i} className="flex gap-3 text-[14px] leading-relaxed">
                                  <span className="text-muted-foreground shrink-0 mt-1 font-bold inline-flex items-center justify-center h-4 w-4 rounded-full bg-secondary text-[10px]">
                                    {i + 1}
                                  </span>
                                  <span
                                    className="text-foreground/90"
                                    dangerouslySetInnerHTML={{
                                      __html: bullet.replace(
                                        /\*\*(.*?)\*\*/g,
                                        "<strong class='font-semibold text-foreground'>$1</strong>",
                                      ),
                                    }}
                                  />
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                        <button className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-all px-2 py-1 rounded-md hover:bg-secondary">
                          <Copy className="h-3.5 w-3.5" />
                          <span>Sao chép</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-all px-2 py-1 rounded-md hover:bg-secondary">
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Viết lại</span>
                        </button>
                        <div className="ml-auto flex items-center gap-1">
                          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all">
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all">
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Related Questions - Only for the latest bot message */}
                      {msg.role === "bot" && idx === messages.length - 1 && (
                        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Plus className="h-4 w-4" />
                            <span className="text-[13px] font-semibold uppercase tracking-wider">
                              Câu hỏi liên quan
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {[
                              "Làm thế nào để triển khai Vector Search với pgvector?",
                              "Gemini Embedding Model 2 có ưu điểm gì so với bản cũ?",
                              "Cách tối ưu hóa prompt để RAG hiệu quả hơn?",
                            ].map((q, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setInput(q);
                                }}
                                className="flex items-center justify-between group/q text-left px-4 py-2.5 rounded-xl border border-border hover:border-[#0d8282]/30 hover:bg-[#0d8282]/5 transition-all w-full"
                              >
                                <span className="text-[13px] text-foreground/80 group-hover/q:text-[#0d8282] transition-colors">
                                  {q}
                                </span>
                                <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover/q:text-[#0d8282] transition-colors rotate-180" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-4 w-24 bg-secondary rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-secondary rounded-full" />
                  <div className="h-4 w-[90%] bg-secondary rounded-full" />
                  <div className="h-4 w-[70%] bg-secondary rounded-full" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>
      )}

      {/* Input Area (Pinned to bottom in thread) */}
      {!isHome && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[240px] bg-gradient-to-t from-zinc-100 via-zinc-100/95 to-transparent px-4 pb-6 pt-10 z-10">
          <div className="mx-auto max-w-[800px]">
            {/* Thread Scope selector context */}
            {scopeOpen && (
              <div className="mb-4 bg-card border border-border rounded-2xl shadow-xl p-4 animate-fade-in-up">
                <DocumentSelector
                  scopedDocs={scopedDocs}
                  toggleDoc={toggleDoc}
                  selectedSubjectId={selectedSubjectId}
                  setSelectedSubjectId={setSelectedSubjectId}
                />
              </div>
            )}

            {/* Use the exact same Rich Input component for the sticky footer */}
            <RichInputBox
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
              textareaRef={textareaRef}
              placeholder="Đặt câu hỏi tiếp theo..."
              scopeOpen={scopeOpen}
              setScopeOpen={setScopeOpen}
            />
          </div>
        </div>
      )}
    </div>
  );
}
