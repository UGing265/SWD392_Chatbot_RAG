"use client";


import {
  IconSearch,
  IconFileText,
  IconTrash,
  IconBook,
  IconCalendar,
  IconLock,
  IconGlobe,
  IconFolderOpen,
  IconArrowsSort,
} from "@tabler/icons-react";
import {
  Button,
  TextInput,
  Select,
  ActionIcon,
  Loader,
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Paper,
} from "@mantine/core";

interface Document {
  id: string;
  title: string;
  description: string | null;
  subject_name: string | null;
  academic_term_name: string | null;
  visibility: string;
  status: string;
  created_at: string;
  slug?: string;
}

import { useMyDocuments } from "@/hooks/lecturer/use-my-documents";

export function MyDocumentsView() {
  const {
    role,
    router,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    documents,
    handleDelete,
  } = useMyDocuments();


  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50">
      <div className="container mx-auto max-w-6xl p-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Group gap="md" align="center" mb="lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-[#0EA5E9] shadow-lg text-white">
              <IconFolderOpen size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-[#0EA5E9] bg-clip-text text-transparent">
                Tài liệu của tôi
              </h1>
              <Text c="dimmed">Quản lý tài liệu cá nhân của bạn</Text>
            </div>
          </Group>

          {/* Search and Sort Controls */}
          <Group justify="space-between" align="center">
            <TextInput
              className="flex-1"
              leftSection={<IconSearch size={16} className="text-gray-400" />}
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="md"
              radius="md"
              style={{ minWidth: "250px" }}
            />
            <Group gap="xs">
              <Select
                value={sortBy}
                onChange={(val) => setSortBy((val || "date") as any)}
                data={[
                  { value: "date", label: "Ngày tạo" },
                  { value: "subject", label: "Môn học" },
                  { value: "term", label: "Kỳ học" },
                ]}
                size="md"
                radius="md"
                w={180}
              />
              <ActionIcon
                variant="outline"
                color="gray"
                size="lg"
                radius="md"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                style={{ height: "42px", width: "42px" }}
              >
                <IconArrowsSort size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="xl" color="blue" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20">
            <Paper
              withBorder
              radius="24px"
              p="xl"
              bg="#ffffff"
              className="max-w-md mx-auto flex flex-col items-center justify-center py-12"
            >
              <div className="flex h-20 w-20 items-center justify-center mb-6 rounded-2xl bg-gray-100 text-gray-400">
                <IconFileText size={40} />
              </div>
              <Text fw={700} size="xl" className="mb-2 text-gray-700">
                Chưa có tài liệu nào
              </Text>
              <Text c="dimmed">Bắt đầu tải lên tài liệu của bạn</Text>
            </Paper>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                onClick={() => router.push(`/${role}/documents/${doc.slug || doc.id}`)}
                padding="lg"
                radius="lg"
                withBorder
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-100 hover:border-blue-200 bg-white"
              >
                <Group justify="space-between" align="start" mb="md">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-[#0EA5E9] shadow-lg group-hover:scale-105 transition-transform duration-300 text-white">
                    <IconFileText size={28} />
                  </div>
                  <Badge
                    variant="light"
                    color={doc.visibility === "public" ? "green" : "gray"}
                    radius="xl"
                    py="md"
                    px="md"
                    leftSection={
                      doc.visibility === "public" ? <IconGlobe size={12} /> : <IconLock size={12} />
                    }
                  >
                    {doc.visibility === "public" ? "Công khai" : "Riêng tư"}
                  </Badge>
                </Group>

                <Text
                  fw={700}
                  size="lg"
                  className="mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors text-gray-900"
                >
                  {doc.title}
                </Text>

                <Stack gap="xs" mb="lg">
                  <Group gap="xs" className="text-gray-500 text-sm">
                    <IconBook size={16} className="text-blue-500" />
                    <Text size="sm">{doc.subject_name || "Không có môn học"}</Text>
                  </Group>
                  <Group gap="xs" className="text-gray-500 text-sm">
                    <IconCalendar size={16} className="text-purple-500" />
                    <Text size="sm">{doc.academic_term_name || "Không có kỳ học"}</Text>
                  </Group>
                </Stack>

                {doc.description && (
                  <Text size="sm" c="dimmed" className="mb-4 line-clamp-2">
                    {doc.description}
                  </Text>
                )}

                <Group
                  justify="space-between"
                  align="center"
                  pt="md"
                  style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}
                >
                  <Text size="xs" c="dimmed">
                    {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={(e) => handleDelete(e, doc.id)}
                    radius="md"
                    size="lg"
                    className="hover:bg-red-50"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
