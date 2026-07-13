"use client";


import { useModeration } from "@/hooks/admin/use-moderation";
import { Alert, Button, Group, Loader, Paper, Stack, Table, Text } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconRefresh, IconTrash, IconShieldCheck } from "@tabler/icons-react";

export function AdminModerationView() {
  const { reports, loading, handleResolve, refresh } = useModeration();

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <IconShieldCheck size={20} stroke={1.5} className="text-zinc-900" />
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
              Báo Cáo Vi Phạm
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

        <div className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {loading ? (
            <Group justify="center" py="xl">
              <Loader size="lg" color="dark" />
            </Group>
          ) : (
            <Table.ScrollContainer minWidth={840}>
              <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover className="w-full">
                <Table.Thead className="bg-zinc-50/80 border-b border-zinc-100">
                  <Table.Tr>
                    <Table.Th className="w-[30%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Tài Liệu Bị Báo Cáo
                    </Table.Th>
                    <Table.Th className="w-[25%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Người Báo Cáo
                    </Table.Th>
                    <Table.Th className="w-[25%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Lý Do
                    </Table.Th>
                    <Table.Th className="w-[10%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Môn Học
                    </Table.Th>
                    <Table.Th className="w-[10%] text-right py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Thao Tác
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
                              className="font-sans text-zinc-900"
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
        </div>
      </Stack>
      </div>
    </div>
  );
}
