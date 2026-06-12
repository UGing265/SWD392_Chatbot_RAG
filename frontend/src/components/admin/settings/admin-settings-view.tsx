"use client";

import { useAdminSettings } from "@/hooks/admin/use-settings";
import {
  Title,
  Text,
  Stack,
  Group,
  Paper,
  TextInput,
  PasswordInput,
  Switch,
  Button,
  SimpleGrid,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import {
  IconDatabase,
  IconShield,
  IconBell,
  IconKey,
  IconDeviceFloppy,
  IconRefresh,
} from "@tabler/icons-react";

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
    <Stack gap="xl" p="md" style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div>
        <Title order={2} style={{ fontFamily: "var(--font-heading)" }}>
          Cài đặt hệ thống
        </Title>
        <Text size="sm" c="dimmed">
          Cấu hình các tham số RAG engine, bảo mật và thông báo cho hệ thống
        </Text>
      </div>

      {/* Sections */}
      <Stack gap="md">
        {/* Section: RAG Engine */}
        <Paper withBorder radius="md" p="xl" shadow="sm">
          <Group gap="md" mb="md">
            <ThemeIcon color="violet" variant="light" size="lg" radius="md">
              <IconDatabase size={20} />
            </ThemeIcon>
            <div>
              <Title order={4}>RAG Engine</Title>
              <Text size="xs" c="dimmed">
                Cấu hình truy hồi và mô hình nhúng cho nền tảng tìm kiếm tài liệu
              </Text>
            </div>
          </Group>
          <Divider mb="md" />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="Embedding Model"
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.currentTarget.value)}
              radius="md"
            />
            <TextInput
              label="Vector Dimensions"
              value={vectorDimensions}
              onChange={(e) => setVectorDimensions(e.currentTarget.value)}
              radius="md"
            />
            <TextInput
              label="Chunk Size"
              value={chunkSize}
              onChange={(e) => setChunkSize(e.currentTarget.value)}
              radius="md"
            />
            <TextInput
              label="Similarity Threshold"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(e.currentTarget.value)}
              radius="md"
            />
          </SimpleGrid>
        </Paper>

        {/* Section: Security */}
        <Paper withBorder radius="md" p="xl" shadow="sm">
          <Group gap="md" mb="md">
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconShield size={20} />
            </ThemeIcon>
            <div>
              <Title order={4}>Bảo mật & Xác thực</Title>
              <Text size="xs" c="dimmed">
                Quản lý chính sách bảo mật và phiên làm việc
              </Text>
            </div>
          </Group>
          <Divider mb="md" />
          <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={500}>Yêu cầu 2FA đối với Admin</Text>
                <Text size="xs" c="dimmed">Bắt buộc xác thực 2 lớp khi truy cập bảng điều khiển</Text>
              </div>
              <Switch
                checked={toggles["Security-Require 2FA for Admins"]}
                onChange={(e) => handleToggle("Security-Require 2FA for Admins", e.currentTarget.checked)}
              />
            </Group>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={500}>Giới hạn phiên làm việc (1 giờ)</Text>
                <Text size="xs" c="dimmed">Tự động đăng xuất sau 1 giờ không hoạt động</Text>
              </div>
              <Switch
                checked={toggles["Security-Session Timeout (1 hour)"]}
                onChange={(e) => handleToggle("Security-Session Timeout (1 hour)", e.currentTarget.checked)}
              />
            </Group>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={500}>Bật danh sách IP cho phép</Text>
                <Text size="xs" c="dimmed">Chỉ cho phép các IP trong danh sách truy cập admin</Text>
              </div>
              <Switch
                checked={toggles["Security-IP Allowlist"]}
                onChange={(e) => handleToggle("Security-IP Allowlist", e.currentTarget.checked)}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Section: Notifications */}
        <Paper withBorder radius="md" p="xl" shadow="sm">
          <Group gap="md" mb="md">
            <ThemeIcon color="orange" variant="light" size="lg" radius="md">
              <IconBell size={20} />
            </ThemeIcon>
            <div>
              <Title order={4}>Thông báo & Cảnh báo</Title>
              <Text size="xs" c="dimmed">
                Cấu hình nhận thông báo qua email và hệ thống
              </Text>
            </div>
          </Group>
          <Divider mb="md" />
          <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={500}>Cảnh báo lỗi phân tách chỉ mục (Indexing Failure)</Text>
                <Text size="xs" c="dimmed">Thông báo khi việc tạo embedding cho tài liệu bị lỗi</Text>
              </div>
              <Switch
                checked={toggles["Notifications-Indexing failure alerts"]}
                onChange={(e) => handleToggle("Notifications-Indexing failure alerts", e.currentTarget.checked)}
              />
            </Group>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={500}>Báo cáo sử dụng hàng ngày</Text>
                <Text size="xs" c="dimmed">Gửi báo cáo tổng hợp thống kê hệ thống mỗi ngày</Text>
              </div>
              <Switch
                checked={toggles["Notifications-Daily usage report"]}
                onChange={(e) => handleToggle("Notifications-Daily usage report", e.currentTarget.checked)}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Section: API Keys */}
        <Paper withBorder radius="md" p="xl" shadow="sm">
          <Group gap="md" mb="md">
            <ThemeIcon color="teal" variant="light" size="lg" radius="md">
              <IconKey size={20} />
            </ThemeIcon>
            <div>
              <Title order={4}>Thông tin kết nối & API Keys</Title>
              <Text size="xs" c="dimmed">
                Quản lý thông tin kết nối Cơ sở dữ liệu và Gemini API
              </Text>
            </div>
          </Group>
          <Divider mb="md" />
          <Stack gap="md">
            <PasswordInput
              label="Gemini API Key"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.currentTarget.value)}
              radius="md"
            />
            <TextInput
              label="Vector DB Connection string"
              value={vectorDbConnection}
              onChange={(e) => setVectorDbConnection(e.currentTarget.value)}
              radius="md"
            />
          </Stack>
        </Paper>
      </Stack>

      {/* Action Buttons */}
      <Group justify="flex-end" mt="md" gap="md">
        <Button
          variant="outline"
          color="gray"
          leftSection={<IconRefresh size={16} />}
          onClick={handleReset}
          radius="md"
        >
          Đặt lại mặc định
        </Button>
        <Button
          color="violet"
          leftSection={<IconDeviceFloppy size={16} />}
          loading={saving}
          onClick={handleSave}
          radius="md"
        >
          Lưu cài đặt
        </Button>
      </Group>
    </Stack>
  );
}
