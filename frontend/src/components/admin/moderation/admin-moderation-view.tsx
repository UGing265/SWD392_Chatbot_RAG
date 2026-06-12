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
          <Title order={2} style={{ fontFamily: "var(--font-heading)" }}>
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
          radius="xl"
          color="violet"
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
        radius="md"
      >
        <Text size="sm">
          Danh sách tài liệu học tập bị sinh viên báo cáo lỗi (nội dung sai lệch, tài liệu trùng
          lặp, hoặc vi phạm bản quyền). Quản trị viên cần xem xét kỹ để giữ lại (bỏ qua báo cáo)
          hoặc xóa bỏ hoàn toàn khỏi cơ sở dữ liệu RAG.
        </Text>
      </Alert>

      {/* Main Table */}
      <Paper withBorder radius="md" shadow="sm" style={{ overflow: "hidden" }}>
        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="lg" color="violet" />
          </Group>
        ) : (
          <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
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
                      <Badge variant="light" color="orange" radius="md">
                        {doc.reason}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="outline" color="blue" radius="md">
                        {doc.subjectCode}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <Button
                          variant="outline"
                          color="gray"
                          size="xs"
                          radius="md"
                          leftSection={<IconCheck size={14} />}
                          onClick={() => handleResolve(doc.id, "ignore")}
                        >
                          Bỏ qua
                        </Button>
                        <Button
                          variant="filled"
                          color="red"
                          size="xs"
                          radius="md"
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
