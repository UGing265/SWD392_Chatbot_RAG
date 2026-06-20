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
import { cn } from "@/lib/utils";

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
    <div className="p-4 md:p-6 lg:p-8 bg-[#000000] min-h-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Tài liệu môn học</h1>
          <Text size="sm" className="mt-2 text-white/90">
            Xem và truy cập các tài liệu học tập được giảng viên cung cấp.
          </Text>
        </div>
        <Paper withBorder p="xs" radius="md" className="!bg-[#0d0d0d] !border-white/10 w-fit">
          <Group gap={4}>
            <Button
              variant={viewMode === "grid" ? "light" : "subtle"}
              color={viewMode === "grid" ? "blue" : "gray"}
              onClick={() => setViewMode("grid")}
              size="xs"
              radius="md"
              leftSection={<IconGridPattern size={14} />}
              className={cn(
                viewMode === "grid" ? "!bg-blue-500/20 !text-blue-400" : "!text-white/60 hover:!bg-white/5 hover:!text-white"
              )}
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
              className={cn(
                viewMode === "list" ? "!bg-blue-500/20 !text-blue-400" : "!text-white/60 hover:!bg-white/5 hover:!text-white"
              )}
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
            className={cn(
              activeSubject === sub ? "!bg-blue-600 !text-white" : "!bg-white/5 !text-white/80 hover:!bg-white/10 hover:!text-white"
            )}
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
                className="group relative flex flex-col hover:shadow-lg transition-all duration-300 hover:border-blue-500/50 !bg-[#0d0d0d] !border-white/10"
              >
                <Group justify="space-between" align="center" className="mb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5"
                  >
                    <Icon size={20} className={cn(
                      doc.iconColor === 'blue' ? "text-blue-400" :
                      doc.iconColor === 'red' ? "text-red-400" :
                      doc.iconColor === 'green' ? "text-green-400" :
                      "text-gray-400"
                    )} />
                  </div>
                  <Group gap={4} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      radius="xl"
                      onClick={() => setSelectedDoc(doc)}
                      title="Xem tài liệu"
                      className="!bg-blue-500/10 !text-blue-400"
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      radius="xl"
                      title="Tải xuống"
                      className="!bg-blue-500/10 !text-blue-400"
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Text
                  fw={700}
                  size="md"
                  className="mb-1 leading-tight text-white line-clamp-2 group-hover:text-blue-400 transition-colors"
                >
                  {doc.title}
                </Text>
                <Text size="sm" className="mb-6 line-clamp-2 text-white/80">{doc.desc}</Text>

                <Group
                  justify="space-between"
                  align="center"
                  className="mt-auto pt-4 border-t border-white/5"
                >
                  <Text size="xs" className="text-white/70">
                    Đã thêm {doc.dateAdded}
                  </Text>
                  <Badge variant="light" radius="sm" className="!bg-white/5 !text-white/80">
                    {doc.type} • {doc.size}
                  </Badge>
                </Group>
              </Paper>
            );
          })}
        </div>
      ) : (
        <Paper withBorder radius="lg" className="overflow-hidden !bg-[#0d0d0d] !border-white/10">
          <Table.ScrollContainer minWidth={600}>
            <Table highlightOnHover verticalSpacing="md" className="!text-white">
              <Table.Thead>
                <Table.Tr className="!border-white/10">
                  <Table.Th className="!text-white/90">Tên tài liệu</Table.Th>
                  <Table.Th className="!text-white/90">Ngày thêm</Table.Th>
                  <Table.Th className="!text-white/90">Kích thước</Table.Th>
                  <Table.Th style={{ textAlign: "right" }} className="!text-white/90">Hành động</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documents.map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <Table.Tr key={doc.id} className="group !border-white/5 hover:!bg-white/5 transition-colors">
                      <Table.Td>
                        <Group gap="sm">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5"
                          >
                            <Icon size={16} className={cn(
                              doc.iconColor === 'blue' ? "text-blue-400" :
                              doc.iconColor === 'red' ? "text-red-400" :
                              doc.iconColor === 'green' ? "text-green-400" :
                              "text-gray-400"
                            )} />
                          </div>
                          <div>
                            <Text fw={600} className="group-hover:text-blue-400 transition-colors text-white">
                              {doc.title}
                            </Text>
                            <Text size="xs" className="text-white/80">{doc.desc}</Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td className="text-white/90">{doc.dateAdded}</Table.Td>
                      <Table.Td>
                        <Badge variant="light" radius="sm" className="!bg-white/5 !text-white/80">
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
                            className="!bg-blue-500/10 !text-blue-400"
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            radius="xl"
                            title="Tải xuống"
                            className="!bg-blue-500/10 !text-blue-400"
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
        styles={{
          content: { backgroundColor: '#171717', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          header: { backgroundColor: '#171717', color: '#fff' },
        }}
      >
        <Stack gap="md" py="md">
          <Text size="sm" className="text-white/90">{selectedDoc?.desc}</Text>
          <Paper
            withBorder
            p="xl"
            radius="md"
            className="flex flex-col items-center justify-center py-12 !bg-white/5 !border-white/10"
          >
            <IconFileText size={48} className="text-white/20 mb-4" />
            <Text fw={600} className="text-white text-center">
              Nội dung tài liệu sẽ hiển thị ở đây
            </Text>
            <Text size="xs" className="text-white/70 mt-4">
              Tính năng xem file PDF/DOCX trực tiếp đang được phát triển.
            </Text>
          </Paper>
        </Stack>
      </Modal>
    </div>
  );
}
