"use client";

import { useDashboard } from "@/hooks/admin/use-dashboard";
import {
  Title,
  Text,
  Group,
  Stack,
  Paper,
  SimpleGrid,
  Loader,
  Button,
  Table,
  Badge,
  ThemeIcon,
} from "@mantine/core";
import {
  IconUsers,
  IconDatabase,
  IconShieldCheck,
  IconAlertCircle,
  IconRefresh,
  IconFileText,
} from "@tabler/icons-react";

export function AdminDashboardView() {
  const { stats, recentDocs, loading, refresh } = useDashboard();

  const metrics = [
    {
      label: "Tổng người dùng",
      value: stats.totalUsers.toString(),
      icon: IconUsers,
      color: "blue",
      description: "Tài khoản đăng ký hệ thống",
    },
    {
      label: "Tài liệu học tập",
      value: stats.totalDocuments.toString(),
      icon: IconDatabase,
      color: "violet",
      description: "Tài liệu học tập đã tải lên",
    },
    {
      label: "Vector Embeddings",
      value: stats.totalEmbeddings.toString(),
      icon: IconShieldCheck,
      color: "green",
      description: "Các đoạn văn bản đã nhúng RAG",
    },
    {
      label: "Tài liệu bị báo cáo",
      value: stats.totalReports.toString(),
      icon: IconAlertCircle,
      color: stats.totalReports > 0 ? "red" : "gray",
      description: "Cần quản trị viên kiểm duyệt",
    },
  ];

  return (
    <Stack gap="xl" p="md" style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ fontFamily: "var(--font-heading)" }}>
            Hệ thống quản trị và Thống kê
          </Title>
          <Text size="sm" c="dimmed">
            Theo dõi hiệu suất hệ thống RAG và hoạt động tải lên tài liệu
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

      {loading ? (
        <Group justify="center" py="xl">
          <Loader size="lg" color="violet" />
        </Group>
      ) : (
        <>
          {/* Metrics Grid */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <Paper key={m.label} withBorder radius="md" p="md" shadow="sm">
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={700} style={{ textTransform: "uppercase" }}>
                      {m.label}
                    </Text>
                    <ThemeIcon color={m.color} variant="light" size="lg" radius="md">
                      <Icon size={20} />
                    </ThemeIcon>
                  </Group>

                  <Group align="flex-end" gap="xs" mt="xs">
                    <Text size="xl" fw={700} style={{ fontSize: 28, lineHeight: 1 }}>
                      {m.value}
                    </Text>
                  </Group>

                  <Text size="xs" c="dimmed" mt={4}>
                    {m.description}
                  </Text>
                </Paper>
              );
            })}
          </SimpleGrid>

          {/* Recent Documents Section */}
          <Paper withBorder radius="md" shadow="sm" style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--mantine-color-gray-2)",
              }}
            >
              <Title order={4} size="md">
                Tiến trình hệ thống & Tài liệu mới tải lên
              </Title>
              <Text size="xs" c="dimmed">
                Danh sách các tài liệu mới nhất đã được phê duyệt và lưu trữ
              </Text>
            </div>

            <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th>Tài liệu</Table.Th>
                  <Table.Th>Giảng viên</Table.Th>
                  <Table.Th>Trạng thái</Table.Th>
                  <Table.Th>Ngày cập nhật</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentDocs.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4} style={{ textAlign: "center", py: 20 }}>
                      <Text size="sm" c="dimmed">
                        Chưa có tài liệu nào
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  recentDocs.map((doc: any) => (
                    <Table.Tr key={doc.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <IconFileText
                            size={18}
                            style={{ color: "var(--mantine-color-gray-5)" }}
                          />
                          <Text size="sm" fw={600}>
                            {doc.title}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{doc.owner_name || "Không rõ"}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="dot"
                          color={
                            doc.status === "completed"
                              ? "green"
                              : doc.status === "pending"
                                ? "yellow"
                                : "blue"
                          }
                        >
                          {doc.status || "completed"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {doc.created_at
                            ? new Date(doc.created_at).toLocaleDateString("vi-VN")
                            : "—"}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </>
      )}
    </Stack>
  );
}
