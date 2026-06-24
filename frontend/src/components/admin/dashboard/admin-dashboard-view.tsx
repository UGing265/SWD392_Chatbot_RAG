"use client";
import { useDashboard } from "@/hooks/admin/use-dashboard";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconDatabase,
  IconFileText,
  IconRefresh,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";

const statusConfig = {
  completed: { label: "Hoạt động", color: "green" },
  pending: { label: "Đang xử lý", color: "yellow" },
  processing: { label: "Đang xử lý", color: "blue" },
  failed: { label: "Thất bại", color: "red" },
  rejected: { label: "Bị từ chối", color: "red" },
} as const;

type RecentDocument = {
  id: string;
  title: string;
  owner_name?: string | null;
  owner_email?: string | null;
  created_at?: string | null;
  status?: string | null;
};

export function AdminDashboardView() {
  const { stats, recentDocs, loading, refresh } = useDashboard();

  const metrics = [
    {
      label: "Tổng người dùng",
      value: stats.totalUsers.toString(),
      icon: IconUsers,
      description: "Tài khoản đăng ký hệ thống",
      tone: "gray",
    },
    {
      label: "Tài liệu học tập",
      value: stats.totalDocuments.toString(),
      icon: IconDatabase,
      description: "Tài liệu học tập đã tải lên",
      tone: "gray",
    },
    {
      label: "Vector Embeddings",
      value: stats.totalEmbeddings.toString(),
      icon: IconShieldCheck,
      description: "Các đoạn văn bản đã nhúng RAG",
      tone: "gray",
    },
    {
      label: "Tài liệu bị báo cáo",
      value: stats.totalReports.toString(),
      icon: IconAlertCircle,
      description: "Cần quản trị viên kiểm duyệt",
      tone: stats.totalReports > 0 ? "red" : "gray",
    },
  ];

  return (
    <div className="relative min-h-full w-full flex-1 bg-zinc-50 font-sans">
      <div className="w-full px-4 py-10 sm:px-6 md:px-8 md:py-12 xl:px-[72px]">
        <div className="w-full">
          <Group
            justify="space-between"
            align="flex-end"
            gap="md"
            className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            <Stack gap={0}>
              <Text
                size="xs"
                fw={600}
                className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500"
              >
                TỔNG QUAN HỆ THỐNG
              </Text>
              <Title
                order={1}
                className="mb-3 select-none font-serif text-[40px] leading-none tracking-[-0.03em] text-zinc-900"
              >
                Quản Trị.
              </Title>
              <Text size="sm" c="dimmed" className="max-w-2xl font-sans font-medium">
                Theo dõi hiệu suất hệ thống RAG và hoạt động tải lên tài liệu học tập.
              </Text>
            </Stack>

            <Button
              onClick={refresh}
              color="dark"
              radius="xl"
              leftSection={<IconRefresh size={16} />}
              className="h-11 px-6 transition-transform duration-150 active:scale-[0.98]"
            >
              Làm mới
            </Button>
          </Group>

          {loading ? (
            <Center py={80}>
              <Loader size="lg" color="dark" />
            </Center>
          ) : (
            <Stack
              gap="xl"
              className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  const isReported =
                    metric.label === "Tài liệu bị báo cáo" && stats.totalReports > 0;

                  return (
                    <Paper
                      key={metric.label}
                      withBorder
                      p="lg"
                      radius={24}
                      className="group min-h-[180px] bg-white shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Stack gap={8}>
                          <Text
                            size="xs"
                            fw={900}
                            className="font-mono text-[11px] uppercase tracking-widest text-zinc-900"
                          >
                            {metric.label}
                          </Text>
                          <Group align="center" gap="xs">
                            <Text className="font-serif text-[36px] font-black leading-none tracking-[-0.03em] text-zinc-950">
                              {metric.value}
                            </Text>
                            {isReported && (
                              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.55)]" />
                            )}
                          </Group>
                        </Stack>

                        <ThemeIcon
                          color={metric.tone}
                          variant="light"
                          size={48}
                          radius={16}
                          className="border border-zinc-200 bg-zinc-100 text-zinc-700 transition-all duration-300 group-hover:bg-zinc-900 group-hover:text-white"
                        >
                          <Icon size={20} />
                        </ThemeIcon>
                      </Group>

                      <Text size="sm" fw={700} className="mt-8 leading-relaxed text-zinc-900">
                        {metric.description}
                      </Text>
                    </Paper>
                  );
                })}
              </div>

              <Paper
                withBorder
                radius={24}
                className="overflow-hidden bg-white shadow-sm animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
              >
                <Group
                  justify="space-between"
                  align="flex-start"
                  p="lg"
                  className="border-b border-zinc-200 bg-white"
                >
                  <Stack gap={2}>
                    <Text
                      fw={700}
                      className="font-serif text-[20px] tracking-[-0.02em] text-zinc-900"
                    >
                      Tiến trình hệ thống & Tài liệu mới tải lên
                    </Text>
                    <Text size="xs" className="font-medium text-zinc-500">
                      Danh sách các tài liệu mới nhất đã được phê duyệt và lưu trữ trong hệ thống
                      RAG.
                    </Text>
                  </Stack>
                  <Badge
                    color="dark"
                    variant="light"
                    radius="xl"
                    className="font-mono tracking-widest"
                  >
                    {recentDocs.length} tài liệu
                  </Badge>
                </Group>

                <Table.ScrollContainer minWidth={760}>
                  <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="md">
                    <Table.Thead className="bg-zinc-50">
                      <Table.Tr>
                        <Table.Th className="text-center font-mono text-[11px] uppercase tracking-widest">
                          Tài liệu
                        </Table.Th>
                        <Table.Th className="text-center font-mono text-[11px] uppercase tracking-widest">
                          Giảng viên
                        </Table.Th>
                        <Table.Th className="text-center font-mono text-[11px] uppercase tracking-widest">
                          Trạng thái
                        </Table.Th>
                        <Table.Th className="text-center font-mono text-[11px] uppercase tracking-widest">
                          Ngày cập nhật
                        </Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {recentDocs.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={4}>
                            <Center py={48}>
                              <Text size="sm" c="dimmed">
                                Chưa có tài liệu nào trong hệ thống
                              </Text>
                            </Center>
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        recentDocs.map((doc: RecentDocument) => {
                          const statusKey =
                            doc.status && doc.status in statusConfig
                              ? (doc.status as keyof typeof statusConfig)
                              : "completed";
                          const status = statusConfig[statusKey];

                          return (
                            <Table.Tr key={doc.id} className="transition-colors duration-150">
                              <Table.Td>
                                <Group gap="sm" wrap="nowrap">
                                  <ThemeIcon color="gray" variant="light" size="md" radius="lg">
                                    <IconFileText size={16} />
                                  </ThemeIcon>
                                  <Text
                                    size="sm"
                                    fw={700}
                                    className="font-serif text-[16px] text-zinc-900"
                                    lineClamp={1}
                                  >
                                    {doc.title}
                                  </Text>
                                </Group>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" className="font-medium text-zinc-700">
                                  {doc.owner_name || doc.owner_email || "Không rõ"}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Badge
                                  color={status.color}
                                  variant="dot"
                                  radius="xl"
                                  className="font-mono tracking-widest"
                                >
                                  {status.label}
                                </Badge>
                              </Table.Td>
                              <Table.Td>
                                <Text size="xs" c="dimmed" className="font-mono tracking-wider">
                                  {doc.created_at
                                    ? new Date(doc.created_at).toLocaleDateString("vi-VN")
                                    : "-"}
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          );
                        })
                      )}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Paper>
            </Stack>
          )}
        </div>
      </div>
    </div>
  );
}
