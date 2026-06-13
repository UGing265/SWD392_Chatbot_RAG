"use client";

import { useModeration } from "@/hooks/admin/use-moderation";
import {
  Table,
  Button,
  Group,
  Stack,
  Title,
  Text,
  Paper,
  Loader,
  Badge,
  Alert,
} from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconTrash, IconRefresh } from "@tabler/icons-react";

export function AdminModerationView() {
  const { reports, loading, handleResolve, refresh } = useModeration();

  return (
    <Stack gap="xl" p="md" style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>
            Kiểm duyệt báo cáo tài liệu xấu
          </Title>
          <Text size="sm" c="dimmed">
            Phê duyệt hoặc loại bỏ các tài liệu bị báo cáo vi phạm nội dung hoặc kỹ thuật
          </Text>
        </div>
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={refresh}
          radius="lg"
          color="dark"
        >
          Làm mới
        </Button>
      </Group>

      {/* Info Warning Banner */}
      <Alert
        variant="light"
        color="orange"
        title="Lưu ý kiểm duyệt"
        icon={<IconAlertTriangle size={18} />}
        radius="lg"
      >
        <Text size="sm">
          Danh sách tài liệu học tập bị sinh viên báo cáo lỗi (nội dung sai lệch, tài liệu trùng
          lặp, hoặc vi phạm bản quyền). Quản trị viên cần xem xét kỹ để giữ lại (bỏ qua báo cáo)
          hoặc xóa bỏ hoàn toàn khỏi cơ sở dữ liệu RAG.
        </Text>
      </Alert>

      {/* Main Table */}
      <Paper withBorder radius="lg" style={{ overflow: "hidden" }}>
        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="lg" color="dark" />
          </Group>
        ) : (
          <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
            <Table.Thead style={{ borderBottomWidth: 1.5 }}>
              <Table.Tr>
                <Table.Th>Tài liệu bị báo cáo</Table.Th>
                <Table.Th>Người báo cáo</Table.Th>
                <Table.Th>Lý do</Table.Th>
                <Table.Th>Môn học</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reports.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: "center", py: 40 }}>
                    <Stack align="center" gap="xs">
                      <IconAlertTriangle
                        size={32}
                        style={{ color: "var(--mantine-color-gray-4)" }}
                      />
                      <Text c="dimmed" size="sm">
                        Không có báo cáo tài liệu nào cần xử lý
                      </Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                reports.map((doc) => (
                  <Table.Tr key={doc.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm" fw={600}>
                          {doc.documentTitle}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Giảng viên: {doc.lecturerName}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{doc.reporterEmail}</Text>
                    </Table.Td>
                    <Table.Td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ height: 6, width: 6, borderRadius: "50%", backgroundColor: "var(--mantine-color-orange-5)" }} />
                        <span style={{ fontSize: "14px", fontWeight: 500 }}>{doc.reason}</span>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", border: "1px solid var(--mantine-color-default-border)", padding: "2px 8px", borderRadius: "6px", color: "var(--mantine-color-dimmed)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                        {doc.subjectCode}
                      </span>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <Button
                          variant="outline"
                          color="gray"
                          size="xs"
                          radius="lg"
                          leftSection={<IconCheck size={14} />}
                          onClick={() => handleResolve(doc.id, "ignore")}
                        >
                          Bỏ qua
                        </Button>
                        <Button
                          variant="filled"
                          color="red"
                          size="xs"
                          radius="lg"
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
        )}
      </Paper>
    </Stack>
  );
}
