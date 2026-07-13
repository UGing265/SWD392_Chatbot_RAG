"use client";


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
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <IconFileText size={20} stroke={1.5} className="text-zinc-900" />
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
              Tài Liệu Hệ Thống
            </h1>
          </div>
          <Button
            onClick={refresh}
            variant="default"
            size="xs"
            radius="md"
            leftSection={<IconRefresh size={14} />}
            className="!h-8 !text-[12px] !px-4 !font-semibold !rounded-lg"
          >
            Làm Mới
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">
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

        <div className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {loading ? (
            <Group justify="center" py="xl">
              <Loader size="lg" color="dark" />
            </Group>
          ) : (
            <Table.ScrollContainer minWidth={980}>
              <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover className="w-full">
                <Table.Thead className="bg-zinc-50/80 border-b border-zinc-100">
                  <Table.Tr>
                    <Table.Th className="w-[4%] py-3">
                      <Checkbox
                        checked={documents.length > 0 && selected.size === documents.length}
                        onChange={toggleAll}
                        indeterminate={selected.size > 0 && selected.size < documents.length}
                        color="dark"
                      />
                    </Table.Th>
                    <Table.Th className="w-[30%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Tên Tài Liệu
                    </Table.Th>
                    <Table.Th className="w-[20%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Môn Học
                    </Table.Th>
                    <Table.Th className="w-[20%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Giảng Viên
                    </Table.Th>
                    <Table.Th className="w-[12%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Ngày Tạo
                    </Table.Th>
                    <Table.Th className="w-[13%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Trạng Thái
                    </Table.Th>
                    <Table.Th className="w-[1%] text-left py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap" />
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
                                className="max-w-[250px] font-sans text-zinc-900"
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
        </div>

        <Paper withBorder radius={24} p="lg" className="border-dashed bg-white shadow-sm">
          <Text size="sm" fw={700} mb="xs" className="font-sans text-[15px] text-zinc-900">
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
      </div>
    </div>
  );
}
