"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import {
  IconSparkles,
  IconSend,
  IconFileText,
  IconCircleCheck,
  IconPlus,
  IconRotate2,
  IconCopy,
  IconThumbUp,
  IconThumbDown,
  IconChevronDown,
  IconArrowLeft,
  IconBook,
} from "@tabler/icons-react";
import {
  Button,
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  ActionIcon,
  Loader,
  Textarea,
} from "@mantine/core";
import { chatApi, type ChatMessage, type ChatSession } from "@/api/chat";
import { curriculumApi } from "@/api/curriculum";
import { ragApi } from "@/api/client";

function RichInputBox({
  input,
  setInput,
  handleSend,
  handleKeyDown,
  textareaRef,
  placeholder,
  scopeOpen,
  setScopeOpen,
  hasDocuments,
}: {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  placeholder: string;
  scopeOpen: boolean;
  setScopeOpen: (val: boolean) => void;
  hasDocuments: boolean;
}) {
  return (
    <Paper
      withBorder
      p="md"
      radius="lg"
      className="shadow-sm hover:shadow-md transition-shadow bg-white"
    >
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autosize
        minRows={1}
        maxRows={6}
        variant="unstyled"
        styles={{
          input: {
            fontSize: "16px",
            lineHeight: "1.6",
            padding: 0,
            color: "var(--mantine-color-gray-9)",
          },
        }}
      />
      <Group justify="space-between" align="center" mt="md" pt="xs" style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}>
        <Group gap="xs">
          {hasDocuments && (
            <Button
              onClick={() => setScopeOpen(!scopeOpen)}
              variant={scopeOpen ? "light" : "subtle"}
              color={scopeOpen ? "blue" : "gray"}
              radius="xl"
              size="xs"
              leftSection={<IconBook size={14} />}
              rightSection={<IconChevronDown size={12} style={{ transform: scopeOpen ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }} />}
            >
              {scopeOpen ? "Đóng chọn tài liệu" : "Chọn tài liệu môn học"}
            </Button>
          )}
        </Group>
        <Group gap="sm">
          <ActionIcon
            onClick={handleSend}
            disabled={!input.trim()}
            color="dark"
            radius="xl"
            size="md"
          >
            <IconSend size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}

