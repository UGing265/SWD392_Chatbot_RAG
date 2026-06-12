"use client";

import { useDocuments } from "@/hooks/admin/use-documents";
import { DocStatus } from "@/api/document";
import {
  Table,
  Button,
  TextInput,
  Group,
  Stack,
  Title,
  Text,
  Paper,
  Loader,
  Badge,
  ActionIcon,
  Avatar,
  Pagination,
  Checkbox,
} from "@mantine/core";
import {
  IconSearch,
  IconRefresh,
  IconThumbUp,
  IconThumbDown,
  IconTrash,
  IconFileText,
  IconProgress,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";

const statusConfig: Record<DocStatus, { label: string; color: string; icon: any }> = {
  completed: {
    label: "Hoàn thành",
    color: "green",
    icon: IconCheck,
  },
  pending: {
    label: "Chờ duyệt",
    color: "yellow",
    icon: IconProgress,
  },
  rejected: {
    label: "Đã từ chối",
    color: "red",
    icon: IconAlertTriangle,
  },
  processing: {
    label: "Đang xử lý",
    color: "blue",
    icon: IconProgress,
  },
  failed: {
    label: "Thất bại",
    color: "red",
    icon: IconAlertTriangle,
  },
};

export function AdminDocumentsView() {
  const {
    documents,
    loading,
    selected,
    searchQuery,
    page,
    totalPages,
    setSearchQuery,
    setPage,
    handleApprove,
    handleReject,
    handleDelete,
    toggleAll,
    toggleOne,
    refresh,
  } = useDocuments();

  return (
    <Stack gap="xl" p="md" style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div>
        <Title order={2} style={{ fontFamily: "var(--font-heading)" }}>
          Quản lý Tài liệu
        </Title>
        <Text size="sm" c="dimmed">
          Phê duyệt, từ chối và xóa tài liệu trong hệ thống
        </Text>
      </div>

      {/* Toolbar */}
      <Group justify="space-between">
        <TextInput
          placeholder="Tìm kiếm tài liệu, môn học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftSection={<IconSearch size={16} />}
          radius="xl"
          style={{ width: "100%", maxWidth: 400 }}
          size="md"
        />
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
                <Table.Th style={{ width: 40 }}>
                  <Checkbox
                    checked={documents.length > 0 && selected.size === documents.length}
                    onChange={toggleAll}
                    indeterminate={selected.size > 0 && selected.size < documents.length}
                    color="violet"
                  />
                </Table.Th>
                <Table.Th>Tên tài liệu</Table.Th>
                <Table.Th>Môn học</Table.Th>
                <Table.Th>Giảng viên</Table.Th>
                <Table.Th>Ngày tạo</Table.Th>
                <Table.Th>Trạng thái</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {documents.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: "center", py: 40 }}>
                    <Text c="dimmed">Không tìm thấy tài liệu nào</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                documents.map((doc) => {
                  const statusKey = doc.status in statusConfig ? doc.status : "pending";
                  const config = statusConfig[statusKey];
                  const StatusIcon = config.icon;

                  return (
                    <Table.Tr key={doc.id}>
                      <Table.Td>
                        <Checkbox
                          checked={selected.has(doc.id)}
                          onChange={() => toggleOne(doc.id)}
                          color="violet"
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          <IconFileText
                            size={18}
                            style={{ color: "var(--mantine-color-gray-5)" }}
                          />
                          <Text size="sm" fw={600} style={{ maxWidth: 250 }} truncate>
                            {doc.title}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        {doc.subject_name ? (
                          <Badge variant="light" color="blue" radius="md">
                            {doc.subject_name}
                          </Badge>
                        ) : (
                          <Text size="xs" c="dimmed">
                            —
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          <Avatar size="sm" radius="xl" color="violet">
                            {doc.owner_initials}
                          </Avatar>
                          <Text size="sm">{doc.owner_name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="dot"
                          color={config.color}
                          radius="md"
                          leftSection={<StatusIcon size={12} />}
                        >
                          {config.label}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="flex-end">
                          {doc.status === "pending" && (
                            <>
                              <ActionIcon
                                variant="subtle"
                                color="green"
                                onClick={() => handleApprove(doc.id)}
                                title="Phê duyệt"
                                radius="md"
                              >
                                <IconThumbUp size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="yellow"
                                onClick={() => handleReject(doc.id)}
                                title="Từ chối"
                                radius="md"
                              >
                                <IconThumbDown size={16} />
                              </ActionIcon>
                            </>
                          )}
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDelete(doc.id)}
                            title="Xóa"
                            radius="md"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        )}

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <Group
            justify="space-between"
            p="md"
            bg="gray.0"
            style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Text size="xs" c="dimmed">
              Hiển thị {documents.length} tài liệu
            </Text>
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              color="violet"
              radius="md"
            />
          </Group>
        )}
      </Paper>

      {/* Process pipeline info box */}
      <Paper withBorder radius="md" p="md" bg="gray.0">
        <Text size="sm" fw={700} mb="xs">
          Quy trình xử lý tài liệu tự động
        </Text>
        <Text size="sm" c="dimmed" mb="md" style={{ lineHeight: 1.6 }}>
          Tài liệu sau khi phê duyệt sẽ được đưa qua pipeline xử lý: Tải lên → Phân tích văn bản →
          Chia nhỏ ngữ nghĩa → Trích xuất vector embedding (sử dụng Gemini Embedding 3072
          dimensions) → Lưu trữ lập chỉ mục vào pgvector.
        </Text>
        <Group gap="xs" wrap="wrap">
          {["Tải lên", "Phân tích", "Chia đoạn", "Nhúng vector", "Lập chỉ mục"].map(
            (stage, idx) => (
              <Group key={stage} gap="xs" align="center">
                <Badge variant="filled" color="violet" size="sm" circle>
                  {idx + 1}
                </Badge>
                <Text size="xs" fw={600} c="gray.7">
                  {stage}
                </Text>
                {idx < 4 && (
                  <Text size="xs" c="dimmed">
                    →
                  </Text>
                )}
              </Group>
            ),
          )}
        </Group>
      </Paper>
    </Stack>
  );
}
