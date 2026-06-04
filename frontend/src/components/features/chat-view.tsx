import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, FileText, Bot, User, CornerDownRight, ChevronRight, Paperclip, CheckCircle2, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatView() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "bot",
      content: "Hello! I'm StudyMate AI, your dedicated study assistant. I have access to your uploaded course materials. How can I help you today?",
    },
    {
      id: "2",
      role: "user",
      content: "Can you explain the main stages of Cellular Respiration?",
    },
    {
      id: "3",
      role: "bot",
      content: "Based on Chapter 4 of your course materials, cellular respiration occurs in three main stages:",
      bullets: [
        "**Glycolysis:** Occurs in the cytoplasm, breaking down glucose into pyruvate.",
        "**Krebs Cycle (Citric Acid Cycle):** Occurs in the mitochondrial matrix, producing ATP, NADH, and FADH2.",
        "**Electron Transport Chain:** Occurs in the inner mitochondrial membrane, producing the majority of ATP."
      ],
      citations: [
        { id: 1, title: "BIO201_Chapter4_Notes.pdf", pages: "4-6", type: "PDF" },
        { id: 2, title: "Lecture_Slides_Week3.pptx", pages: "Slide 12", type: "Slide" }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: input }]);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-[#f8fafc]">
      {/* Top Header */}
      <div className="shrink-0 border-b border-border/60 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b4870]/10">
            <Sparkles className="h-5 w-5 text-[#0b4870]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">StudyMate AI</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Connected to 14 active documents
            </p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 rounded-lg border border-border/60 bg-white px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors shadow-sm">
          <History className="h-4 w-4" />
          Chat History
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-0">
        <div className="mx-auto max-w-4xl space-y-8">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className="shrink-0 pt-1">
                {msg.role === "bot" ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b4870] text-white shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
              
              <div className={cn("flex flex-col gap-2 max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm",
                  msg.role === "user" 
                    ? "bg-[#0b4870] text-white rounded-tr-sm" 
                    : "bg-white border border-border/60 text-foreground rounded-tl-sm"
                )}>
                  {msg.content}
                  
                  {msg.bullets && (
                    <ul className="mt-4 space-y-3">
                      {msg.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-[#0b4870] shrink-0 mt-0.5">•</span>
                          <span dangerouslySetInnerHTML={{ __html: bullet.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {msg.citations && (
                  <div className="mt-2 space-y-2 w-full">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Sources</span>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cite, i) => (
                        <button key={i} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 hover:bg-blue-100/50 hover:border-blue-300 transition-colors shadow-sm cursor-pointer group text-left">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-100 text-blue-600">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#0b4870] group-hover:text-blue-700 clamp-1">{cite.title}</p>
                            <p className="text-[10px] text-muted-foreground">{cite.pages}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-white p-4 border-t border-border/60 pb-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative flex items-end overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <button className="flex h-14 w-14 items-center justify-center text-muted-foreground hover:text-foreground shrink-0 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer">
                <Paperclip className="h-4 w-4" />
              </div>
            </button>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="max-h-40 min-h-[56px] w-full resize-none py-4 pr-16 text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
              placeholder="Ask anything about your study materials..."
              rows={1}
            />
            <button 
              onClick={handleSend}
              className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b4870] text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1 mt-1.5">Suggestions:</span>
            <button className="text-xs font-medium text-[#0b4870] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Summarize Chapter 4</button>
            <button className="text-xs font-medium text-[#0b4870] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Create flashcards for mitochondria</button>
            <button className="text-xs font-medium text-[#0b4870] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Compare Glycolysis and Krebs Cycle</button>
          </div>
        </div>
      </div>
    </div>
  );
}
