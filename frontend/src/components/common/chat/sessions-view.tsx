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
  const [filter, setFilter] = useState("Gần đây");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Group sessions by dates
  const getFilteredSessions = () => {
    return sessions.filter((s) => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === "Quan trọng" ? s.is_starred : true;
      return matchesSearch && matchesFilter;
    });
  };

  const groupSessionsByDate = (items: ChatSession[]) => {
    const groups: Record<string, ChatSession[]> = {
      "Hôm nay": [],
      "Hôm qua": [],
      "Tuần này": [],
      "Trước đó": [],
    };

    items.forEach((s) => {
      try {
        const d = parseISO(s.updated_at);
        if (isToday(d)) {
          groups["Hôm nay"].push(s);
        } else if (isYesterday(d)) {
          groups["Hôm qua"].push(s);
        } else if (isThisWeek(d)) {
          groups["Tuần này"].push(s);
        } else {
          groups["Trước đó"].push(s);
        }
      } catch (e) {
        groups["Trước đó"].push(s);
      }
    });

    return Object.fromEntries(
      Object.entries(groups).filter(([_, list]) => list.length > 0)
    );
  };

  const filteredList = getFilteredSessions();
  const groupedSessions = groupSessionsByDate(filteredList);

  const subjectOptions = subjects.map((sub) => ({
    value: sub.id,
    label: `${sub.code} - ${sub.name}`,
  }));

  return (
    <div className="h-full overflow-y-auto bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Group justify="space-between" align="start" className="mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Phiên hội thoại</h1>
            <Text size="sm" c="dimmed" className="mt-1">
              Xem lại và tiếp tục các phiên chat trước đây.
            </Text>
          </div>
          <Button
            onClick={handleOpenNewSessionModal}
            radius="md"
            color="blue"
            leftSection={<IconPlus size={16} />}
          >
            Phiên mới
          </Button>
        </Group>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 sm:max-w-md">
            <TextInput
              placeholder="Tìm theo từ khoá…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={16} className="text-gray-400" />}
              radius="md"
            />
          </div>
          <Group gap="xs">
            {["Gần đây", "Quan trọng", "Tất cả"].map((t) => (
              <Button
                key={t}
                onClick={() => setFilter(t)}
                variant={filter === t ? "filled" : "light"}
                color={filter === t ? "blue" : "gray"}
                radius="xl"
                size="xs"
              >
                {t}
              </Button>
            ))}
          </Group>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="md" color="blue" />
          </div>
        ) : filteredList.length === 0 ? (
          <Paper withBorder p="xl" radius="lg" className="text-center bg-white shadow-sm">
            <Text size="md" c="dimmed">Không tìm thấy phiên hội thoại nào.</Text>
          </Paper>
        ) : (
          Object.entries(groupedSessions).map(([group, items]) => (
            <div key={group} className="mb-8">
              <Text size="xs" fw={700} c="dimmed" mb="sm" className="tracking-wider uppercase">
                {group}
              </Text>
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
                      className={`group cursor-pointer hover:border-blue-500/40 hover:shadow-md transition-all bg-white ${
                        s.status === "active" ? "border-blue-500 ring-1 ring-blue-500/30" : ""
                      }`}
                    >
                      <Group gap="md" align="center">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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
                              <IconPin size={14} className="-rotate-45 text-blue-500 shrink-0" />
                            )}
                            {s.status === "active" && (
                              <Badge color="blue" variant="light" size="xs">
                                Đang mở
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
            placeholder="Tìm và chọn môn học của phiên thảo luận"
            data={subjectOptions}
            value={selectedSubject}
            onChange={setSelectedSubject}
            searchable
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
              color="blue"
            >
              Tạo phiên
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
