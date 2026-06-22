"use client";


import {
  IconUpload,
  IconFileText,
  IconCircleCheck,
  IconX,
  IconBook,
  IconCalendar,
  IconLock,
  IconGlobe,
} from "@tabler/icons-react";
import {
  Button,
  TextInput,
  Textarea,
  Select,
  Paper,
  Text,
  Loader,
  Group,
  Stack,
  ActionIcon,
} from "@mantine/core";

interface Subject {
  id: string;
  name: string;
  academicTermId?: string;
}

interface AcademicTerm {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
}

import { useUpload } from "@/hooks/lecturer/use-upload";

export function UploadView() {
  const {
    file,
    title,
    setTitle,
    description,
    setDescription,
    subjectId,
    setSubjectId,
    termId,
    setTermId,
    chapterId,
    setChapterId,
    visibility,
    setVisibility,
    uploading,
    uploaded,
    subjects,
    terms,
    chapters,
    handleFileChange,
    removeFile,
    handleUpload,
  } = useUpload();


  if (uploaded) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6 bg-zinc-50">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-600 shadow-lg shadow-green-100 text-white">
            <IconCircleCheck size={48} />
          </div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Tải lên thành công!
          </h2>
          <Text c="dimmed" size="lg">Tài liệu của bạn đang được xử lý</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50">
      <div className="container mx-auto max-w-3xl p-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center mb-4 rounded-full bg-zinc-100 px-4 py-2">
            <IconUpload size={16} className="mr-2 text-zinc-700" />
            <span className="text-sm font-semibold text-zinc-700">Tài liệu giáo dục</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-[#111111] dark:text-[#f8fafc] font-sans">
            Tải lên tài liệu mới
          </h1>
          <Text c="dimmed" size="lg" className="max-w-2xl mx-auto">
            Chia sẻ tài liệu giảng dạy với sinh viên của bạn. Hỗ trợ PDF, DOC, DOCX, PPT, PPTX
          </Text>
        </div>

        <form onSubmit={handleUpload} className="space-y-8">
          {/* File Upload Area */}
          <div>
            <input
              type="file"
              id="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="file"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                padding: "48px 24px",
                borderRadius: "12px",
                border: "2px dashed var(--mantine-color-gray-3)",
                backgroundColor: file ? "var(--mantine-color-gray-0)" : "#ffffff",
                transition: "all 150ms ease",
              }}
              className="hover:border-zinc-800 hover:bg-zinc-50"
            >
              {file ? (
                <div className="flex w-full items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#111111] shadow-lg">
                    <IconFileText size={40} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text fw={700} size="lg" className="truncate text-gray-900">
                      {file.name}
                    </Text>
                    <Text size="sm" c="dimmed" className="mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </div>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="xl"
                    radius="lg"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFile();
                    }}
                    disabled={uploading}
                  >
                    <IconX size={24} />
                  </ActionIcon>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#111111] shadow-lg text-white">
                    <IconUpload size={40} />
                  </div>
                  <Text fw={700} size="xl" className="mb-2 text-gray-900">
                    Kéo và thả file vào đây
                  </Text>
                  <Text c="dimmed" size="sm">hoặc nhấp để chọn file từ máy tính</Text>
                  <Group gap="xs" mt="md">
                    {["PDF", "DOC", "DOCX", "PPT", "PPTX"].map((ext) => (
                      <span
                        key={ext}
                        className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-500"
                      >
                        {ext}
                      </span>
                    ))}
                  </Group>
                </>
              )}
            </label>
          </div>

          {/* Document Details */}
          <Paper withBorder radius="lg" p="xl" bg="#ffffff" className="space-y-6">
            <TextInput
              id="title"
              label="Tiêu đề tài liệu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề tài liệu"
              required
              disabled={uploading}
              size="md"
              radius="lg"
              styles={{
                label: { fontWeight: 600, fontSize: "15px", marginBottom: "6px" },
              }}
            />

            <Textarea
              id="description"
              label="Mô tả ngắn gọn"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về nội dung tài liệu..."
              rows={3}
              disabled={uploading}
              size="md"
              radius="lg"
              styles={{
                label: { fontWeight: 600, fontSize: "15px", marginBottom: "6px" },
              }}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <Select
                id="subject"
                label="Môn học"
                leftSection={<IconBook size={16} className="text-zinc-500" />}
                placeholder="Chọn môn học"
                data={subjects
                  .filter((s) => !termId || s.academicTermId === termId)
                  .map((s) => ({ value: s.id, label: s.name }))}
                value={subjectId}
                onChange={(val) => setSubjectId(val || "")}
                disabled={uploading}
                size="md"
                radius="lg"
                styles={{
                  label: { fontWeight: 600, fontSize: "15px", marginBottom: "6px" },
                }}
              />

              <Select
                id="term"
                label="Kỳ học"
                leftSection={<IconCalendar size={16} className="text-zinc-500" />}
                placeholder="Chọn kỳ học"
                data={terms.map((t) => ({ value: t.id, label: t.name }))}
                value={termId}
                onChange={(val) => setTermId(val || "")}
                disabled={uploading}
                size="md"
                radius="lg"
                styles={{
                  label: { fontWeight: 600, fontSize: "15px", marginBottom: "6px" },
                }}
              />

              <Select
                id="chapter"
                label="Chương"
                leftSection={<IconBook size={16} className="text-zinc-500" />}
                placeholder="Chọn chương"
                data={chapters.map((c) => ({ value: c.id, label: c.name }))}
                value={chapterId}
                onChange={(val) => setChapterId(val || "")}
                disabled={uploading}
                size="md"
                radius="lg"
                styles={{
                  label: { fontWeight: 600, fontSize: "15px", marginBottom: "6px" },
                }}
              />
            </div>

            <Select
              id="visibility"
              label="Quyền riêng tư"
              placeholder="Chọn quyền riêng tư"
              data={[
                { value: "private", label: "Riêng tư (chỉ mình tôi)" },
                { value: "public", label: "Công khai (tài liệu chung)" },
              ]}
              leftSection={
                visibility === "private" ? (
                  <IconLock size={16} className="text-zinc-500" />
                ) : (
                  <IconGlobe size={16} className="text-zinc-500" />
                )
              }
              value={visibility}
              onChange={(val) => setVisibility(val || "private")}
              disabled={uploading}
              size="md"
              radius="lg"
              styles={{
                label: { fontWeight: 600, fontSize: "15px", marginBottom: "6px" },
              }}
            />
          </Paper>

          <Button
            type="submit"
            size="lg"
            radius="lg"
            fullWidth
            color="dark"
            disabled={!file || uploading}
            styles={{
              root: {
                height: "56px",
                fontSize: "16px",
                fontWeight: 600,
              },
            }}
          >
            {uploading ? (
              <Group gap="xs" justify="center">
                <Loader size="sm" color="white" />
                <Text fw={600}>Đang tải lên...</Text>
              </Group>
            ) : (
              <Group gap="xs" justify="center">
                <IconUpload size={20} />
                <Text fw={600}>Tải lên tài liệu</Text>
              </Group>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
