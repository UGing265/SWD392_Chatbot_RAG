"use client";

import { useState } from "react";
import { useAssignments } from "@/hooks/admin/use-assignments";
import {
  Button,
  Checkbox,
  Grid,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconDeviceFloppy, IconSearch, IconUserCheck } from "@tabler/icons-react";

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

  const selectData = lecturers.map((lec) => ({
    value: lec.id,
    label: `${lec.name} (${lec.email})`,
  }));

  const filteredSubjects = subjects.filter(
    (sub) =>
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex items-center gap-2.5">
          <IconUserCheck size={20} stroke={1.5} className="text-zinc-900" />
          <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
            Phân Công Môn Học
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">
      <Paper withBorder radius={24} p="xl" className="bg-white shadow-sm">
        <Group gap="sm" mb="xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-700">
            <IconUserCheck size={20} stroke={1.5} />
          </div>
          <div>
            <Text fw={700} className="font-sans text-[16px] text-zinc-900">
              Phân công môn học cho giảng viên
            </Text>
            <Text size="xs" className="font-mono uppercase tracking-widest text-zinc-500">
              Đã chọn {assignedSubjects.length} môn
            </Text>
          </div>
        </Group>

        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="lg" color="dark" />
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

            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" fw={700} className="text-zinc-900">
                  Môn học phân công
                </Text>
                {subjects.length > 0 && (
                  <Text size="xs" className="font-mono uppercase tracking-widest text-zinc-500">
                    {subjects.length} môn khả dụng
                  </Text>
                )}
              </Group>

              {subjects.length === 0 ? (
                <Paper withBorder p="xl" radius={24} className="border-dashed text-center">
                  <Text size="sm" c="dimmed">
                    Chưa có môn học nào trong hệ thống.
                  </Text>
                </Paper>
              ) : (
                <>
                  <TextInput
                    placeholder="Tìm kiếm môn học theo mã hoặc tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    radius="lg"
                    leftSection={<IconSearch size={16} />}
                  />

                  {filteredSubjects.length === 0 ? (
                    <Paper withBorder p="xl" radius={24} className="border-dashed text-center">
                      <Text size="sm" c="dimmed">
                        Không tìm thấy môn học nào khớp với từ khóa tìm kiếm.
                      </Text>
                    </Paper>
                  ) : (
                    <div className="max-h-[360px] overflow-y-auto overflow-x-hidden pr-1">
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
                                radius={24}
                                onClick={() => !assignedToOther && toggleSubject(subject.id)}
                                className="group bg-white transition-all duration-300 hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                                style={{
                                  cursor: assignedToOther ? "not-allowed" : "pointer",
                                  borderColor: checked ? "var(--mantine-color-dark-6)" : undefined,
                                  borderWidth: checked ? "1.5px" : "1px",
                                  opacity: assignedToOther ? 0.6 : 1,
                                }}
                              >
                                <Group
                                  justify="space-between"
                                  wrap="nowrap"
                                  className="w-full min-w-0"
                                >
                                  <Group gap="sm" className="min-w-0 flex-1" wrap="nowrap">
                                    <Checkbox
                                      checked={checked}
                                      disabled={assignedToOther}
                                      onChange={() => {}}
                                      radius="xs"
                                      color="dark"
                                      className="shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <Text size="sm" fw={700} className="font-sans text-zinc-900">
                                        {subject.code}
                                      </Text>
                                      <Text size="xs" c="dimmed" truncate className="block">
                                        {subject.name}
                                      </Text>
                                    </div>
                                  </Group>

                                  {assignedToOther && (
                                    <Text
                                      size="xs"
                                      c="red.6"
                                      className="max-w-[120px] shrink-0"
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
                </>
              )}
            </Stack>

            <Button
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={handleSave}
              loading={saving}
              disabled={!selectedLecturer}
              radius="xl"
              size="md"
              fullWidth
              color="dark"
              className="h-11"
            >
              Lưu phân công môn học
            </Button>
          </Stack>
        )}
      </Paper>
      </div>
    </div>
  );
}
