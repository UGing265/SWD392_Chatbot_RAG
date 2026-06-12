"use client";

import { useCurriculum } from "@/hooks/admin/use-curriculum";
import { AcademicTerm, Subject } from "@/api/curriculum";
import {
  Button,
  Group,
  TextInput,
  NumberInput,
  Stack,
  Title,
  Text,
  Paper,
  ActionIcon,
  Collapse,
  Loader,
  Alert,
  Divider,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconChevronDown,
  IconChevronRight,
  IconBook,
  IconFolder,
  IconAlertCircle,
} from "@tabler/icons-react";

export function AdminCurriculumView() {
  const {
    loading,
    error,
    savingAction,
    expandedTerms,
    sortedTerms,
    subjects,
    addingTerm,
    newTermName,
    newTermOrder,
    editingTermId,
    setEditingTermId,
    editingTermName,
    editingTermOrder,
    addingSubjectForTerm,
    newSubjectCode,
    newSubjectName,
    editingSubjectId,
    editingSubjectCode,
    editingSubjectName,
    setNewTermName,
    setNewTermOrder,
    setEditingTermName,
    setEditingTermOrder,
    setNewSubjectCode,
    setNewSubjectName,
    setEditingSubjectCode,
    setEditingSubjectName,
    toggleTerm,
    startAddingTerm,
    startEditingTerm,
    resetTermForm,
    handleCreateTerm,
    handleUpdateTerm,
    handleDeleteTerm,
    startAddingSubject,
    startEditingSubject,
    setAddingSubjectForTerm,
    setEditingSubjectId,
    handleCreateSubject,
    handleUpdateSubject,
    handleDeleteSubject,
  } = useCurriculum();

  const getSubjectsForTerm = (termId: string) =>
    subjects.filter((sub) => sub.academic_term_id === termId);

  return (
    <Stack gap="xl" p="md" style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header section */}
      <Group justify="space-between" align="center">
        <div>
          <Title order={2} style={{ fontFamily: "var(--font-heading)" }}>
            Quản lý Học kỳ & Môn học
          </Title>
          <Text size="sm" c="dimmed">
            Thêm, sửa, xóa học kỳ và môn học trong hệ thống
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={startAddingTerm}
          disabled={savingAction !== null}
          radius="xl"
          size="md"
        >
          Thêm học kỳ
        </Button>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Lỗi tải dữ liệu" color="red" radius="md">
          {error}
        </Alert>
      )}

      {/* Adding Term Form */}
      <Collapse in={addingTerm}>
        <Paper withBorder p="md" radius="md" bg="violet.0" style={{ borderStyle: "dashed" }}>
          <Stack gap="sm">
            <Text size="sm" fw={700} c="violet">
              Học kỳ mới
            </Text>
            <Group align="flex-end" gap="md">
              <TextInput
                placeholder="Tên học kỳ, ví dụ: HK1 2026-2027"
                value={newTermName}
                onChange={(e) => setNewTermName(e.target.value)}
                style={{ flex: 1 }}
                radius="md"
              />
              <NumberInput
                label="Thứ tự học kỳ"
                min={1}
                value={newTermOrder}
                onChange={(val) => setNewTermOrder(Number(val))}
                style={{ width: 120 }}
                radius="md"
              />
              <Group gap="xs">
                <Button
                  onClick={handleCreateTerm}
                  disabled={!newTermName.trim() || savingAction === "create-term"}
                  loading={savingAction === "create-term"}
                  radius="md"
                  color="violet"
                >
                  Lưu
                </Button>
                <Button variant="subtle" color="gray" onClick={resetTermForm} radius="md">
                  Hủy
                </Button>
              </Group>
            </Group>
          </Stack>
        </Paper>
      </Collapse>

      {/* Main content */}
      {loading ? (
        <Group justify="center" py="xl">
          <Loader size="lg" color="violet" />
        </Group>
      ) : sortedTerms.length === 0 ? (
        <Paper withBorder radius="md" p="xl" style={{ textAlign: "center", borderStyle: "dashed" }}>
          <Stack align="center" gap="sm">
            <IconFolder size={48} style={{ opacity: 0.3 }} />
            <Text c="dimmed">Chưa có học kỳ nào. Hãy nhấn nút để thêm học kỳ mới.</Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="md">
          {sortedTerms.map((term) => {
            const termSubjects = getSubjectsForTerm(term.id);
            const isExpanded = expandedTerms.has(term.id);
            const isEditing = editingTermId === term.id;
            const isSavingThisTerm = savingAction === `update-term-${term.id}`;
            const isDeletingThisTerm = savingAction === `delete-term-${term.id}`;

            return (
              <Paper key={term.id} withBorder radius="md" shadow="sm">
                {/* Term Header row */}
                <Group justify="space-between" p="md" align="center">
                  <Group gap="md" style={{ flex: 1 }}>
                    <ActionIcon
                      variant="light"
                      color="violet"
                      radius="md"
                      size="lg"
                      onClick={() => toggleTerm(term.id)}
                    >
                      {isExpanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                    </ActionIcon>

                    {isEditing ? (
                      <Group gap="xs" style={{ flex: 1, maxWidth: 600 }}>
                        <TextInput
                          value={editingTermName}
                          onChange={(e) => setEditingTermName(e.target.value)}
                          style={{ flex: 1 }}
                          size="sm"
                          radius="md"
                          autoFocus
                        />
                        <NumberInput
                          min={1}
                          value={editingTermOrder}
                          onChange={(val) => setEditingTermOrder(Number(val))}
                          style={{ width: 100 }}
                          size="sm"
                          radius="md"
                        />
                        <ActionIcon
                          variant="filled"
                          color="green"
                          radius="md"
                          onClick={() => handleUpdateTerm(term.id)}
                          loading={isSavingThisTerm}
                          title="Lưu"
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="gray"
                          radius="md"
                          onClick={() => setEditingTermId(null)}
                          title="Hủy"
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Group>
                    ) : (
                      <div>
                        <Text
                          fw={600}
                          size="lg"
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleTerm(term.id)}
                        >
                          {term.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Thứ tự: {term.order} · {termSubjects.length} môn học
                        </Text>
                      </div>
                    )}
                  </Group>

                  {!isEditing && (
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => startEditingTerm(term)}
                        disabled={savingAction !== null}
                        radius="md"
                        title="Sửa học kỳ"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteTerm(term)}
                        disabled={savingAction !== null}
                        loading={isDeletingThisTerm}
                        radius="md"
                        title="Xóa học kỳ"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  )}
                </Group>

                {/* Term Subjects Collapse */}
                <Collapse in={isExpanded}>
                  <div>
                    <Divider />
                    <Stack p="md" gap="md">
                      <Group justify="space-between" align="center">
                        <Text size="xs" fw={700} c="dimmed" style={{ letterSpacing: 0.5 }}>
                          DANH SÁCH MÔN HỌC
                        </Text>
                        <Button
                          variant="subtle"
                          size="xs"
                          leftSection={<IconPlus size={14} />}
                          onClick={() => startAddingSubject(term.id)}
                        >
                          Thêm môn học
                        </Button>
                      </Group>

                      {/* Adding Subject Form */}
                      <Collapse in={addingSubjectForTerm === term.id}>
                        <Paper
                          withBorder
                          p="sm"
                          radius="md"
                          bg="gray.0"
                          style={{ borderStyle: "dashed" }}
                        >
                          <Stack gap="xs">
                            <Text size="xs" fw={700} c="violet">
                              Môn học mới
                            </Text>
                            <Group align="flex-end" gap="xs">
                              <TextInput
                                placeholder="Mã môn (ví dụ: SWD392)"
                                value={newSubjectCode}
                                onChange={(e) => setNewSubjectCode(e.target.value)}
                                style={{ width: 180 }}
                                radius="md"
                                size="sm"
                              />
                              <TextInput
                                placeholder="Tên môn học"
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                style={{ flex: 1 }}
                                radius="md"
                                size="sm"
                              />
                              <Group gap="xs">
                                <Button
                                  size="sm"
                                  radius="md"
                                  onClick={() => handleCreateSubject(term.id)}
                                  loading={savingAction === `create-subject-${term.id}`}
                                >
                                  Lưu
                                </Button>
                                <Button
                                  size="sm"
                                  variant="subtle"
                                  color="gray"
                                  onClick={() => setAddingSubjectForTerm(null)}
                                  radius="md"
                                >
                                  Hủy
                                </Button>
                              </Group>
                            </Group>
                          </Stack>
                        </Paper>
                      </Collapse>

                      {/* Subjects list */}
                      {termSubjects.length === 0 && addingSubjectForTerm !== term.id ? (
                        <Paper
                          withBorder
                          p="md"
                          radius="md"
                          style={{ borderStyle: "dashed", textAlign: "center" }}
                        >
                          <Text size="sm" c="dimmed">
                            Chưa có môn học nào trong học kỳ này.
                          </Text>
                        </Paper>
                      ) : (
                        <Stack gap="xs">
                          {termSubjects.map((sub) => {
                            const isEditingSubject = editingSubjectId === sub.id;
                            const isSavingSubject = savingAction === `update-subject-${sub.id}`;
                            const isDeletingSubject = savingAction === `delete-subject-${sub.id}`;

                            return (
                              <Paper
                                key={sub.id}
                                withBorder
                                p="sm"
                                radius="md"
                                bg="gray.0"
                                style={{ transition: "background-color 150ms ease" }}
                              >
                                {isEditingSubject ? (
                                  <Group align="center" gap="xs">
                                    <TextInput
                                      placeholder="Mã môn"
                                      value={editingSubjectCode}
                                      onChange={(e) => setEditingSubjectCode(e.target.value)}
                                      style={{ width: 140 }}
                                      radius="md"
                                      size="sm"
                                    />
                                    <TextInput
                                      placeholder="Tên môn học"
                                      value={editingSubjectName}
                                      onChange={(e) => setEditingSubjectName(e.target.value)}
                                      style={{ flex: 1 }}
                                      radius="md"
                                      size="sm"
                                    />
                                    <Group gap="xs">
                                      <ActionIcon
                                        variant="filled"
                                        color="green"
                                        radius="md"
                                        size="lg"
                                        onClick={() => handleUpdateSubject(sub)}
                                        loading={isSavingSubject}
                                      >
                                        <IconCheck size={16} />
                                      </ActionIcon>
                                      <ActionIcon
                                        variant="light"
                                        color="gray"
                                        radius="md"
                                        size="lg"
                                        onClick={() => setEditingSubjectId(null)}
                                      >
                                        <IconX size={16} />
                                      </ActionIcon>
                                    </Group>
                                  </Group>
                                ) : (
                                  <Group justify="space-between" align="center">
                                    <Group gap="sm">
                                      <Paper
                                        p={6}
                                        radius="md"
                                        bg="white"
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          boxShadow: "var(--mantine-shadow-xs)",
                                        }}
                                      >
                                        <IconBook
                                          size={16}
                                          style={{ color: "var(--mantine-color-violet-6)" }}
                                        />
                                      </Paper>
                                      <div>
                                        <Text size="xs" fw={700} c="dimmed">
                                          {sub.code}
                                        </Text>
                                        <Text size="sm" fw={600}>
                                          {sub.name}
                                        </Text>
                                      </div>
                                    </Group>

                                    <Group gap="xs">
                                      <ActionIcon
                                        variant="subtle"
                                        color="blue"
                                        onClick={() => startEditingSubject(sub)}
                                        disabled={savingAction !== null}
                                        radius="md"
                                        title="Sửa môn học"
                                      >
                                        <IconEdit size={14} />
                                      </ActionIcon>
                                      <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        onClick={() => handleDeleteSubject(sub.id)}
                                        disabled={savingAction !== null}
                                        loading={isDeletingSubject}
                                        radius="md"
                                        title="Xóa môn học"
                                      >
                                        <IconTrash size={14} />
                                      </ActionIcon>
                                    </Group>
                                  </Group>
                                )}
                              </Paper>
                            );
                          })}
                        </Stack>
                      )}
                    </Stack>
                  </div>
                </Collapse>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
