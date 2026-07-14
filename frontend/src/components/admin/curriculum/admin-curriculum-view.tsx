"use client";

import { useMemo, useState } from "react";

import { useCurriculum } from "@/hooks/admin/use-curriculum";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBook,
  IconCheck,
  IconEdit,
  IconEye,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

type SubjectSortMode = "access-desc" | "name-asc" | "name-desc";

const sortOptions = [
  { label: "Lượt Xem Nhiều", value: "access-desc" },
  { label: "A-Z", value: "name-asc" },
  { label: "Z-A", value: "name-desc" },
];

export function AdminCurriculumView() {
  const {
    loading,
    error,
    savingAction,
    subjects,
    subjectAccessCounts,
    newSubjectCode,
    newSubjectName,
    editingSubjectId,
    editingSubjectCode,
    editingSubjectName,
    addingStandaloneSubject,
    setAddingStandaloneSubject,
    setNewSubjectCode,
    setNewSubjectName,
    setEditingSubjectCode,
    setEditingSubjectName,
    startEditingSubject,
    setEditingSubjectId,
    handleCreateSubject,
    handleUpdateSubject,
    handleDeleteSubject,
  } = useCurriculum();

  const [sortMode, setSortMode] = useState<SubjectSortMode>("access-desc");

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const aAccess = subjectAccessCounts[a.id] || 0;
      const bAccess = subjectAccessCounts[b.id] || 0;
      const aName = `${a.name} ${a.code}`;
      const bName = `${b.name} ${b.code}`;

      if (sortMode === "access-desc") {
        return bAccess - aAccess || aName.localeCompare(bName, "vi");
      }

      if (sortMode === "name-desc") {
        return bName.localeCompare(aName, "vi");
      }

      return aName.localeCompare(bName, "vi");
    });
  }, [sortMode, subjectAccessCounts, subjects]);

  const totalAccess = sortedSubjects.reduce(
    (total, subject) => total + (subjectAccessCounts[subject.id] || 0),
    0,
  );

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <IconBook size={20} stroke={1.5} className="text-zinc-900" />
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
              Quản Lý Môn Học
            </h1>
          </div>
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={() => setAddingStandaloneSubject(true)}
            disabled={savingAction !== null}
            variant="filled"
            color="dark"
            size="xs"
            radius="md"
            className="!h-8 !text-[12px] !px-4 !font-semibold !rounded-lg"
          >
            Tạo Môn Học
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">
      <Stack gap="xl">
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Lỗi tải dữ liệu"
            color="red"
            radius={24}
          >
            {error}
          </Alert>
        )}

        <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <Group justify="space-between" align="center" gap="md">
            <Group gap="xl">
              <div>
                <Text size="xs" className="font-sans text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                  Tổng Môn Học
                </Text>
                <Text fw={850} className="font-sans text-[24px] leading-none text-zinc-900 mt-1.5">
                  {subjects.length}
                </Text>
              </div>
              <div className="border-l border-zinc-150 pl-6 h-8 flex flex-col justify-center">
                <Text size="xs" className="font-sans text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                  Tổng Lượt Xem
                </Text>
                <Text fw={850} className="font-sans text-[24px] leading-none text-zinc-900 mt-1.5">
                  {totalAccess}
                </Text>
              </div>
            </Group>

            <SegmentedControl
              value={sortMode}
              onChange={(value) => setSortMode(value as SubjectSortMode)}
              data={sortOptions}
              radius="xl"
              color="dark"
              classNames={{ root: "bg-zinc-100", label: "font-medium" }}
            />
          </Group>
        </div>

        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="lg" color="dark" />
          </Group>
        ) : sortedSubjects.length === 0 ? (
          <Paper
            withBorder
            radius={24}
            p="xl"
            className="border-dashed bg-white text-center shadow-sm"
          >
            <Stack align="center" gap="sm">
              <ThemeIcon color="gray" variant="light" radius="xl" size={56}>
                <IconBook size={28} />
              </ThemeIcon>
              <Text c="dimmed">Chưa có môn học nào. Hãy tạo môn học đầu tiên.</Text>
            </Stack>
          </Paper>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedSubjects.map((subject, index) => {
              const isEditingSubject = editingSubjectId === subject.id;
              const isSavingSubject = savingAction === `update-subject-${subject.id}`;
              const isDeletingSubject = savingAction === `delete-subject-${subject.id}`;
              const accessCount = subjectAccessCounts[subject.id] || 0;

              return (
                <Paper
                  key={subject.id}
                  withBorder
                  radius="lg"
                  p="lg"
                  className="flex min-h-[178px] flex-col bg-white border-zinc-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)]"
                >
                  {isEditingSubject ? (
                    <Stack gap="md" className="flex-1">
                      <Group align="center" gap="xs">
                        <TextInput
                          placeholder="Mã môn"
                          value={editingSubjectCode}
                          onChange={(e) => setEditingSubjectCode(e.target.value)}
                          className="w-[140px]"
                          radius="lg"
                          size="sm"
                          autoFocus
                        />
                        <TextInput
                          placeholder="Tên môn học"
                          value={editingSubjectName}
                          onChange={(e) => setEditingSubjectName(e.target.value)}
                          className="min-w-[220px] flex-1"
                          radius="lg"
                          size="sm"
                        />
                      </Group>

                      <Group justify="flex-end" gap="xs" className="mt-auto">
                        <ActionIcon
                          variant="filled"
                          color="green"
                          radius="lg"
                          size="lg"
                          onClick={() => handleUpdateSubject(subject)}
                          loading={isSavingSubject}
                          title="Lưu"
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="gray"
                          radius="lg"
                          size="lg"
                          onClick={() => setEditingSubjectId(null)}
                          title="Hủy"
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Group>
                    </Stack>
                  ) : (
                    <Stack gap="md" className="flex-1">
                      <Group justify="space-between" align="flex-start" gap="md">
                        <ThemeIcon color="gray" variant="light" radius="xl" size={44}>
                          <IconBook size={22} />
                        </ThemeIcon>
                        <Badge
                          variant="light"
                          color={index === 0 && accessCount > 0 ? "blue" : "dark"}
                          radius="xl"
                          className="font-mono"
                        >
                          #{index + 1}
                        </Badge>
                      </Group>

                      <div className="min-w-0">
                        <Text
                          size="xs"
                          fw={700}
                          className="mb-2 font-mono uppercase tracking-widest text-zinc-500"
                        >
                          {subject.code || "NO CODE"}
                        </Text>
                        <Text
                          fw={800}
                          className="line-clamp-2 font-sans text-[18px] text-zinc-900"
                        >
                          {subject.name}
                        </Text>
                      </div>

                      <Group justify="space-between" align="flex-end" className="mt-auto">
                        <Group gap="xs">
                          <ThemeIcon color="dark" variant="light" radius="lg" size="sm">
                            <IconEye size={14} />
                          </ThemeIcon>
                          <Text size="sm" fw={700} className="text-zinc-700">
                            {accessCount} Lượt Xem
                          </Text>
                        </Group>

                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="dark"
                            onClick={() => startEditingSubject(subject)}
                            disabled={savingAction !== null}
                            radius="lg"
                            title="Sửa môn học"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDeleteSubject(subject.id)}
                            disabled={savingAction !== null}
                            loading={isDeletingSubject}
                            radius="lg"
                            title="Xóa môn học"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Stack>
                  )}
                </Paper>
              );
            })}
          </div>
        )}
      </Stack>
      </div>

      <Modal
        opened={addingStandaloneSubject}
        onClose={() => setAddingStandaloneSubject(false)}
        title="Tạo môn học mới"
        centered
        size="lg"
        radius={24}
        classNames={{ content: "overflow-hidden rounded-[24px]" }}
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      >
        <Stack gap="md">
          <TextInput
            label="Mã môn"
            placeholder="Ví dụ: SWD392"
            value={newSubjectCode}
            onChange={(e) => setNewSubjectCode(e.target.value)}
            radius="lg"
            withAsterisk
          />
          <TextInput
            label="Tên môn học"
            placeholder="Nhập tên môn học"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            radius="lg"
            withAsterisk
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setAddingStandaloneSubject(false)}
              radius="lg"
            >
              Hủy
            </Button>
            <Button
              onClick={() => handleCreateSubject()}
              disabled={
                !newSubjectCode.trim() ||
                !newSubjectName.trim() ||
                savingAction === "create-subject-standalone"
              }
              loading={savingAction === "create-subject-standalone"}
              radius="lg"
              color="dark"
            >
              Tạo môn học
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
