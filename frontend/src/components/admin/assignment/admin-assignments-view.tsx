"use client";

import { useState } from "react";
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
  TextInput,
} from "@mantine/core";
import { IconBook, IconDeviceFloppy, IconUserCheck, IconSearch } from "@tabler/icons-react";

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

  const [searchQuery, setSearchQuery] = useState("");

  // Map lecturers into Mantine Select data format
  const selectData = lecturers.map((lec) => ({
    value: lec.id,
    label: `${lec.name} (${lec.email})`,
  }));

  const filteredSubjects = subjects.filter(
    (sub) =>
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Stack gap="xl" p="md" style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header Section */}
      <div>
        <Title order={2}>
          Phân công môn học giảng dạy
        </Title>
        <Text size="sm" c="dimmed">
          Thiết lập danh sách môn học mà giảng viên có quyền quản lý và tải tài liệu
        </Text>
      </div>

      <Paper withBorder radius="lg" p="xl">
        <Group gap="sm" mb="xl">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "8px",
              border: "1px solid var(--mantine-color-default-border)",
              backgroundColor: "rgba(0,0,0,0.02)",
            }}
          >
            <IconUserCheck size={18} style={{ color: "var(--mantine-color-text)" }} />
          </div>
          <Text fw={700} size="lg">
            Phân công môn học cho giảng viên
          </Text>
        </Group>

        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="lg" color="blue" />
          </Group>
        ) : (
          <Stack gap="lg">
            <Select
              label="Chọn giảng viên"
              placeholder="Chọn giảng viên trong danh sách"
              data={selectData}
              value={selectedLecturer}
              onChange={(val) => handleSelectLecturer(val || "")}
              radius="lg"
              size="md"
              searchable
              clearable={false}
              leftSection={<IconUserCheck size={16} />}
            />

            <div>
              <Group justify="space-between" align="center" mb="xs">
                <Text size="sm" fw={700}>
                  Môn học phân công
                </Text>
                {subjects.length > 0 && (
                  <Text size="xs" c="dimmed">
                    Đã chọn {assignedSubjects.length} môn
                  </Text>
                )}
              </Group>
              {subjects.length === 0 ? (
                <Paper
                  withBorder
                  p="md"
                  radius="lg"
                  style={{ borderStyle: "dashed", textAlign: "center" }}
                >
                  <Text size="sm" c="dimmed">
                    Chưa có môn học nào trong hệ thống.
                  </Text>
                </Paper>
              ) : (
                <Stack gap="sm">
                  <TextInput
                    placeholder="Tìm kiếm môn học theo mã hoặc tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    radius="lg"
                    leftSection={<IconSearch size={16} />}
                  />

                  {filteredSubjects.length === 0 ? (
                    <Paper
                      withBorder
                      p="md"
                      radius="lg"
                      style={{ borderStyle: "dashed", textAlign: "center" }}
                    >
                      <Text size="sm" c="dimmed">
                        Không tìm thấy môn học nào khớp với từ khóa tìm kiếm.
                      </Text>
                    </Paper>
                  ) : (
                    <div style={{ maxHeight: 320, overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
                      <Grid>
                        {filteredSubjects.map((subject) => {
                          const existing = assignedBySubject.get(subject.id);
                          const assignedToOther = Boolean(
                            existing && existing.userId !== selectedLecturer,
                          );
                          const checked = assignedSubjects.includes(subject.id);

                          return (
                            <Grid.Col key={subject.id} span={{ base: 12, sm: 6 }}>
                              <Paper
                                withBorder
                                p="md"
                                radius="lg"
                                bg="transparent"
                                onClick={() => !assignedToOther && toggleSubject(subject.id)}
                                style={{
                                  cursor: assignedToOther ? "not-allowed" : "pointer",
                                  borderColor: checked ? "var(--mantine-color-text)" : undefined,
                                  borderWidth: checked ? "1.5px" : "1px",
                                  opacity: assignedToOther ? 0.6 : 1,
                                  transition: "all 150ms ease",
                                }}
                              >
                                <Group justify="space-between" wrap="nowrap" style={{ width: "100%", minWidth: 0 }}>
                                  <Group gap="sm" style={{ flex: 1, minWidth: 0 }} wrap="nowrap">
                                    <Checkbox
                                      checked={checked}
                                      disabled={assignedToOther}
                                      onChange={() => {}} // Click is handled by parent Paper
                                      radius="xs"
                                      color="dark"
                                      style={{ flexShrink: 0 }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <Text size="sm" fw={600}>
                                        {subject.code}
                                      </Text>
                                      <Text size="xs" c="dimmed" truncate style={{ display: "block" }}>
                                        {subject.name}
                                      </Text>
                                    </div>
                                  </Group>

                                  {assignedToOther && (
                                    <Text
                                      size="xs"
                                      c="red.6"
                                      style={{ maxWidth: 120, flexShrink: 0 }}
                                      truncate
                                      title={existing?.lecturerEmail}
                                    >
                                      Đã giao: {existing?.lecturerName || existing?.lecturerEmail}
                                    </Text>
                                  )}
                                </Group>
                              </Paper>
                            </Grid.Col>
                          );
                        })}
                      </Grid>
                    </div>
                  )}
                </Stack>
              )}
            </div>

            <Button
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={handleSave}
              loading={saving}
              disabled={!selectedLecturer}
              radius="lg"
              size="md"
              fullWidth
              color="dark"
            >
              Lưu phân công môn học
            </Button>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
