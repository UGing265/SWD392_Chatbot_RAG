"use client";

import { AdminPageShell } from "@/components/layout/admin-page-shell";
import { DocStatus } from "@/api/document";
import { useDocuments } from "@/hooks/admin/use-documents";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Group,
  Loader,
  Pagination,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCheck,
  IconFileText,
  IconProgress,
  IconRefresh,
  IconSearch,
  IconThumbDown,
  IconThumbUp,
  IconTrash,
} from "@tabler/icons-react";

type StatusIcon = typeof IconCheck;

const statusConfig: Record<DocStatus, { label: string; color: string; icon: StatusIcon }> = {
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
    <AdminPageShell
      eyebrow="KHO TÀI LIỆU"
      title="Tài Liệu."
      description="Phê duyệt, từ chối và xóa tài liệu trong hệ thống."
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
        <Paper withBorder radius={24} p="lg" className="bg-white shadow-sm">
          <TextInput
            placeholder="Tìm kiếm tài liệu, môn học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSection={<IconSearch size={16} />}
            radius="lg"
            className="max-w-[520px]"
            size="md"
          />
        </Paper>

        <Paper withBorder radius={24} className="overflow-hidden bg-white shadow-sm">
          {loading ? (
            <Group justify="center" py="xl">
              <Loader size="lg" color="dark" />
            </Group>
          ) : (
            <Table.ScrollContainer minWidth={980}>
              <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
                <Table.Thead className="bg-zinc-50">
                  <Table.Tr>
                    <Table.Th style={{ width: 40 }}>
                      <Checkbox
                        checked={documents.length > 0 && selected.size === documents.length}
                        onChange={toggleAll}
                        indeterminate={selected.size > 0 && selected.size < documents.length}
                        color="dark"
                      />
                    </Table.Th>
                    {["Tên tài liệu", "Môn học", "Giảng viên", "Ngày tạo", "Trạng thái"].map(
                      (heading) => (
                        <Table.Th
                          key={heading}
                          className="font-mono text-[11px] uppercase tracking-widest text-zinc-500"
                        >
                          {heading}
                        </Table.Th>
                      ),
                    )}
                    <Table.Th className="text-right font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                      Thao tác
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {documents.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={7} className="text-center">
                        <Text c="dimmed" py="xl">
                          Không tìm thấy tài liệu nào
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    documents.map((doc) => {
                      const statusKey = doc.status in statusConfig ? doc.status : "pending";
                      const config = statusConfig[statusKey];
                      const StatusIcon = config.icon;

                      return (
                        <Table.Tr key={doc.id} className="transition-colors duration-150">
                          <Table.Td>
                            <Checkbox
                              checked={selected.has(doc.id)}
                              onChange={() => toggleOne(doc.id)}
                              color="dark"
                            />
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              <IconFileText size={18} className="text-zinc-400" />
                              <Text
                                size="sm"
                                fw={700}
                                className="max-w-[250px] font-serif text-[16px] text-zinc-900"
                                truncate
                              >
                                {doc.title}
                              </Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            {doc.subject_name ? (
                              <Badge variant="light" color="dark" radius="xl" className="font-mono">
                                {doc.subject_name}
                              </Badge>
                            ) : (
                              <Text size="xs" c="dimmed">
                                -
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              <Avatar size="sm" radius="xl" color="dark">
                                {doc.owner_initials}
                              </Avatar>
                              <Text size="sm" className="font-medium text-zinc-700">
                                {doc.owner_name}
                              </Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed" className="font-mono tracking-wider">
                              {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              variant="dot"
                              color={config.color}
                              radius="xl"
                              leftSection={<StatusIcon size={12} />}
                              className="font-mono tracking-widest"
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
                                    radius="lg"
                                  >
                                    <IconThumbUp size={16} />
                                  </ActionIcon>
                                  <ActionIcon
                                    variant="subtle"
                                    color="yellow"
                                    onClick={() => handleReject(doc.id)}
                                    title="Từ chối"
                                    radius="lg"
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
                                radius="lg"
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
            </Table.ScrollContainer>
          )}

          {!loading && totalPages > 1 && (
            <Group justify="space-between" p="md" className="border-t border-zinc-200 bg-zinc-50">
              <Text size="xs" className="font-mono uppercase tracking-widest text-zinc-500">
                Hiển thị {documents.length} tài liệu
              </Text>
              <Pagination
                total={totalPages}
                value={page}
                onChange={setPage}
                color="dark"
                radius="lg"
              />
            </Group>
          )}
        </Paper>

        <Paper withBorder radius={24} p="lg" className="border-dashed bg-white shadow-sm">
          <Text size="sm" fw={700} mb="xs" className="font-serif text-[18px] text-zinc-900">
            Quy trình xử lý tài liệu tự động
          </Text>
          <Text size="sm" c="dimmed" mb="md" className="leading-relaxed">
            Tài liệu sau khi phê duyệt sẽ được đưa qua pipeline xử lý: tải lên, phân tích văn bản,
            chia nhỏ ngữ nghĩa, trích xuất vector embedding và lưu trữ lập chỉ mục vào pgvector.
          </Text>
          <Group gap="xs" wrap="wrap">
            {["Tải lên", "Phân tích", "Chia đoạn", "Nhúng vector", "Lập chỉ mục"].map(
              (stage, idx) => (
                <Group key={stage} gap="xs" align="center">
                  <Badge variant="filled" color="dark" size="sm" circle>
                    {idx + 1}
                  </Badge>
                  <Text
                    size="xs"
                    fw={700}
                    className="font-mono uppercase tracking-widest text-zinc-600"
                  >
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
    </AdminPageShell>
  );
}
