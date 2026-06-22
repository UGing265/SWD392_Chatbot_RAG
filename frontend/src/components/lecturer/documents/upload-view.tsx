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
  IconLanguage,
  IconFileCertificate,
  IconDatabaseImport
} from "@tabler/icons-react";
import {
  Button,
  TextInput,
  Textarea,
  Select,
  Text,
  Loader,
  Group,
  ActionIcon,
} from "@mantine/core";

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
    documentTypeId,
    setDocumentTypeId,
    languageId,
    setLanguageId,
    documentSourceId,
    setDocumentSourceId,
    visibility,
    setVisibility,
    uploading,
    uploaded,
    subjects,
    terms,
    documentTypes,
    languages,
    documentSources,
    handleFileChange,
    removeFile,
    handleUpload,
  } = useUpload();

  if (uploaded) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6 bg-[#FAFAFA] font-sans">
        <div className="text-center bg-[#FFFFFF] p-12 rounded-[6px] border border-[#EAEAEA] shadow-sm animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
            <IconCircleCheck size={32} />
          </div>
          <h2 className="mb-2 text-[24px] font-serif tracking-[-0.02em] text-[#111111]">
            Tải Lên Thành Công
          </h2>
          <Text c="dimmed" size="sm" mb="xl">Tài liệu của bạn đã được đưa vào hàng đợi xử lý AI.</Text>
          <Button
            component="a"
            href="/lecturer/documents/my"
            color="dark"
            radius="sm"
            className="bg-[#111111] font-medium"
          >
            Về thư viện của tôi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FAFAFA] font-sans relative">
      <div className="container mx-auto max-w-4xl p-6 py-12">
        {/* Header */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <Text size="xs" fw={600} className="text-[#A0A0A0] tracking-[0.1em] uppercase mb-3 font-mono">
            Tài liệu giáo dục
          </Text>
          <h1 className="font-serif text-[40px] tracking-[-0.03em] text-[#111111] mb-3 select-none">
            Tải Lên.
          </h1>
          <Text c="dimmed" size="sm" className="max-w-2xl">
            Chia sẻ tài liệu giảng dạy với sinh viên của bạn. Hệ thống hỗ trợ PDF, DOC, DOCX, PPT, PPTX.
          </Text>
        </div>

        <form onSubmit={handleUpload} className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100">
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
                borderRadius: "6px",
                border: "1px dashed #EAEAEA",
                backgroundColor: file ? "#FAFAFA" : "#FFFFFF",
                transition: "all 300ms ease",
              }}
              className="hover:border-[#111111] hover:shadow-[0_8px_24px_-6px_rgba(17,17,17,0.08)] group"
            >
              {file ? (
                <div className="flex w-full items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[4px] bg-[#111111] text-white">
                    <IconFileText size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text fw={500} size="md" className="truncate text-[#111111]">
                      {file.name}
                    </Text>
                    <Text size="xs" className="text-[#A0A0A0] mt-1 font-mono">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </div>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xl"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFile();
                    }}
                    disabled={uploading}
                    className="text-[#787774] hover:text-[#111111] hover:bg-[#EAEAEA]"
                  >
                    <IconX size={20} />
                  </ActionIcon>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[4px] bg-[#FAFAFA] border border-[#EAEAEA] text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors">
                    <IconUpload size={24} />
                  </div>
                  <Text fw={500} size="md" className="mb-1 text-[#111111]">
                    Kéo và thả file vào đây
                  </Text>
                  <Text c="dimmed" size="xs">hoặc nhấp để chọn file từ máy tính</Text>
                  <Group gap="xs" mt="lg">
                    {["PDF", "DOC", "DOCX", "PPT", "PPTX"].map((ext) => (
                      <span
                        key={ext}
                        className="px-2 py-0.5 border border-[#EAEAEA] rounded-[4px] bg-[#FAFAFA] text-[10px] font-mono text-[#787774] uppercase"
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
          <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[6px] p-8 space-y-6 shadow-sm">
            <TextInput
              id="title"
              label="Tiêu đề tài liệu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề tài liệu"
              required
              disabled={uploading}
              size="md"
              radius="sm"
              styles={{
                label: { fontWeight: 500, fontSize: "14px", color: "#111111", marginBottom: "8px" },
                input: { borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111" } }
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
              radius="sm"
              styles={{
                label: { fontWeight: 500, fontSize: "14px", color: "#111111", marginBottom: "8px" },
                input: { borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111" } }
              }}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t border-[#EAEAEA]">
              <Select
                id="subject"
                label="Môn học"
                leftSection={<IconBook size={16} className="text-[#A0A0A0]" />}
                placeholder="Chọn môn học"
                data={subjects
                  .filter((s) => !termId || s.academicTermId === termId)
                  .map((s) => ({ value: s.id, label: s.name }))}
                value={subjectId}
                onChange={(val) => setSubjectId(val || "")}
                disabled={uploading}
                size="md"
                radius="sm"
                styles={{
                  label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "6px" },
                  input: { borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111" } }
                }}
              />

              <Select
                id="term"
                label="Kỳ học"
                leftSection={<IconCalendar size={16} className="text-[#A0A0A0]" />}
                placeholder="Chọn kỳ học"
                data={terms.map((t) => ({ value: t.id, label: t.name }))}
                value={termId}
                onChange={(val) => setTermId(val || "")}
                disabled={uploading}
                size="md"
                radius="sm"
                styles={{
                  label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "6px" },
                  input: { borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111" } }
                }}
              />

              <Select
                id="documentType"
                label="Loại tài liệu"
                leftSection={<IconFileCertificate size={16} className="text-[#A0A0A0]" />}
                placeholder="Chọn loại tài liệu"
                data={documentTypes.map((dt) => ({ value: dt.id, label: dt.name }))}
                value={documentTypeId}
                onChange={(val) => setDocumentTypeId(val || "")}
                disabled={uploading}
                size="md"
                radius="sm"
                styles={{
                  label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "6px" },
                  input: { borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111" } }
                }}
              />

              <Select
                id="language"
                label="Ngôn ngữ"
                leftSection={<IconLanguage size={16} className="text-[#A0A0A0]" />}
                placeholder="Chọn ngôn ngữ"
                data={languages.map((l) => ({ value: l.id, label: l.name }))}
                value={languageId}
                onChange={(val) => setLanguageId(val || "")}
                disabled={uploading}
                size="md"
                radius="sm"
                styles={{
                  label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "6px" },
                  input: { borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111" } }
                }}
              />

              <Select
                id="documentSource"
                label="Nguồn tài liệu"
                leftSection={<IconDatabaseImport size={16} className="text-[#A0A0A0]" />}
                placeholder="Chọn nguồn tài liệu"
                data={documentSources.map((ds) => ({ value: ds.id, label: ds.name }))}
                value={documentSourceId}
                onChange={(val) => setDocumentSourceId(val || "")}
                disabled={uploading}
                size="md"
                radius="sm"
                styles={{
                  label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "6px" },
                  input: { borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111" } }
                }}
              />

              <Select
                id="visibility"
                label="Quyền riêng tư"
                placeholder="Chọn quyền"
                data={[
                  { value: "private", label: "Riêng tư" },
                  { value: "school_wide", label: "Nội bộ trường" },
                  { value: "public", label: "Công khai" },
                ]}
                leftSection={
                  visibility === "private" ? (
                    <IconLock size={16} className="text-[#A0A0A0]" />
                  ) : (
                    <IconGlobe size={16} className="text-[#A0A0A0]" />
                  )
                }
                value={visibility}
                onChange={(val) => setVisibility(val || "private")}
                disabled={uploading}
                size="md"
                radius="sm"
                styles={{
                  label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "6px" },
                  input: { borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111" } }
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            radius="sm"
            fullWidth
            color="dark"
            disabled={!file || uploading}
            styles={{
              root: {
                height: "56px",
                backgroundColor: "#111111",
                "&:hover": { backgroundColor: "#222222" },
              },
              label: {
                fontWeight: 500,
                fontSize: "15px",
              }
            }}
          >
            {uploading ? (
              <Group gap="xs" justify="center">
                <Loader size="sm" color="white" />
                <span>Đang xử lý...</span>
              </Group>
            ) : (
              <Group gap="sm" justify="center">
                <IconUpload size={18} />
                <span>Tải lên tài liệu</span>
              </Group>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
