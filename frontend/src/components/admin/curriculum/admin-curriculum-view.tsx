"use client";

import { AdminPageShell } from "@/components/layout/admin-page-shell";
import { useCurriculum } from "@/hooks/admin/use-curriculum";
import {
  ActionIcon,
  Alert,
  Button,
  Collapse,
  Divider,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBook,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconFolder,
  IconPlus,
  IconTrash,
  IconUnlink,
  IconX,
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
    addingStandaloneSubject,
    setAddingStandaloneSubject,
    selectedExistingSubject,
    setSelectedExistingSubject,
    handleAttachSubject,
    handleDetachSubject,
  } = useCurriculum();

  const getSubjectsForTerm = (termId: string) =>
    subjects.filter((sub) => sub.academic_term_id === termId);

  const unassignedSubjects = subjects.filter((sub) => sub.academic_term_id === null);
  const selectedAddingTerm = addingSubjectForTerm
    ? (sortedTerms.find((term) => term.id === addingSubjectForTerm) ?? null)
    : null;

  return (
    <AdminPageShell
      eyebrow="KHUNG CHƯƠNG TRÌNH"
      title="Học Kỳ."
      description="Thêm, sửa, xóa học kỳ và môn học trong hệ thống."
      actions={
        <>
          <Button
            variant="outline"
            leftSection={<IconPlus size={16} />}
            onClick={() => setAddingStandaloneSubject(true)}
            disabled={savingAction !== null}
            radius="xl"
            color="dark"
          >
            Tạo môn học
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={startAddingTerm}
            disabled={savingAction !== null}
            radius="xl"
            color="dark"
          >
            Thêm học kỳ
          </Button>
        </>
      }
    >
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

        <Collapse in={addingTerm}>
          <Paper withBorder p="lg" radius={24} className="border-dashed bg-white shadow-sm">
            <Stack gap="sm">
              <Text
                size="sm"
                fw={700}
                className="font-mono uppercase tracking-widest text-zinc-500"
              >
                Học kỳ mới
              </Text>
              <Group align="flex-end" gap="md">
                <TextInput
                  placeholder="Tên học kỳ, ví dụ: HK1 2026-2027"
                  value={newTermName}
                  onChange={(e) => setNewTermName(e.target.value)}
                  className="flex-1"
                  radius="lg"
                />
                <NumberInput
                  label="Thứ tự học kỳ"
                  min={1}
                  value={newTermOrder}
                  onChange={(val) => setNewTermOrder(Number(val))}
                  className="w-[120px]"
                  radius="lg"
                />
                <Button
                  onClick={handleCreateTerm}
                  disabled={!newTermName.trim() || savingAction === "create-term"}
                  loading={savingAction === "create-term"}
                  radius="xl"
                  color="dark"
                >
                  Lưu
                </Button>
                <Button variant="subtle" color="gray" onClick={resetTermForm} radius="xl">
                  Hủy
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Collapse>

        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="lg" color="dark" />
          </Group>
        ) : sortedTerms.length === 0 ? (
          <Paper
            withBorder
            radius={24}
            p="xl"
            className="border-dashed bg-white text-center shadow-sm"
          >
            <Stack align="center" gap="sm">
              <IconFolder size={48} className="text-zinc-300" />
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
                <Paper
                  key={term.id}
                  withBorder
                  radius={24}
                  className="overflow-hidden bg-white shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <Group justify="space-between" p="lg" align="center">
                    <Group gap="md" className="min-w-0 flex-1">
                      <ActionIcon
                        variant="light"
                        color="dark"
                        radius="lg"
                        size="lg"
                        onClick={() => toggleTerm(term.id)}
                      >
                        {isExpanded ? (
                          <IconChevronDown size={18} />
                        ) : (
                          <IconChevronRight size={18} />
                        )}
                      </ActionIcon>

                      {isEditing ? (
                        <Group gap="xs" className="max-w-[620px] flex-1">
                          <TextInput
                            value={editingTermName}
                            onChange={(e) => setEditingTermName(e.target.value)}
                            className="flex-1"
                            size="sm"
                            radius="lg"
                            autoFocus
                          />
                          <NumberInput
                            min={1}
                            value={editingTermOrder}
                            onChange={(val) => setEditingTermOrder(Number(val))}
                            className="w-[100px]"
                            size="sm"
                            radius="lg"
                          />
                          <ActionIcon
                            variant="filled"
                            color="green"
                            radius="lg"
                            onClick={() => handleUpdateTerm(term.id)}
                            loading={isSavingThisTerm}
                            title="Lưu"
                          >
                            <IconCheck size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="gray"
                            radius="lg"
                            onClick={() => setEditingTermId(null)}
                            title="Hủy"
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </Group>
                      ) : (
                        <button
                          type="button"
                          className="min-w-0 flex-1 cursor-pointer text-left"
                          onClick={() => toggleTerm(term.id)}
                        >
                          <Text fw={700} className="font-serif text-[20px] text-zinc-900">
                            {term.name}
                          </Text>
                          <Text
                            size="xs"
                            className="font-mono uppercase tracking-widest text-zinc-500"
                          >
                            Thứ tự {term.order} · {termSubjects.length} môn học
                          </Text>
                        </button>
                      )}
                    </Group>

                    {!isEditing && (
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="dark"
                          onClick={() => startEditingTerm(term)}
                          disabled={savingAction !== null}
                          radius="lg"
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
                          radius="lg"
                          title="Xóa học kỳ"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    )}
                  </Group>

                  <Collapse in={isExpanded}>
                    <Divider />
                    <Stack p="lg" gap="md">
                      <Group justify="space-between" align="center">
                        <Text
                          size="xs"
                          fw={700}
                          className="font-mono uppercase tracking-widest text-zinc-500"
                        >
                          Danh sách môn học
                        </Text>
                        <Button
                          variant="subtle"
                          size="xs"
                          leftSection={<IconPlus size={14} />}
                          onClick={() => startAddingSubject(term.id)}
                          color="dark"
                          radius="xl"
                        >
                          Thêm môn học
                        </Button>
                      </Group>

                      {termSubjects.length === 0 ? (
                        <Paper withBorder p="lg" radius={24} className="border-dashed text-center">
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
                                p="md"
                                radius={24}
                                className="bg-white transition-colors duration-150 hover:bg-zinc-50"
                              >
                                {isEditingSubject ? (
                                  <Group align="center" gap="xs">
                                    <TextInput
                                      placeholder="Mã môn"
                                      value={editingSubjectCode}
                                      onChange={(e) => setEditingSubjectCode(e.target.value)}
                                      className="w-[140px]"
                                      radius="lg"
                                      size="sm"
                                    />
                                    <TextInput
                                      placeholder="Tên môn học"
                                      value={editingSubjectName}
                                      onChange={(e) => setEditingSubjectName(e.target.value)}
                                      className="flex-1"
                                      radius="lg"
                                      size="sm"
                                    />
                                    <ActionIcon
                                      variant="filled"
                                      color="green"
                                      radius="lg"
                                      size="lg"
                                      onClick={() => handleUpdateSubject(sub)}
                                      loading={isSavingSubject}
                                    >
                                      <IconCheck size={16} />
                                    </ActionIcon>
                                    <ActionIcon
                                      variant="light"
                                      color="gray"
                                      radius="lg"
                                      size="lg"
                                      onClick={() => setEditingSubjectId(null)}
                                    >
                                      <IconX size={16} />
                                    </ActionIcon>
                                  </Group>
                                ) : (
                                  <Group justify="space-between" align="center">
                                    <Group gap="sm">
                                      <ThemeIcon color="gray" variant="light" radius="lg" size="lg">
                                        <IconBook size={16} />
                                      </ThemeIcon>
                                      <div>
                                        <Text
                                          size="xs"
                                          fw={700}
                                          className="font-mono uppercase tracking-widest text-zinc-500"
                                        >
                                          {sub.code}
                                        </Text>
                                        <Text size="sm" fw={700} className="text-zinc-900">
                                          {sub.name}
                                        </Text>
                                      </div>
                                    </Group>

                                    <Group gap="xs">
                                      <ActionIcon
                                        variant="subtle"
                                        color="dark"
                                        onClick={() => startEditingSubject(sub)}
                                        disabled={savingAction !== null}
                                        radius="lg"
                                        title="Sửa môn học"
                                      >
                                        <IconEdit size={14} />
                                      </ActionIcon>
                                      <ActionIcon
                                        variant="subtle"
                                        color="orange"
                                        onClick={() => handleDetachSubject(sub)}
                                        disabled={savingAction !== null}
                                        loading={savingAction === `detach-subject-${sub.id}`}
                                        radius="lg"
                                        title="Gỡ khỏi học kỳ"
                                      >
                                        <IconUnlink size={14} />
                                      </ActionIcon>
                                      <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        onClick={() => handleDeleteSubject(sub.id)}
                                        disabled={savingAction !== null}
                                        loading={isDeletingSubject}
                                        radius="lg"
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
                  </Collapse>
                </Paper>
              );
            })}
          </Stack>
        )}

        {!loading && unassignedSubjects.length > 0 && (
          <Paper
            withBorder
            radius={24}
            className="overflow-hidden border-dashed bg-white shadow-sm"
          >
            <Group justify="space-between" p="lg" align="center">
              <div>
                <Text fw={700} className="font-serif text-[20px] text-zinc-900">
                  Môn học chưa phân bổ
                </Text>
                <Text size="xs" className="font-mono uppercase tracking-widest text-zinc-500">
                  {unassignedSubjects.length} môn học tự do
                </Text>
              </div>
            </Group>
            <Divider />
            <Stack p="lg" gap="xs">
              {unassignedSubjects.map((sub) => {
                const isEditingSubject = editingSubjectId === sub.id;
                const isSavingSubject = savingAction === `update-subject-${sub.id}`;
                const isDeletingSubject = savingAction === `delete-subject-${sub.id}`;

                return (
                  <Paper key={sub.id} withBorder p="md" radius={24} className="bg-white">
                    {isEditingSubject ? (
                      <Group align="center" gap="xs">
                        <TextInput
                          placeholder="Mã môn"
                          value={editingSubjectCode}
                          onChange={(e) => setEditingSubjectCode(e.target.value)}
                          className="w-[140px]"
                          radius="lg"
                          size="sm"
                        />
                        <TextInput
                          placeholder="Tên môn học"
                          value={editingSubjectName}
                          onChange={(e) => setEditingSubjectName(e.target.value)}
                          className="flex-1"
                          radius="lg"
                          size="sm"
                        />
                        <ActionIcon
                          variant="filled"
                          color="green"
                          radius="lg"
                          size="lg"
                          onClick={() => handleUpdateSubject(sub)}
                          loading={isSavingSubject}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="gray"
                          radius="lg"
                          size="lg"
                          onClick={() => setEditingSubjectId(null)}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Group>
                    ) : (
                      <Group justify="space-between" align="center">
                        <Group gap="sm">
                          <ThemeIcon color="gray" variant="light" radius="lg" size="lg">
                            <IconBook size={16} />
                          </ThemeIcon>
                          <div>
                            <Text
                              size="xs"
                              fw={700}
                              className="font-mono uppercase tracking-widest text-zinc-500"
                            >
                              {sub.code}
                            </Text>
                            <Text size="sm" fw={700}>
                              {sub.name}
                            </Text>
                          </div>
                        </Group>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="dark"
                            onClick={() => startEditingSubject(sub)}
                            disabled={savingAction !== null}
                            radius="lg"
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
                            radius="lg"
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
          </Paper>
        )}
      </Stack>

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
              onClick={() => handleCreateSubject(null)}
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

      <Modal
        opened={addingSubjectForTerm !== null}
        onClose={() => setAddingSubjectForTerm(null)}
        title={selectedAddingTerm ? `Thêm môn học vào ${selectedAddingTerm.name}` : "Thêm môn học"}
        centered
        size="xl"
        radius={24}
        classNames={{ content: "overflow-hidden rounded-[24px]" }}
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      >
        {selectedAddingTerm && (
          <Stack gap="md">
            <Stack gap="xs">
              <Text size="sm" fw={700} className="text-zinc-900">
                Gắn môn học có sẵn
              </Text>
              <Group align="flex-end" gap="xs">
                <Select
                  placeholder="Chọn môn học..."
                  data={unassignedSubjects.map((sub) => ({
                    value: sub.id,
                    label: `${sub.code} - ${sub.name}`,
                  }))}
                  value={selectedExistingSubject}
                  onChange={setSelectedExistingSubject}
                  className="flex-1"
                  searchable
                  radius="lg"
                />
                <Button
                  radius="lg"
                  onClick={() => handleAttachSubject(selectedAddingTerm.id)}
                  loading={savingAction === `attach-subject-${selectedAddingTerm.id}`}
                  disabled={!selectedExistingSubject}
                  color="dark"
                >
                  Gắn vào kỳ này
                </Button>
              </Group>
            </Stack>

            <Divider my="xs" label="Hoặc tạo môn học mới" labelPosition="center" />

            <Stack gap="xs">
              <Text size="sm" fw={700} className="text-zinc-900">
                Tạo môn học mới
              </Text>
              <Group align="flex-end" gap="xs">
                <TextInput
                  placeholder="Mã môn"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="w-[180px]"
                  radius="lg"
                />
                <TextInput
                  placeholder="Tên môn học"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="flex-1"
                  radius="lg"
                />
                <Button
                  radius="lg"
                  onClick={() => handleCreateSubject(selectedAddingTerm.id)}
                  loading={savingAction === `create-subject-${selectedAddingTerm.id}`}
                  disabled={!newSubjectCode.trim() || !newSubjectName.trim()}
                  color="dark"
                >
                  Tạo mới
                </Button>
              </Group>
            </Stack>

            <Group justify="flex-end" mt="sm">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setAddingSubjectForTerm(null)}
                radius="lg"
              >
                Hủy
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </AdminPageShell>
  );
}
