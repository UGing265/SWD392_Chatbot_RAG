"use client";

import {
  IconGridPattern,
  IconList,
  IconFileText,
  IconBrain,
  IconDownload,
  IconEye,
} from "@tabler/icons-react";
import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Paper,
  ActionIcon,
  Table,
} from "@mantine/core";
import { useStudentDocuments } from "@/hooks/student/use-documents";

export function StudentDocumentsView() {
  const {
    activeSubject,
    setActiveSubject,
    viewMode,
    setViewMode,
    selectedDoc,
    setSelectedDoc,
    subjects,
    documents,
  } = useStudentDocuments();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tài liệu môn học</h1>
          <Text c="dimmed" size="sm" className="mt-2">
            Xem và truy cập các tài liệu học tập được giảng viên cung cấp.
          </Text>
        </div>
        <Paper withBorder p="xs" radius="md" bg="#ffffff" className="w-fit">
          <Group gap={4}>
            <Button
              variant={viewMode === "grid" ? "light" : "subtle"}
              color={viewMode === "grid" ? "blue" : "gray"}
              onClick={() => setViewMode("grid")}
              size="xs"
              radius="md"
              leftSection={<IconGridPattern size={14} />}
            >
              Dạng lưới
            </Button>
            <Button
              variant={viewMode === "list" ? "light" : "subtle"}
              color={viewMode === "list" ? "blue" : "gray"}
              onClick={() => setViewMode("list")}
              size="xs"
              radius="md"
              leftSection={<IconList size={14} />}
            >
              Dạng danh sách
            </Button>
          </Group>
        </Paper>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {subjects.map((sub) => (
          <Button
            key={sub}
            onClick={() => setActiveSubject(sub)}
            variant={activeSubject === sub ? "filled" : "light"}
            color={activeSubject === sub ? "blue" : "gray"}
            radius="xl"
            size="sm"
          >
            {sub}
          </Button>
        ))}
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => {
            const Icon = doc.icon;
            return (
              <Paper
                key={doc.id}
                withBorder
                p="lg"
                radius="lg"
                className="group relative flex flex-col hover:shadow-lg transition-all duration-300 hover:border-blue-500/50 bg-white"
              >
                <Group justify="space-between" align="center" className="mb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `var(--mantine-color-${doc.iconColor}-0)` }}
                  >
                    <Icon size={20} className={`text-${doc.iconColor}-600`} />
                  </div>
                  <Group gap={4} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      radius="xl"
                      onClick={() => setSelectedDoc(doc)}
                      title="Xem tài liệu"
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      radius="xl"
                      title="Tải xuống"
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Text
                  fw={700}
                  size="md"
                  className="mb-1 leading-tight text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors"
                >
                  {doc.title}
                </Text>
                <Text size="sm" c="dimmed" className="mb-6 line-clamp-2">{doc.desc}</Text>

                <Group
                  justify="space-between"
                  align="center"
                  className="mt-auto pt-4"
                  style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}
                >
                  <Text size="xs" c="dimmed">
                    Đã thêm {doc.dateAdded}
                  </Text>
                  <Badge variant="light" color="gray" radius="sm">
                    {doc.type} • {doc.size}
                  </Badge>
                </Group>
              </Paper>
            );
          })}
        </div>
      ) : (
        <Paper withBorder radius="lg" style={{ overflow: "hidden" }} bg="#ffffff">
          <Table.ScrollContainer minWidth={600}>
            <Table striped highlightOnHover verticalSpacing="md" withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tên tài liệu</Table.Th>
                  <Table.Th>Ngày thêm</Table.Th>
                  <Table.Th>Kích thước</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Hành động</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documents.map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <Table.Tr key={doc.id} className="group">
                      <Table.Td>
                        <Group gap="sm">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `var(--mantine-color-${doc.iconColor}-0)` }}
                          >
                            <Icon size={16} className={`text-${doc.iconColor}-600`} />
                          </div>
                          <div>
                            <Text fw={600} className="group-hover:text-blue-600 transition-colors text-gray-900">
                              {doc.title}
                            </Text>
                            <Text size="xs" c="dimmed">{doc.desc}</Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>{doc.dateAdded}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="gray" radius="sm">
                          {doc.type} • {doc.size}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "right" }}>
                        <Group gap={4} justify="flex-end" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            radius="xl"
                            onClick={() => setSelectedDoc(doc)}
                            title="Xem tài liệu"
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            radius="xl"
                            title="Tải xuống"
                          >
                            <IconDownload size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}

      <Modal
        opened={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title}
        size="lg"
        radius="md"
      >
        <Stack gap="md" py="md">
          <Text size="sm" c="dimmed">{selectedDoc?.desc}</Text>
          <Paper
            withBorder
            p="xl"
            radius="md"
            bg="zinc-50/50"
            className="flex flex-col items-center justify-center py-12"
          >
            <IconFileText size={48} className="text-gray-400 mb-4" />
            <Text fw={600} className="text-gray-800 text-center">
              Nội dung tài liệu sẽ hiển thị ở đây
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              Tính năng xem file PDF/DOCX trực tiếp đang được phát triển.
            </Text>
          </Paper>
        </Stack>
      </Modal>
    </div>
  );
}
