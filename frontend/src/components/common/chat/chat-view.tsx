"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import {
  IconSparkles,
  IconSend,
  IconFileText,
  IconUser,
  IconPaperclip,
  IconCircleCheck,
  IconHistory,
  IconPlus,
  IconRotate2,
  IconCopy,
  IconThumbUp,
  IconThumbDown,
  IconX,
  IconArrowLeft,
  IconClipboardList,
  IconChevronDown,
  IconMicrophone,
  IconMessage2,
  IconSearch,
  IconBook,
} from "@tabler/icons-react";
import {
  Button,
  TextInput,
  Textarea,
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  ActionIcon,
  Loader,
} from "@mantine/core";
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
          <Button
            variant="subtle"
            color="gray"
            radius="xl"
            size="xs"
            leftSection={
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
            }
          >
            Máy tính
          </Button>
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
      <div className="w-full">
        <Text size="xs" fw={700} c="dimmed" mb="xs" className="tracking-wider uppercase">
          Chọn môn học để thu hẹp phạm vi tìm kiếm
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {mockSubjects.map((sub) => (
            <Paper
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              withBorder
              p="sm"
              radius="md"
              className="cursor-pointer hover:border-blue-500/40 hover:bg-blue-50/10 group transition-all"
            >
              <Group gap="sm" wrap="nowrap">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <IconBook size={16} />
                </div>
                <Text size="sm" fw={600} className="truncate text-gray-800 group-hover:text-blue-600 transition-colors">
                  {sub.name}
                </Text>
              </Group>
            </Paper>
          ))}
        </div>
      </div>
    );
  }

  const subjectDocs = availableDocs[selectedSubjectId] || [];

  return (
    <div className="w-full">
      <Group justify="space-between" align="center" mb="sm">
        <Group gap="xs">
          <Button
            onClick={() => setSelectedSubjectId(null)}
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<IconArrowLeft size={14} />}
            p={0}
          >
            Quay lại
          </Button>
          <Text size="xs" fw={700} c="dimmed">
            •
          </Text>
          <Text size="xs" fw={700} color="blue">
            {mockSubjects.find((s) => s.id === selectedSubjectId)?.name}
          </Text>
        </Group>
        <Badge variant="light" color="gray">
          Đã chọn {subjectDocs.filter((d) => scopedDocs.includes(d.id)).length}/{subjectDocs.length}
        </Badge>
      </Group>

      {subjectDocs.length === 0 ? (
        <Paper withBorder p="md" radius="md" style={{ borderStyle: "dashed" }} bg="zinc-50/50" className="text-center">
          <Text size="sm" c="dimmed">Không có tài liệu nào trong môn học này.</Text>
        </Paper>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {subjectDocs.map((doc) => {
            const selected = scopedDocs.includes(doc.id);
            return (
              <Paper
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                withBorder
                p="sm"
                radius="md"
                className={`cursor-pointer transition-all ${
                  selected
                    ? "border-blue-500 bg-blue-50/10 text-blue-600"
                    : "border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-800 bg-white"
                }`}
              >
                <Group gap="sm" wrap="nowrap">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      selected ? "bg-blue-600 text-white" : "bg-gray-150 text-gray-500"
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
                      {doc.type}
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
    <div className="flex h-full flex-col bg-zinc-50">
      {/* Home View Header (Hidden in thread) */}
      {isHome && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 text-center">
              StudyMate AI
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
                      {msg.citations && (
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
                                  {cite.title}
                                </Text>
                                <Text size="10px" c="dimmed" mt="auto">
                                  {cite.pages}
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
                          {msg.bullets && (
                            <ul className="mt-4 space-y-3">
                              {msg.bullets.map((bullet, i) => (
                                <li key={i} className="flex gap-3 text-[14px] leading-relaxed">
                                  <span className="text-gray-500 shrink-0 mt-0.5 font-bold inline-flex items-center justify-center h-5 w-5 rounded-full bg-zinc-50 border border-gray-150 text-[10px]">
                                    {i + 1}
                                  </span>
                                  <span
                                    className="text-gray-700"
                                    dangerouslySetInnerHTML={{
                                      __html: bullet.replace(
                                        /\*\*(.*?)\*\*/g,
                                        "<strong class='font-semibold text-gray-900'>$1</strong>",
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
                          >
                            Sao chép
                          </Button>
                          <Button
                            variant="subtle"
                            color="gray"
                            size="xs"
                            leftSection={<IconRotate2 size={14} />}
                          >
                            Viết lại
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

                      {/* Related Questions - Only for the latest bot message */}
                      {msg.role === "bot" && idx === messages.length - 1 && (
                        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <Group gap="xs" align="center" className="text-gray-400">
                            <IconPlus size={16} />
                            <Text size="xs" fw={700} className="tracking-wider uppercase">
                              Câu hỏi liên quan
                            </Text>
                          </Group>
                          <Stack gap="xs">
                            {[
                              "Làm thế nào để triển khai Vector Search với pgvector?",
                              "Gemini Embedding Model 2 có ưu điểm gì so với bản cũ?",
                              "Cách tối ưu hóa prompt để RAG hiệu quả hơn?",
                            ].map((q, i) => (
                              <Paper
                                key={i}
                                onClick={() => setInput(q)}
                                withBorder
                                p="sm"
                                radius="md"
                                className="cursor-pointer hover:border-blue-500/40 hover:bg-blue-50/10 group transition-all"
                              >
                                <Group justify="space-between" align="center">
                                  <Text size="sm" className="text-gray-700 group-hover:text-blue-600 transition-colors">
                                    {q}
                                  </Text>
                                  <IconArrowLeft size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors rotate-180" />
                                </Group>
                              </Paper>
                            ))}
                          </Stack>
                        </div>
                      )}
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
            {/* Thread Scope selector context */}
            {scopeOpen && (
              <Paper withBorder p="md" radius="lg" className="mb-4 shadow-xl bg-white">
                <DocumentSelector
                  scopedDocs={scopedDocs}
                  toggleDoc={toggleDoc}
                  selectedSubjectId={selectedSubjectId}
                  setSelectedSubjectId={setSelectedSubjectId}
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
            />
          </div>
        </div>
      )}
    </div>
  );
}
