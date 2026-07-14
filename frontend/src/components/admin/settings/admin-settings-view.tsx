"use client";

import type { ReactNode } from "react";

import { useAdminSettings } from "@/hooks/admin/use-settings";
import {
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBell,
  IconDatabase,
  IconDeviceFloppy,
  IconKey,
  IconRefresh,
  IconShield,
  IconSettings,
} from "@tabler/icons-react";

function SectionCard({
  icon,
  title,
  description,
  color = "gray",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  children: ReactNode;
}) {
  return (
    <Paper
      withBorder
      radius={24}
      p="xl"
      className="bg-white shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <Group gap="md" mb="md">
        <ThemeIcon color={color} variant="light" size={48} radius={16}>
          {icon}
        </ThemeIcon>
        <div>
          <Text fw={700} className="font-sans text-[16px] text-zinc-900">
            {title}
          </Text>
          <Text size="xs" className="font-medium text-zinc-500">
            {description}
          </Text>
        </div>
      </Group>
      <Divider mb="md" />
      {children}
    </Paper>
  );
}

export function AdminSettingsView() {
  const {
    embeddingModel,
    setEmbeddingModel,
    vectorDimensions,
    setVectorDimensions,
    chunkSize,
    setChunkSize,
    similarityThreshold,
    setSimilarityThreshold,
    toggles,
    handleToggle,
    geminiApiKey,
    setGeminiApiKey,
    vectorDbConnection,
    setVectorDbConnection,
    saving,
    handleSave,
    handleReset,
  } = useAdminSettings();

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex items-center gap-2.5">
          <IconSettings size={20} stroke={1.5} className="text-zinc-900" />
          <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
            Cấu Hình Hệ Thống
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">
      <Stack gap="xl">
        <SectionCard
          icon={<IconDatabase size={20} />}
          title="RAG Engine"
          description="Cấu hình truy hồi và mô hình nhúng cho nền tảng tìm kiếm tài liệu."
          color="blue"
        >
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="Embedding Model"
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.currentTarget.value)}
              radius="lg"
            />
            <TextInput
              label="Vector Dimensions"
              value={vectorDimensions}
              onChange={(e) => setVectorDimensions(e.currentTarget.value)}
              radius="lg"
            />
            <TextInput
              label="Chunk Size"
              value={chunkSize}
              onChange={(e) => setChunkSize(e.currentTarget.value)}
              radius="lg"
            />
            <TextInput
              label="Similarity Threshold"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(e.currentTarget.value)}
              radius="lg"
            />
          </SimpleGrid>
        </SectionCard>

        <SectionCard
          icon={<IconShield size={20} />}
          title="Bảo mật & Xác thực"
          description="Quản lý chính sách bảo mật và phiên làm việc."
          color="blue"
        >
          <Stack gap="md">
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={600}>
                  Yêu cầu 2FA đối với Admin
                </Text>
                <Text size="xs" c="dimmed">
                  Bắt buộc xác thực 2 lớp khi truy cập bảng điều khiển
                </Text>
              </div>
              <Switch
                checked={toggles["Security-Require 2FA for Admins"]}
                onChange={(e) =>
                  handleToggle("Security-Require 2FA for Admins", e.currentTarget.checked)
                }
              />
            </Group>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={600}>
                  Giới hạn phiên làm việc (1 giờ)
                </Text>
                <Text size="xs" c="dimmed">
                  Tự động đăng xuất sau 1 giờ không hoạt động
                </Text>
              </div>
              <Switch
                checked={toggles["Security-Session Timeout (1 hour)"]}
                onChange={(e) =>
                  handleToggle("Security-Session Timeout (1 hour)", e.currentTarget.checked)
                }
              />
            </Group>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={600}>
                  Bật danh sách IP cho phép
                </Text>
                <Text size="xs" c="dimmed">
                  Chỉ cho phép các IP trong danh sách truy cập admin
                </Text>
              </div>
              <Switch
                checked={toggles["Security-IP Allowlist"]}
                onChange={(e) => handleToggle("Security-IP Allowlist", e.currentTarget.checked)}
              />
            </Group>
          </Stack>
        </SectionCard>

        <SectionCard
          icon={<IconBell size={20} />}
          title="Thông báo & Cảnh báo"
          description="Cấu hình nhận thông báo qua email và hệ thống."
          color="orange"
        >
          <Stack gap="md">
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={600}>
                  Cảnh báo lỗi phân tách chỉ mục
                </Text>
                <Text size="xs" c="dimmed">
                  Thông báo khi việc tạo embedding cho tài liệu bị lỗi
                </Text>
              </div>
              <Switch
                checked={toggles["Notifications-Indexing failure alerts"]}
                onChange={(e) =>
                  handleToggle("Notifications-Indexing failure alerts", e.currentTarget.checked)
                }
              />
            </Group>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={600}>
                  Báo cáo sử dụng hằng ngày
                </Text>
                <Text size="xs" c="dimmed">
                  Gửi báo cáo tổng hợp thống kê hệ thống mỗi ngày
                </Text>
              </div>
              <Switch
                checked={toggles["Notifications-Daily usage report"]}
                onChange={(e) =>
                  handleToggle("Notifications-Daily usage report", e.currentTarget.checked)
                }
              />
            </Group>
          </Stack>
        </SectionCard>

        <SectionCard
          icon={<IconKey size={20} />}
          title="Thông tin kết nối & API Keys"
          description="Quản lý thông tin kết nối cơ sở dữ liệu và Gemini API."
          color="teal"
        >
          <Stack gap="md">
            <PasswordInput
              label="Gemini API Key"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.currentTarget.value)}
              radius="lg"
            />
            <TextInput
              label="Vector DB Connection string"
              value={vectorDbConnection}
              onChange={(e) => setVectorDbConnection(e.currentTarget.value)}
              radius="lg"
            />
          </Stack>
        </SectionCard>

        <Group justify="flex-end" gap="md">
          <Button
            variant="outline"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={handleReset}
            radius="xl"
          >
            Đặt lại mặc định
          </Button>
          <Button
            color="dark"
            leftSection={<IconDeviceFloppy size={16} />}
            loading={saving}
            onClick={handleSave}
            radius="xl"
          >
            Lưu cài đặt
          </Button>
        </Group>
      </Stack>
      </div>
    </div>
  );
}
