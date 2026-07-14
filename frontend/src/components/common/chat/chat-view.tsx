"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import {
  IconSparkles,
  IconSend,
  IconFileText,
  IconPlus,
  IconCopy,
  IconThumbUp,
  IconThumbDown,
  IconBook,
  IconMessage,
  IconTrash,
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
  Modal,
  Select,
  TextInput,
  UnstyledButton,
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
  setSearchModalOpen,
  role = "student",
  isNewChat = true,
}: {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  placeholder: string;
  setSearchModalOpen: (val: boolean) => void;
  role?: string;
  isNewChat?: boolean;
}) {
  const isLecturer = role === "lecturer";
  return (
    <Paper
      withBorder
      p="md"
      radius="lg"
      className="shadow-sm hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-center gap-3">
        {isNewChat ? (
          <ActionIcon
            onClick={() => setSearchModalOpen(true)}
            title="Thêm tài liệu"
            variant="light"
            color="dark"
            radius="xl"
            size="lg"
            className="shrink-0 transition-all"
          >
            <IconPlus size={20} />
          </ActionIcon>
        ) : (
          <ActionIcon
            disabled
            variant="light"
            color="gray"
            radius="xl"
            size="lg"
            className="shrink-0 cursor-not-allowed"
            title="Tài liệu của phiên này đã được cố định"
          >
            <IconBook size={20} />
          </ActionIcon>
        )}

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
          className="flex-grow"
          styles={{
            input: {
              fontSize: "15px",
              lineHeight: "1.5",
              padding: 0,
              color: "var(--mantine-color-gray-9)",
            },
          }}
        />

        <ActionIcon
          onClick={handleSend}
          disabled={!input.trim()}
          color="dark"
          radius="xl"
          size="lg"
          className="shrink-0"
        >
          <IconSend size={18} />
        </ActionIcon>
      </div>
    </Paper>
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
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const isCreatingSessionRef = useRef(false);

  // Sidebar Sessions list
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const fetchSessions = () => {
    chatApi.listSessions()
      .then((data) => {
        setSessions(data);
      })
      .catch((err) => console.error("Error fetching sessions in ChatView:", err));
  };

  const handleDeleteSession = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phiên hội thoại này không?")) {
      try {
        await chatApi.deleteSession(id);
        fetchSessions();
        if (sessionId === id) {
          router.replace(`/${role}/chat`);
        }
      } catch (err) {
        console.error("Error deleting session:", err);
      }
    }
  };

  // Search & Attach Documents State
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Lookups data for filters
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [docTypes, setDocTypes] = useState<{ id: string; name: string }[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load subjects, doc types, and all available approved documents on mount
  useEffect(() => {
    setLoadingLookups(true);
    Promise.all([
      curriculumApi.getLookups(),
      ragApi.get("/documents?pageSize=100")
    ])
      .then(([lookupData, docData]) => {
        setSubjects(lookupData.subjects || []);
        setDocTypes(lookupData.documentTypes || []);
        
        const docs = docData.data.documents || [];
        setAllDocs(docs);
        fetchSessions();
      })
      .catch((err) => console.error("Error loading chat metadata:", err))
      .finally(() => setLoadingLookups(false));
  }, []);

  // Load session & history when sessionId changes
  useEffect(() => {
    if (sessionId) {
      if (isCreatingSessionRef.current) {
        isCreatingSessionRef.current = false;
        return;
      }
      setLoading(true);
      Promise.all([
        chatApi.getSession(sessionId),
        chatApi.getHistory(sessionId),
      ])
        .then(([sessionData, historyData]) => {
          setSession(sessionData);
          setMessages(historyData);
        })
        .catch((err) => {
          console.error("Error loading session:", err);
          router.replace(`/${role}/chat`);
        })
        .finally(() => setLoading(false));
    } else {
      setSession(null);
      setMessages([]);
      setSelectedDocs([]);
    }
  }, [sessionId, role, router]);

  // Set selectedDocs to match active session documents when they load
  useEffect(() => {
    if (session && allDocs.length > 0) {
      const sessionDocIds = session.document_ids || [];
      const attached = allDocs.filter(d => sessionDocIds.includes(d.id));
      setSelectedDocs(attached);
    }
  }, [session, allDocs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const toggleAttach = (doc: any) => {
    setSelectedDocs((prev) => {
      const exists = prev.some((d) => d.id === doc.id);
      if (exists) {
        return prev.filter((d) => d.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let activeSessionId = sessionId;

    // Check if we need to create a new session
    if (!activeSessionId) {
      if (selectedDocs.length === 0) {
        alert("Vui lòng chọn ít nhất một tài liệu (bằng nút + bên trái) để bắt đầu trò chuyện.");
        return;
      }

      setLoading(true);
      try {
        const firstDoc = selectedDocs[0];
        const subjectId = firstDoc.subject_id;
        const docIds = selectedDocs.map((d) => d.id);
        const title = input.length > 30 ? input.substring(0, 30) + "..." : input;
        
        isCreatingSessionRef.current = true;
        
        // Create the session with attached document IDs
        const newSession = await chatApi.createSession(subjectId, title, docIds);
        activeSessionId = newSession.id;
        
        // Push session to router history so that sidebar state matches
        router.replace(`/${role}/chat?session=${activeSessionId}`);
        setSession(newSession);
        fetchSessions();
      } catch (err) {
        console.error("Error creating session:", err);
        alert("Không thể khởi tạo phiên chat. Vui lòng thử lại.");
        isCreatingSessionRef.current = false;
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    // Add user message optimistically
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      out_of_scope: false,
      created_at: new Date().toISOString(),
    };

    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      role: "bot",
      content: "",
      out_of_scope: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);
    setInput("");
    setIsTyping(true);
    setStreamingMessageId(botMsgId);

    try {
      await chatApi.streamMessage(
        activeSessionId,
        userMsg.content,
        (token) => {
          setIsTyping(false);
          setStreamingMessageId(botMsgId);
          setMessages((prev) => {
            const updated = [...prev];
            const botIdx = updated.findIndex((m) => m.id === botMsgId);
            if (botIdx !== -1) {
              updated[botIdx] = {
                ...updated[botIdx],
                content: updated[botIdx].content + token,
              };
            }
            return updated;
          });
        },
        (err) => {
          console.error("Stream error:", err);
          setIsTyping(false);
          setStreamingMessageId(null);
          alert("Đã xảy ra lỗi khi nhận dữ liệu từ server.");
        },
        () => {
          setIsTyping(false);
          setStreamingMessageId(null);
          // Stream completed, fetch history to get citations
          chatApi.getHistory(activeSessionId!).then((historyData) => {
            setMessages(historyData);
            fetchSessions();
          }).catch((err) => console.error("Error refreshing history:", err));
        }
      );
    } catch (err) {
      console.error("Error initiating stream:", err);
      setIsTyping(false);
      setStreamingMessageId(null);
      alert("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
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
        <Loader size="md" color="dark" />
      </div>
    );
  }

  // Filter documents in modal
  const filteredDocs = allDocs.filter((doc) => {
    const matchesQuery = (doc.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !filterSubject || doc.subject_id === filterSubject;
    const matchesType = !filterType || doc.document_type_id === filterType;
    return matchesQuery && matchesSubject && matchesType;
  });

  const isHome = messages.length === 0;

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-50">
      {/* ── SESSIONS SIDEBAR ── */}
      <aside className="w-[260px] shrink-0 border-r border-zinc-200/80 bg-white h-full flex flex-col">
        {/* Gradient accent line */}
        <div className="h-[2px] shrink-0" style={{
          background: "linear-gradient(90deg, #27272a 0%, #a1a1aa 100%)"
        }} />

        {/* Sidebar Header */}
        <div className="px-4 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <Text fw={700} size="xs" c="dimmed" className="tracking-wider uppercase">
            Lịch Sử Phiên
          </Text>
          <Button
            onClick={() => router.push(`/${role}/chat`)}
            variant="light"
            color="dark"
            size="xs"
            radius="xl"
            leftSection={<IconPlus size={14} />}
            className="!h-7 !px-3 !text-[11px] !font-bold"
          >
            Phiên Mới
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-grow overflow-y-auto p-2.5 space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 mb-3">
                <IconMessage size={18} className="text-zinc-400" />
              </div>
              <Text size="xs" c="dimmed" fw={500}>
                Chưa Có Phiên Chat
              </Text>
              <Text size="xs" c="dimmed" className="mt-1">
                Bấm "Phiên Mới" để bắt đầu
              </Text>
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = sessionId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => router.push(`/${role}/chat?session=${s.id}`)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 text-[13px] ${
                    isActive
                      ? `bg-zinc-900 text-white font-semibold shadow-sm`
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
                  }`}
                >
                  <IconMessage size={15} className={isActive
                    ? "text-zinc-300"
                    : "text-zinc-400"
                  } />
                  <span className="truncate flex-1 pr-5">{s.title}</span>
                  
                  {/* Delete button shown on hover */}
                  <UnstyledButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(s.id);
                    }}
                    className={`absolute right-2 opacity-0 group-hover:opacity-100 transition-all p-1 flex items-center justify-center rounded ${
                      isActive
                        ? "text-zinc-400 hover:text-red-300"
                        : "text-zinc-400 hover:text-red-500"
                    }`}
                  >
                    <IconTrash size={13} />
                  </UnstyledButton>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ── MAIN CHAT WINDOW ── */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-zinc-50 relative overflow-hidden">
        {/* Case 1: No active session (Landing Page / New Chat) */}
        {isHome && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
            {/* Compact Hero */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #27272a 0%, #52525b 100%)",
                }}>
                <IconSparkles size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                StudyMate AI
              </h1>
              <Text size="xs" c="dimmed" className="mt-1.5 max-w-sm mx-auto leading-relaxed">
                Gắn tài liệu bằng nút <strong>(+)</strong> rồi đặt câu hỏi để bắt đầu.
              </Text>
            </div>

            {/* Composer */}
            <div className="w-full max-w-[640px]">
              <RichInputBox
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
                textareaRef={textareaRef}
                placeholder="Hỏi điều gì đó về tài liệu môn học..."
                setSearchModalOpen={setSearchModalOpen}
                role={role}
              />

              {/* Attached documents list below composer */}
              {selectedDocs.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {selectedDocs.map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 rounded-full text-[11px] font-semibold text-zinc-700 shadow-sm transition-all hover:border-zinc-300"
                    >
                      <IconFileText size={11} className="text-zinc-900" />
                      <span className="max-w-[120px] truncate">{d.title}</span>
                      <UnstyledButton
                        onClick={() => toggleAttach(d)}
                        className="hover:text-red-500 font-bold ml-0.5 flex items-center justify-center rounded-full w-3 h-3 text-[10px] transition-colors"
                      >
                        ✕
                      </UnstyledButton>
                    </span>
                  ))}
                  <UnstyledButton
                    onClick={() => setSelectedDocs([])}
                    className="text-[11px] text-red-500 hover:underline font-semibold self-center ml-1.5"
                  >
                    Xóa Tất Cả
                  </UnstyledButton>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Case 2: Thread has messages */}
        {!isHome && (
          <div className="flex-1 overflow-y-auto px-4 pt-10 pb-44">
            <div className="mx-auto max-w-[800px] space-y-10">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`flex w-full mb-6 transition-all duration-350 ease-out animate-in fade-in slide-in-from-bottom-4 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "user" ? (
                    <div className={`max-w-[80%] rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm text-sm leading-relaxed fw-500 bg-zinc-900 text-white`}>
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex gap-3 w-full max-w-[95%]">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm mt-1 bg-zinc-900`}>
                        <IconSparkles size={16} />
                      </div>
                      <Paper
                        withBorder
                        p="lg"
                        radius="lg"
                        className="flex-1 space-y-6 rounded-tl-sm bg-white shadow-sm"
                      >
                        {/* Bot Message Content */}
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="max-w-none text-[14px] leading-[1.7] text-gray-900 [&_p]:my-1.5 [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-0.5 [&_strong]:font-semibold [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_code]:font-mono [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-[13px] [&_pre]:my-2 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-3 [&_blockquote]:my-2 [&_blockquote]:text-zinc-600 [&_blockquote]:italic [&_a]:text-blue-600 [&_a]:underline relative">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                              {(msg.id === streamingMessageId || (!msg.content && isTyping && idx === messages.length - 1)) && (
                                <span className={`inline-block w-[6px] h-[15px] ml-1 align-middle animate-pulse rounded-[1px] bg-zinc-800`} style={{ animationDuration: "0.8s" }} />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        {msg.content && msg.id !== streamingMessageId && (
                          <Group
                            justify="space-between"
                            align="center"
                            pt="md"
                            className="animate-in fade-in duration-300"
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
                        )}
                      </Paper>
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          </div>
        )}

        {/* Input Area (Pinned to bottom of the Main Chat Window, NOT fixed to screen) */}
        {!isHome && (
          <div className="bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent px-4 pb-6 pt-4 shrink-0 z-10">
            <div className="mx-auto max-w-[800px]">
              <RichInputBox
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
                textareaRef={textareaRef}
                placeholder="Đặt câu hỏi tiếp theo..."
                setSearchModalOpen={setSearchModalOpen}
                role={role}
                isNewChat={!sessionId}
              />

              {/* Attached documents list below composer */}
              <div className="mt-3">
                {selectedDocs.length === 0 ? (
                  <Text size="xs" c="dimmed" fs="italic">
                    Chưa có tài liệu đính kèm.
                  </Text>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedDocs.map((d) => (
                      <span
                        key={d.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-200 rounded-full text-xs font-semibold text-zinc-700 shadow-sm transition-colors"
                      >
                        <IconFileText size={12} className="text-zinc-900" />
                        <span className="max-w-[150px] truncate">{d.title}</span>
                        {!sessionId && (
                          <UnstyledButton
                            onClick={() => toggleAttach(d)}
                            className="hover:text-red-500 font-bold ml-1 flex items-center justify-center rounded-full w-3.5 h-3.5"
                          >
                            ✕
                          </UnstyledButton>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Attach Modal */}
      <Modal
        opened={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        title={
          <Group gap="sm" align="center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: role === "lecturer"
                  ? "linear-gradient(135deg, #27272a, #52525b)"
                  : "linear-gradient(135deg, #3b82f6, #6366f1)",
              }}>
              <IconFileText size={16} className="text-white" />
            </div>
            <div>
              <Text fw={700} size="sm">Gắn Tài Liệu</Text>
              {selectedDocs.length > 0 && (
                <Text size="xs" c="dimmed">{selectedDocs.length} tài liệu đã chọn</Text>
              )}
            </div>
          </Group>
        }
        size="lg"
        radius="lg"
        centered
      >
        <Stack gap="sm">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <TextInput
              placeholder="Tìm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              radius="md"
              size="xs"
              styles={{ input: { height: 36 } }}
            />
            <Select
              placeholder="Tất Cả Môn Học"
              data={[
                { value: "", label: "Tất Cả Môn Học" },
                ...subjects.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))
              ]}
              value={filterSubject}
              onChange={setFilterSubject}
              radius="md"
              size="xs"
              styles={{ input: { height: 36 } }}
            />
            <Select
              placeholder="Tất Cả Loại"
              data={[
                { value: "", label: "Tất Cả Loại" },
                ...docTypes.map(t => ({ value: t.id, label: t.name }))
              ]}
              value={filterType}
              onChange={setFilterType}
              radius="md"
              size="xs"
              styles={{ input: { height: 36 } }}
            />
          </div>

          {/* Selected docs chips */}
          {selectedDocs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 py-1">
              {selectedDocs.map((d) => (
                <span
                  key={d.id}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                    role === "lecturer"
                      ? "bg-zinc-900 text-white"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {d.title?.length > 20 ? d.title.slice(0, 20) + "…" : d.title}
                  <UnstyledButton
                    onClick={() => toggleAttach(d)}
                    className={`ml-0.5 flex items-center justify-center rounded-full w-3.5 h-3.5 text-[10px] transition-colors ${
                      role === "lecturer" ? "hover:text-red-300" : "hover:text-red-500"
                    }`}
                  >
                    ✕
                  </UnstyledButton>
                </span>
              ))}
            </div>
          )}

          <Text size="10px" fw={700} c="dimmed" className="tracking-wider uppercase">
            KẾT QUẢ ({filteredDocs.length})
          </Text>

          {/* Document list */}
          <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1" style={{ scrollbarWidth: 'thin' }}>
            {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 mb-2">
                  <IconFileText size={18} className="text-zinc-400" />
                </div>
                <Text size="xs" c="dimmed">Không tìm thấy tài liệu nào.</Text>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isAttached = selectedDocs.some(x => x.id === doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleAttach(doc)}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-150 border ${
                      isAttached
                        ? (role === "lecturer"
                          ? "bg-zinc-50 border-zinc-300 ring-1 ring-zinc-300"
                          : "bg-blue-50/50 border-blue-200 ring-1 ring-blue-200")
                        : "bg-white border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200"
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                      isAttached
                        ? (role === "lecturer"
                          ? "bg-zinc-900 border-zinc-900 text-white"
                          : "bg-blue-600 border-blue-600 text-white")
                        : "border-zinc-300 bg-white"
                    }`}>
                      {isAttached && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    {/* Doc info */}
                    <div className="min-w-0 flex-1">
                      <Text size="xs" fw={600} className={`truncate ${
                        isAttached ? "text-zinc-900" : "text-zinc-700"
                      }`}>{doc.title}</Text>
                      <Text size="10px" c="dimmed">
                        {doc.document_type_name || "Tài liệu"} · {doc.subject_code || "N/A"}
                      </Text>
                    </div>

                    {/* Status badge */}
                    {isAttached && (
                      <Badge size="xs" variant="light" color={role === "lecturer" ? "dark" : "blue"} radius="sm">
                        Đã Chọn
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <Group justify="flex-end" pt="xs" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() => setSearchModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              radius="md"
              size="xs"
              color={role === "lecturer" ? "dark" : "blue"}
              onClick={() => setSearchModalOpen(false)}
            >
              Xong ({selectedDocs.length})
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