function DocumentSelector({
  documents,
  scopedDocs,
  toggleDoc,
}: {
  documents: any[];
  scopedDocs: string[];
  toggleDoc: (id: string) => void;
}) {
  return (
    <div className="w-full">
      <Group justify="space-between" align="center" mb="sm">
        <Text size="xs" fw={700} c="dimmed" className="tracking-wider uppercase">
          Tài liệu môn học (RAG Scope)
        </Text>
        <Badge variant="light" color="gray">
          Đã chọn {documents.filter((d) => scopedDocs.includes(d.id)).length}/{documents.length}
        </Badge>
      </Group>

      {documents.length === 0 ? (
        <Paper withBorder p="md" radius="lg" style={{ borderStyle: "dashed" }} bg="zinc-50/50" className="text-center">
          <Text size="sm" c="dimmed">Không có tài liệu nào thuộc môn học này.</Text>
        </Paper>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {documents.map((doc) => {
            const selected = scopedDocs.includes(doc.id);
            return (
              <Paper
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                withBorder
                p="sm"
                radius="lg"
                className={`cursor-pointer transition-all ${
                  selected
                    ? "border-blue-500 bg-blue-50/10 text-blue-600"
                    : "border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-800 bg-white"
                }`}
              >
                <Group gap="sm" wrap="nowrap">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selected ? (
                      <IconCircleCheck size={16} />
                    ) : (
                      <IconFileText size={16} />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <Text size="xs" fw={700} className="truncate leading-tight text-gray-900">
                      {doc.title}
                    </Text>
                    <Text size="10px" className="tracking-wider uppercase opacity-70 mt-0.5">
                      {doc.document_type_name || "TÀI LIỆU"}
                    </Text>
                  </div>
                </Group>
              </Paper>
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

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Scoped documents state
  const [documents, setDocuments] = useState<any[]>([]);
  const [scopedDocs, setScopedDocs] = useState<string[]>([]);
  const [scopeOpen, setScopeOpen] = useState(false);

  // Landing page subjects state
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // If no session is specified, redirect to the most recent one
  useEffect(() => {
    if (!sessionId) {
      chatApi.listSessions()
        .then((list) => {
          if (list.length > 0) {
            router.replace(`/${role}/chat?session=${list[0].id}`);
          } else {
            // Load subjects for landing page
            setLoadingSubjects(true);
            curriculumApi.getLookups()
              .then((data) => {
                setSubjects(data.subjects || []);
              })
              .catch((err) => console.error("Error loading subjects:", err))
              .finally(() => setLoadingSubjects(false));
          }
        })
        .catch((err) => console.error("Error checking sessions:", err));
    }
  }, [sessionId, role, router]);

  // Load session, history, and documents when sessionId changes
  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      Promise.all([
        chatApi.getSession(sessionId),
        chatApi.getHistory(sessionId),
      ])
        .then(([sessionData, historyData]) => {
          setSession(sessionData);
          setMessages(historyData);

          // Fetch documents for the subject
          ragApi.get(`/documents?subjectId=${sessionData.course_id}&pageSize=100`)
            .then((res) => {
              setDocuments(res.data.documents || []);
            })
            .catch((err) => console.error("Error loading course documents:", err));
        })
        .catch((err) => {
          console.error("Error loading session:", err);
          router.replace(`/${role}/chat`);
        })
        .finally(() => setLoading(false));
    } else {
      setSession(null);
      setMessages([]);
      setDocuments([]);
    }
    setScopedDocs([]);
    setScopeOpen(false);
  }, [sessionId, role, router]);

  const toggleDoc = (id: string) => {
    setScopedDocs((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;
    
    // Add user message optimistically
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      out_of_scope: false,
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setScopeOpen(false); // Close document selector when sending

    try {
      const response = await chatApi.sendMessage(sessionId, input);
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== userMsg.id);
        return [...withoutOptimistic, response.user_message, response.bot_message];
      });
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.");
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-50">
        <Loader size="md" color="blue" />
      </div>
    );
  }

  // Case 1: No active session (Landing Page)
  if (!sessionId) {
    return (
      <div className="flex h-full flex-col bg-zinc-50 overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              StudyMate AI
            </h1>
            <Text size="sm" c="dimmed" className="mt-2 max-w-md mx-auto">
              Chào mừng bạn đến với StudyMate AI! Hãy chọn một môn học dưới đây để bắt đầu hỏi đáp và ôn luyện tài liệu học tập.
            </Text>
          </div>

          <div className="w-full max-w-[800px]">
            {loadingSubjects ? (
              <div className="flex justify-center py-12">
                <Loader size="md" color="blue" />
              </div>
            ) : subjects.length === 0 ? (
              <Paper withBorder p="xl" radius="lg" className="text-center bg-white shadow-sm">
                <Text size="sm" c="dimmed">
                  Chưa có môn học nào được tạo trên hệ thống.
                </Text>
              </Paper>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map((sub) => (
                  <Paper
                    key={sub.id}
                    onClick={async () => {
                      try {
                        const newSession = await chatApi.createSession(sub.id, `Trò chuyện môn ${sub.code}`);
                        router.push(`/${role}/chat?session=${newSession.id}`);
                      } catch (err) {
                        console.error("Error creating session:", err);
                      }
                    }}
                    withBorder
                    p="md"
                    radius="lg"
                    className="cursor-pointer hover:border-blue-500/40 hover:bg-blue-50/10 group transition-all shadow-sm"
                  >
                    <Group gap="sm" wrap="nowrap">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <IconBook size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text size="sm" fw={700} className="truncate text-gray-800 group-hover:text-blue-600 transition-colors">
                          {sub.code}
                        </Text>
                        <Text size="xs" c="dimmed" className="truncate">
                          {sub.name}
                        </Text>
                      </div>
                    </Group>
                  </Paper>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isHome = messages.length === 0;

  return (
    <div className="flex h-full flex-col bg-zinc-50">
      {/* Case 2: Active Session but Empty (Initial Chat State) */}
      {isHome && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 text-center">
              {session?.title || "StudyMate AI"}
            </h1>
            <Text size="sm" c="dimmed" className="mt-1">
              Đặt câu hỏi để tìm kiếm thông tin trong giáo trình môn học.
            </Text>
          </div>

          <div className="w-full max-w-[800px]">
            <RichInputBox
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
              textareaRef={textareaRef}
              placeholder="Hỏi bất cứ điều gì về tài liệu môn học..."
              scopeOpen={scopeOpen}
              setScopeOpen={setScopeOpen}
              hasDocuments={documents.length > 0}
            />

            {scopeOpen && (
              <div className="mt-4">
                <DocumentSelector
                  documents={documents}
                  scopedDocs={scopedDocs}
                  toggleDoc={toggleDoc}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case 3: Thread has messages */}
      {!isHome && (
        <div className="flex-1 overflow-y-auto px-4 pt-10 pb-48">
          <div className="mx-auto max-w-[800px] space-y-10">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex w-full mb-6 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 text-white px-5 py-3 shadow-sm text-sm leading-relaxed fw-500">
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex gap-3 w-full max-w-[95%]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm mt-1">
                      <IconSparkles size={16} />
                    </div>
                    <Paper
                      withBorder
                      p="lg"
                      radius="lg"
                      className="flex-1 space-y-6 rounded-tl-sm bg-white shadow-sm"
                    >
                      {/* Sources Section - Card grid */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="space-y-3">
                          <Group gap="xs" align="center" className="text-gray-400">
                            <IconBook size={16} />
                            <Text size="xs" fw={700} className="tracking-wider uppercase">
                              Nguồn tham khảo
                            </Text>
                          </Group>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {msg.citations.map((cite, i) => (
                              <Paper
                                key={i}
                                withBorder
                                p="xs"
                                radius="md"
                                className="flex flex-col gap-2 hover:border-blue-500/30 transition-all cursor-pointer shadow-sm bg-white"
                                title={cite.excerpt}
                              >
                                <Group gap="xs" wrap="nowrap">
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-50 text-gray-500">
                                    <IconFileText size={12} />
                                  </div>
                                  <Text size="xs" fw={700} c="dimmed">
                                    {idx}.{i + 1}
                                  </Text>
                                </Group>
                                <Text size="xs" fw={600} className="line-clamp-2 leading-tight text-gray-900">
                                  {cite.file_name}
                                </Text>
                                <Text size="10px" c="dimmed" mt="auto">
                                  {cite.page_label ? `Trang ${cite.page_label}` : "Tài liệu"}
                                </Text>
                              </Paper>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bot Message Content */}
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="text-[15px] leading-[1.6] text-gray-900 font-normal whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <Group
                        justify="space-between"
                        align="center"
                        pt="md"
                        style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}
                      >
                        <Group gap="xs">
                          <Button
                            variant="subtle"
                            color="gray"
                            size="xs"
                            leftSection={<IconCopy size={14} />}
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content);
                            }}
                          >
                            Sao chép
                          </Button>
                        </Group>
                        <Group gap={4}>
                          <ActionIcon variant="subtle" color="gray">
                            <IconThumbUp size={16} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="gray">
                            <IconThumbDown size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Paper>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <Stack gap="xs" className="animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded-full" />
                <Stack gap="xs">
                  <div className="h-4 w-full bg-gray-200 rounded-full" />
                  <div className="h-4 w-[90%] bg-gray-200 rounded-full" />
                  <div className="h-4 w-[70%] bg-gray-200 rounded-full" />
                </Stack>
              </Stack>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>
      )}

      {/* Input Area (Pinned to bottom in thread) */}
      {!isHome && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[240px] bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent px-4 pb-6 pt-10 z-10">
          <div className="mx-auto max-w-[800px]">
            {scopeOpen && (
              <Paper withBorder p="md" radius="lg" className="mb-4 shadow-xl bg-white animate-in fade-in slide-in-from-bottom-2">
                <DocumentSelector
                  documents={documents}
                  scopedDocs={scopedDocs}
                  toggleDoc={toggleDoc}
                />
              </Paper>
            )}

            <RichInputBox
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
              textareaRef={textareaRef}
              placeholder="Đặt câu hỏi tiếp theo..."
              scopeOpen={scopeOpen}
              setScopeOpen={setScopeOpen}
              hasDocuments={documents.length > 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
