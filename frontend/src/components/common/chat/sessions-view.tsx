"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconSearch,
  IconMessage2,
  IconClock,
  IconPin,
  IconChevronRight,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  Button,
  TextInput,
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  ActionIcon,
  Modal,
  Select,
  Loader,
} from "@mantine/core";
import { chatApi, type ChatSession } from "@/api/chat";
import { curriculumApi } from "@/api/curriculum";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

export function SessionsView() {
  const params = useParams();
  const router = useRouter();
  const role = (params?.role as string) || "student";

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  // New session modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await chatApi.listSessions();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await curriculumApi.getLookups();
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error("Error loading subjects lookups:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
    loadSubjects();
  }, []);

  const handleOpen = (id: string) => {
    router.push(`/${role}/chat?session=${id}`);
  };

  const handleOpenNewSessionModal = () => {
    setSelectedSubject(null);
    setSessionTitle("");
    setModalOpen(true);
  };

  const handleCreateSession = async () => {
    if (!selectedSubject) return;
    setCreating(true);
    try {
      const sub = subjects.find((s) => s.id === selectedSubject);
      const defaultTitle = sub ? `Trò chuyện môn ${sub.code}` : "Hội thoại mới";
      const title = sessionTitle.trim() || defaultTitle;
      
      const newSession = await chatApi.createSession(selectedSubject, title);
      setModalOpen(false);
      router.push(`/${role}/chat?session=${newSession.id}`);
    } catch (err) {
      console.error("Error creating session:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa phiên hội thoại này không?")) {
      try {
        await chatApi.deleteSession(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        console.error("Error deleting session:", err);
      }
    }
  };


  const groupSessionsByDate = (items: ChatSession[]) => {
    const groups: Record<string, ChatSession[]> = {
      "Hôm Nay": [],
      "Hôm Qua": [],
      "Tuần Này": [],
      "Trước Đó": [],
    };

    items.forEach((s) => {
      try {
        const d = parseISO(s.updated_at);
        if (isToday(d)) {
          groups["Hôm Nay"].push(s);
        } else if (isYesterday(d)) {
          groups["Hôm Qua"].push(s);
        } else if (isThisWeek(d)) {
          groups["Tuần Này"].push(s);
        } else {
          groups["Trước Đó"].push(s);
        }
      } catch (e) {
        groups["Trước Đó"].push(s);
      }
    });

    return Object.fromEntries(
      Object.entries(groups).filter(([_, list]) => list.length > 0)
    );
  };

  const groupedSessions = groupSessionsByDate(sessions);

  const subjectOptions = subjects.map((sub) => ({
    value: sub.id,
    label: `${sub.code} - ${sub.name}`,
  }));

  const isLecturer = role === "lecturer";

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header Section - matching explore-view pattern */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <IconMessage2 size={20} stroke={1.5} className="text-zinc-900" />
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
              Phiên Hội Thoại
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size="md" color={isLecturer ? "dark" : "blue"} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-24 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <IconMessage2 size={40} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
            <h5 className="text-[15px] font-medium text-zinc-900 mb-2">Không tìm thấy phiên hội thoại nào.</h5>
            <Text size="xs" c="dimmed">Bắt đầu cuộc trò chuyện mới từ trang Chat.</Text>
          </div>
        ) : (
          Object.entries(groupedSessions).map(([group, items]) => (
            <div key={group} className="mb-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex justify-between items-end mb-3 pb-2 border-b border-zinc-200">
                <Text size="xs" fw={700} c="dimmed" className="tracking-wider uppercase">
                  {group}
                </Text>
                <Text size="xs" className="font-semibold text-zinc-400 capitalize tracking-wide">
                  {items.length} phiên
                </Text>
              </div>
              <Stack gap="sm">
                {items.map((s) => {
                  let relativeTime = "";
                  try {
                    relativeTime = formatDistanceToNow(parseISO(s.updated_at), {
                      addSuffix: true,
                      locale: vi,
                    });
                  } catch (e) {
                    relativeTime = s.updated_at;
                  }

                    return (
                      <Paper
                        key={s.id}
                        onClick={() => handleOpen(s.id)}
                        withBorder
                        p="md"
                        radius="lg"
                        className={`group cursor-pointer hover:shadow-md transition-all bg-white ${
                          s.status === "active"
                            ? isLecturer
                              ? "border-zinc-800 ring-1 ring-zinc-800/30"
                              : "border-blue-500 ring-1 ring-blue-500/30"
                            : "hover:border-zinc-300"
                        }`}
                      >
                        <Group gap="md" align="center">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isLecturer ? "bg-zinc-100 text-zinc-800" : "bg-blue-50 text-blue-600"
                          }`}>
                            <IconMessage2 size={20} />
                          </div>
                        <div className="min-w-0 flex-1">
                          <Group gap="xs" align="center" wrap="nowrap">
                            <Text fw={700} size="sm" className="line-clamp-1 text-gray-900 flex-1">
                              {s.title}
                            </Text>
                            <Group gap={4} className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                onClick={(e) => handleDelete(e, s.id)}
                                title="Xóa phiên"
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                            {s.is_starred && (
                              <IconPin size={14} className={`-rotate-45 shrink-0 ${
                                isLecturer ? "text-zinc-600" : "text-blue-500"
                              }`} />
                            )}
                            {s.status === "active" && (
                              <Badge color={isLecturer ? "dark" : "blue"} variant="light" size="xs">
                                Đang Mở
                              </Badge>
                            )}
                          </Group>
                          <Group gap="md" className="mt-1">
                            <Group gap={4} align="center">
                              <IconClock size={12} className="text-gray-400" />
                              <Text size="xs" c="dimmed">{relativeTime}</Text>
                            </Group>
                          </Group>
                        </div>
                        <IconChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </div>
          ))
        )}
      </div>

      {/* New Session Creation Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={<Text fw={700} size="lg">Tạo phiên trò chuyện mới</Text>}
        radius="lg"
        centered
      >
        <Stack gap="md">
          <Select
            label="Chọn môn học"
            placeholder={subjectOptions.length === 0 ? "Chưa được phân công môn học" : "Tìm và chọn môn học của phiên thảo luận"}
            data={subjectOptions}
            value={selectedSubject}
            onChange={setSelectedSubject}
            disabled={subjectOptions.length === 0}
            searchable
            nothingFoundMessage="Không tìm thấy môn học"
            required
          />
          <TextInput
            label="Tiêu đề phiên thảo luận (Tùy chọn)"
            placeholder="Ví dụ: Ôn tập chương 4 - Mô hình hóa"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateSession}
              disabled={!selectedSubject || creating}
              loading={creating}
              color={isLecturer ? "dark" : "blue"}
            >
              Tạo phiên
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
