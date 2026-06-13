"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconSearch,
  IconMessage2,
  IconClock,
  IconPin,
  IconChevronRight,
  IconPlus,
  IconPencil,
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
} from "@mantine/core";
import { sessionList, createSession, deleteSession } from "@/lib/sessions-store";

export function SessionsView() {
  const params = useParams();
  const router = useRouter();
  const role = (params?.role as string) || "student";

  const [filter, setFilter] = useState("Gần đây");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [renderTrigger, setRenderTrigger] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = (id: string) => {
    if (editingId) return;
    router.push(`/${role}/chat?session=${id}`);
  };

  const handleNewSession = () => {
    const s = createSession();
    router.push(`/${role}/chat?session=${s.id}`);
  };

  const startEditing = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      const session = sessionList.find((s) => s.id === editingId);
      if (session) {
        session.title = editTitle.trim();
      }
    }
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    setRenderTrigger((prev) => prev + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") setEditingId(null);
  };

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

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
            onClick={handleNewSession}
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

        {["Hôm nay", "Hôm qua", "Tuần này", "Trước đó"].map((group) => {
          const items = sessionList.filter((s) => s.date === group);
          if (!items.length) return null;
          return (
            <div key={group} className="mb-8">
              <Text size="xs" fw={700} c="dimmed" mb="sm" className="tracking-wider uppercase">
                {group}
              </Text>
              <Stack gap="sm">
                {items.map((s) => (
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
                          {editingId === s.id ? (
                            <input
                              ref={inputRef}
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={saveEdit}
                              onKeyDown={handleKeyDown}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-white border border-blue-500 rounded-md px-2 py-0.5 text-sm font-semibold text-gray-900 outline-none"
                            />
                          ) : (
                            <>
                              <Text fw={700} size="sm" className="line-clamp-1 text-gray-900 flex-1">
                                {s.title}
                              </Text>
                              <Group gap={4} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  size="sm"
                                  onClick={(e) => startEditing(e, s.id, s.title)}
                                  title="Đổi tên"
                                >
                                  <IconPencil size={14} />
                                </ActionIcon>
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
                            </>
                          )}
                          {s.starred && (
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
                            <Text size="xs" c="dimmed">{s.time}</Text>
                          </Group>
                          <Text size="xs" c="dimmed">{s.msgs} tin nhắn</Text>
                        </Group>
                      </div>
                      <IconChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </div>
          );
        })}
      </div>
    </div>
  );
}
