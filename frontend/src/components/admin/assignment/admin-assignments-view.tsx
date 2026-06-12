"use client";

import { useAssignments } from "@/hooks/admin/use-assignments";
import {
  Button,
  Group,
  Stack,
  Title,
  Text,
  Paper,
  Loader,
  Select,
  Checkbox,
  Grid,
} from "@mantine/core";
import {
  IconBook,
  IconDeviceFloppy,
  IconUserCheck,
} from "@tabler/icons-react";

export function AdminAssignmentsView() {
  const {
    lecturers,
    subjects,
    selectedLecturer,
    assignedSubjects,
    loading,
    saving,
    assignedBySubject,
    handleSelectLecturer,
    toggleSubject,
    handleSave,
  } = useAssignments();

  // Map lecturers into Mantine Select data format
  const selectData = lecturers.map((lec) => ({
    value: lec.id,
    label: `${lec.name} (${lec.email})`,
  }));

  return (
    <Stack gap="xl" p="md" style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header Section */}
      <div>
        <Title order={2} style={{ fontFamily: "var(--font-heading)" }}>
          Phân công môn học giảng dạy
        </Title>
        <Text size="sm" c="dimmed">
          Thiết lập danh sách môn học mà giảng viên có quyền quản lý và tải tài liệu
        </Text>
      </div>

      <Paper withBorder radius="md" p="xl" shadow="sm">
        <Group gap="sm" mb="xl">
          <Paper
            p={8}
            radius="md"
            bg="violet.1"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconUserCheck size={20} style={{ color: "var(--mantine-color-violet-6)" }} />
          </Paper>
          <Text fw={700} size="lg">
            Phân công môn học cho giảng viên
          </Text>
        </Group>

        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="lg" color="violet" />
          </Group>
        ) : (
          <Stack gap="lg">
            <Select
              label="Chọn giảng viên"
              placeholder="Chọn giảng viên trong danh sách"
              data={selectData}
              value={selectedLecturer}
              onChange={(val) => handleSelectLecturer(val || "")}
              radius="md"
              size="md"
              searchable
              clearable={false}
              leftSection={<IconUserCheck size={16} />}
            />

            <div>
              <Text size="sm" fw={700} mb="xs">
                Môn học phân công
              </Text>
              {subjects.length === 0 ? (
                <Paper withBorder p="md" radius="md" style={{ borderStyle: "dashed", textAlign: "center" }}>
                  <Text size="sm" c="dimmed">
                    Chưa có môn học nào trong hệ thống.
                  </Text>
                </Paper>
              ) : (
                <Grid>
                  {subjects.map((subject) => {
                    const existing = assignedBySubject.get(subject.id);
                    const assignedToOther = Boolean(
                      existing && existing.userId !== selectedLecturer
                    );
                    const checked = assignedSubjects.includes(subject.id);

                    return (
                      <Grid.Col key={subject.id} span={{ base: 12, sm: 6 }}>
                        <Paper
                          withBorder
                          p="md"
                          radius="md"
                          bg={checked ? "violet.0" : "white"}
                          onClick={() => !assignedToOther && toggleSubject(subject.id)}
                          style={{
                            cursor: assignedToOther ? "not-allowed" : "pointer",
                            borderColor: checked ? "var(--mantine-color-violet-4)" : undefined,
                            opacity: assignedToOther ? 0.6 : 1,
                            transition: "all 150ms ease",
                          }}
                        >
                          <Group justify="space-between" wrap="nowrap">
                            <Group gap="sm" style={{ flex: 1 }}>
                              <Checkbox
                                checked={checked}
                                disabled={assignedToOther}
                                onChange={() => {}} // Click is handled by parent Paper
                                radius="xs"
                                color="violet"
                              />
                              <div style={{ flex: 1 }}>
                                <Text size="sm" fw={600}>
                                  {subject.code}
                                </Text>
                                <Text size="xs" c="dimmed" truncate>
                                  {subject.name}
                                </Text>
                              </div>
                            </Group>

                            {assignedToOther && (
                              <Text size="xs" c="red.6" style={{ maxWidth: 120 }} truncate title={existing?.lecturerEmail}>
                                Đã giao: {existing?.lecturerName || existing?.lecturerEmail}
                              </Text>
                            )}
                          </Group>
                        </Paper>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              )}
            </div>

            <Button
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={handleSave}
              loading={saving}
              disabled={!selectedLecturer}
              radius="md"
              size="md"
              fullWidth
              color="violet"
            >
              Lưu phân công môn học
            </Button>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
