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
              className="flex items-center justify-center p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
           >
              <Plus className="h-5 w-5 shrink-0" />
           </button>
           <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-[13px] font-medium text-foreground hover:bg-muted transition-colors border border-border/50">
              <Search className="h-3.5 w-3.5" />
              <span>Tìm kiếm</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
           </button>
           <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-[13px] font-medium text-foreground hover:bg-muted transition-colors border border-border/50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <button className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted">
            <Mic className="h-4 w-4" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm transition-all hover:bg-slate-700 disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

  const isHome = messages.length === 0;

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
        content: "Dựa trên tài liệu bạn đã chọn, đây là thông tin chi tiết về câu hỏi của bạn. Quy trình này bao gồm các bước quan trọng để đạt được kết quả tối ưu trong bối cảnh học thuật.",
        citations: [
          { id: 1, title: "Kiến trúc RAG cơ bản", pages: "Trang 12-15", type: "PDF" },
          { id: 2, title: "Tối ưu hóa Vector Search", pages: "Trang 45", type: "DOCX" },
          { id: 3, title: "Gemini Embedding Model", pages: "Phụ lục A", type: "PDF" },
        ],
        bullets: [
          "Sử dụng **pgvector** để lưu trữ và truy vấn embedding.",
          "Tích hợp **Gemini LLM** để tổng hợp câu trả lời từ ngữ cảnh.",
          "Trích dẫn nguồn chính xác giúp tăng độ tin cậy của câu trả lời."
        ]
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
    <div className="flex h-screen flex-col bg-background">
      {/* Home View Header (Hidden in thread) */}
      {isHome && (
         <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
            <div className="mb-8">
              <h1 className="text-[40px] font-medium tracking-tight text-foreground text-center" style={{ fontFamily: 'Georgia, serif' }}>
                StudyMate
              </h1>
            </div>
            
            <div className="w-full max-w-[720px]">
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
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fade-in-up">
                     {availableDocs.map((doc) => {
                        const selected = scopedDocs.includes(doc.id);
                        return (
                          <button
                            key={doc.id}
                            onClick={() => toggleDoc(doc.id)}
                            className={cn(
                              "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-[12px] font-medium transition-all",
                              selected
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                            )}
                          >
                            <FileText className="h-3 w-3 shrink-0" />
                            <span className="truncate">{doc.title}</span>
                          </button>
                        );
                     })}
                  </div>
               )}
            </div>
         </div>
      )}

      {/* Thread View (Messages) */}
      {!isHome && (
        <div className="flex-1 overflow-y-auto px-4 pt-10 pb-40">
          <div className="mx-auto max-w-[800px] space-y-10">
            {messages.map((msg, idx) => (
              <div key={msg.id} className="group">
                {/* User Message - Header style */}
                {msg.role === "user" ? (
                   <h2 className="text-[24px] font-medium tracking-tight text-foreground mb-4">
                      {msg.content}
                   </h2>
                ) : (
                   <div className="space-y-6">
                      {/* Sources Section - Card grid */}
                      {msg.citations && (
                        <div className="space-y-3">
                           <div className="flex items-center gap-2 text-muted-foreground">
                              <BookOpen className="h-4 w-4" />
                              <span className="text-[14px] font-semibold uppercase tracking-wider">Nguồn tham khảo</span>
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
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase">{idx}.{i+1}</span>
                                  </div>
                                  <p className="text-[12px] font-medium text-foreground line-clamp-2 leading-tight">
                                    {cite.title}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-auto">{cite.pages}</p>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}

                      {/* Bot Message Content */}
                      <div className="flex gap-4">
                         <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                               <Sparkles className="h-4 w-4 text-primary" />
                               <span className="text-[14px] font-semibold uppercase tracking-wider">Câu trả lời</span>
                            </div>
                            <div className="text-[16px] leading-[1.6] text-foreground font-light whitespace-pre-wrap">
                               {msg.content}
                            </div>
                            {msg.bullets && (
                              <ul className="mt-4 space-y-3">
                                {msg.bullets.map((bullet, i) => (
                                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                                    <span className="text-muted-foreground shrink-0 mt-1 font-bold inline-flex items-center justify-center h-4 w-4 rounded-full bg-secondary text-[10px]">{i+1}</span>
                                    <span
                                      className="text-foreground/90"
                                      dangerouslySetInnerHTML={{
                                        __html: bullet.replace(
                                          /\*\*(.*?)\*\*/g,
                                          "<strong class='font-semibold text-foreground'>$1</strong>"
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
                        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Plus className="h-4 w-4" />
                            <span className="text-[14px] font-semibold uppercase tracking-wider">Câu hỏi liên quan</span>
                          </div>
                          <div className="flex flex-col gap-2">
                             {[
                                "Làm thế nào để triển khai Vector Search với pgvector?",
                                "Gemini Embedding Model 2 có ưu điểm gì so với bản cũ?",
                                "Cách tối ưu hóa prompt để RAG hiệu quả hơn?"
                             ].map((q, i) => (
                               <button 
                                  key={i}
                                  onClick={() => { setInput(q); }}
                                  className="flex items-center justify-between group/q text-left px-4 py-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all w-full"
                               >
                                  <span className="text-[14px] text-foreground/80 group-hover/q:text-primary transition-colors">{q}</span>
                                  <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover/q:text-primary transition-colors rotate-180" />
                               </button>
                             ))}
                          </div>
                        </div>
                      )}
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
        <div className="fixed bottom-0 left-0 right-0 md:left-[240px] bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-6 pt-10 z-10">
          <div className="mx-auto max-w-[800px]">
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
            
            {/* Thread Scope selector context */}
            {scopeOpen && (
               <div className="absolute bottom-[100%] left-4 right-4 mb-3 bg-card border border-border rounded-xl shadow-xl p-3 animate-fade-in-up max-h-[200px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                     {availableDocs.map((doc) => {
                        const selected = scopedDocs.includes(doc.id);
                        return (
                          <button
                            key={doc.id}
                            onClick={() => toggleDoc(doc.id)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-medium transition-all",
                              selected
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                            )}
                          >
                            <FileText className="h-3 w-3 shrink-0" />
                            <span className="truncate">{doc.title}</span>
                          </button>
                        );
                     })}
                  </div>
               </div>
            )}
            
            <div className="flex justify-center mt-3 group">
               <button 
                  onClick={handleNewSession}
                  className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground font-medium transition-all px-3 py-1.5 rounded-full hover:bg-secondary/50"
               >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Phiên mới</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-all border border-border bg-muted px-1.5 rounded ml-1 text-[10px]">Ctrl I</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

