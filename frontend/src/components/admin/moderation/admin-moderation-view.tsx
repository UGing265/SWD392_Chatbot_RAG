"use client";

import { AdminPageShell } from "@/components/layout/admin-page-shell";
import { useModeration } from "@/hooks/admin/use-moderation";
import { Alert, Button, Group, Loader, Paper, Stack, Table, Text } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconRefresh, IconTrash } from "@tabler/icons-react";

export function AdminModerationView() {
  const { reports, loading, handleResolve, refresh } = useModeration();

  return (
    <AdminPageShell
      eyebrow="KIỂM DUYỆT NỘI DUNG"
      title="Báo Cáo."
      description="Phê duyệt hoặc loại bỏ các tài liệu bị báo cáo vi phạm nội dung hoặc kỹ thuật."
      actions={
        <Button
          variant="filled"
          leftSection={<IconRefresh size={16} />}
          onClick={refresh}
          radius="xl"
          color="dark"
          className="h-11 px-6"
        >
          Làm mới
        </Button>
      }
    >
      <Stack gap="xl">
        <Alert
          variant="light"
          color="orange"
          title="Lưu ý kiểm duyệt"
          icon={<IconAlertTriangle size={18} />}
          radius={24}
          className="bg-white"
        >
          <Text size="sm">
            Danh sách tài liệu học tập bị sinh viên báo cáo lỗi. Quản trị viên cần xem xét kỹ để bỏ
            qua báo cáo hoặc xóa bỏ hoàn toàn khỏi cơ sở dữ liệu RAG.
          </Text>
        </Alert>

        <Paper withBorder radius={24} className="overflow-hidden bg-white shadow-sm">
          {loading ? (
            <Group justify="center" py="xl">
              <Loader size="lg" color="dark" />
            </Group>
          ) : (
            <Table.ScrollContainer minWidth={840}>
              <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
                <Table.Thead className="bg-zinc-50">
                  <Table.Tr>
                    <Table.Th className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                      Tài liệu bị báo cáo
                    </Table.Th>
                    <Table.Th className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                      Người báo cáo
                    </Table.Th>
                    <Table.Th className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                      Lý do
                    </Table.Th>
                    <Table.Th className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                      Môn học
                    </Table.Th>
                    <Table.Th className="text-right font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                      Thao tác
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {reports.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={5} className="text-center">
                        <Stack align="center" gap="xs" py="xl">
                          <IconAlertTriangle size={32} className="text-zinc-300" />
                          <Text c="dimmed" size="sm">
                            Không có báo cáo tài liệu nào cần xử lý
                          </Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    reports.map((doc) => (
                      <Table.Tr key={doc.id} className="transition-colors duration-150">
                        <Table.Td>
                          <Stack gap={2}>
                            <Text
                              size="sm"
                              fw={700}
                              className="font-serif text-[16px] text-zinc-900"
                            >
                              {doc.documentTitle}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Giảng viên: {doc.lecturerName}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" className="font-medium text-zinc-700">
                            {doc.reporterEmail}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <div className="inline-flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                            <span className="text-sm font-medium">{doc.reason}</span>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                            {doc.subjectCode}
                          </span>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs" justify="flex-end">
                            <Button
                              variant="outline"
                              color="gray"
                              size="xs"
                              radius="xl"
                              leftSection={<IconCheck size={14} />}
                              onClick={() => handleResolve(doc.id, "ignore")}
                            >
                              Bỏ qua
                            </Button>
                            <Button
                              variant="filled"
                              color="red"
                              size="xs"
                              radius="xl"
                              leftSection={<IconTrash size={14} />}
                              onClick={() => handleResolve(doc.id, "delete")}
                            >
                              Xóa vĩnh viễn
                            </Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Paper>
      </Stack>
    </AdminPageShell>
  );
}
