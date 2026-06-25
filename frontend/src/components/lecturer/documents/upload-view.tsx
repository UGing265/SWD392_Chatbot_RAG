"use client";

import { useState } from "react";
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
    setFile,
  } = useUpload();

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const allowedExtensions = ["pdf", "doc", "docx", "ppt", "pptx"];
      const ext = droppedFile.name.split(".").pop()?.toLowerCase() || "";
      if (allowedExtensions.includes(ext)) {
        setFile(droppedFile);
        if (!title) {
          setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        alert("Định dạng file không hỗ trợ. Vui lòng tải lên PDF, DOC, DOCX, PPT, hoặc PPTX.");
      }
    }
  };

  if (uploaded) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6 bg-[#FAFAFA] font-sans">
        <div className="text-center bg-[#FFFFFF] p-12 rounded-xl border border-[#EAEAEA] shadow-sm animate-in fade-in slide-in-from-bottom-12 duration-1000">
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
            radius="lg"
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
      <div className="container mx-auto max-w-6xl p-6 py-12">
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

        <form onSubmit={handleUpload} className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100">
          {/* Side-by-Side Grid */}
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            {/* Left: File Upload Area */}
            <div className="flex flex-col h-full">
              <input
                type="file"
                id="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <style>{`
                @keyframes dash-animation {
                  to {
                    stroke-dashoffset: -28;
                  }
                }
                .animate-dash {
                  stroke-dashoffset: 0;
                  animation: dash-animation 0.8s linear infinite;
                }
              `}</style>
              <label
                htmlFor="file"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: uploading ? "not-allowed" : "pointer",
                  padding: "40px 20px",
                  borderRadius: "12px",
                  border: dragActive ? "1px solid transparent" : "1px dashed #EAEAEA",
                  backgroundColor: dragActive ? "#F8FAFC" : (file ? "#FAFAFA" : "#FFFFFF"),
                  transition: "all 300ms ease",
                  height: "100%",
                  minHeight: "180px",
                  position: "relative",
                }}
                className="hover:border-[#111111] hover:shadow-[0_8px_24px_-6px_rgba(17,17,17,0.08)] group"
              >
                {dragActive && (
                  <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
                    <svg width="100%" height="100%" className="absolute inset-0">
                      <rect
                        width="100%"
                        height="100%"
                        fill="none"
                        rx="12"
                        ry="12"
                        stroke="#111111"
                        strokeWidth="2"
                        strokeDasharray="8 6"
                        className="animate-dash"
                      />
                    </svg>
                  </div>
                )}
                {dragActive ? (
                  <div className="flex flex-col items-center justify-center text-center gap-3 pointer-events-none animate-pulse">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#111111] text-white shadow-sm">
                      <IconUpload size={28} className="animate-bounce" />
                    </div>
                    <Text fw={600} size="md" className="text-[#111111]">
                      Thả để chọn tài liệu này
                    </Text>
                    <Text c="dimmed" size="xs">PDF, DOC, DOCX, PPT, PPTX</Text>
                  </div>
                ) : file ? (
                  <div className="flex w-full flex-col items-center justify-center text-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#111111] text-white shadow-sm">
                      <IconFileText size={28} />
                    </div>
                    <div className="min-w-0 max-w-full px-4">
                      <Text fw={600} size="md" className="truncate text-[#111111]">
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
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#FAFAFA] border border-[#EAEAEA] text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors">
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
                          className="px-2 py-0.5 border border-[#EAEAEA] rounded-md bg-[#FAFAFA] text-[10px] font-mono text-[#787774] uppercase"
                        >
                          {ext}
                        </span>
                      ))}
                    </Group>
                  </>
                )}
              </label>
            </div>

            {/* Right: Dropdown Classifications */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-xl p-5 shadow-sm flex flex-col justify-center">
              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <Select
                  id="subject"
                  label="Môn học"
                  leftSection={<IconBook size={16} className="text-[#A0A0A0]" />}
                  placeholder="Chọn môn học"
                  data={subjects
                    .map((s) => ({ value: s.id, label: s.code || (s.name ? s.name.split(" - ")[0] : "") }))}
                  value={subjectId}
                  onChange={(val) => setSubjectId(val || "")}
                  disabled={uploading}
                  size="md"
                  radius="lg"
                  searchable
                  clearable
                  nothingFoundMessage="Không tìm thấy môn học"
                  maxDropdownHeight={250}
                  comboboxProps={{ transitionProps: { transition: "scale-y", duration: 150 } }}
                  styles={{
                    label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "4px" },
                    input: { backgroundColor: "#FAFAFA", borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111", backgroundColor: "#FFFFFF" } }
                  }}
                  classNames={{
                    dropdown: "rounded-xl p-1 border-[#EAEAEA]",
                    option: "px-3 py-2 text-sm rounded-lg transition-colors duration-100 hover:bg-[#F1F5F9] hover:text-[#111111] data-[hovered]:bg-[#F1F5F9] data-[hovered]:text-[#111111] data-[selected]:bg-[#EAEAEA] data-[selected]:text-[#111111] data-[selected]:font-semibold"
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
                  radius="lg"
                  maxDropdownHeight={250}
                  comboboxProps={{ transitionProps: { transition: "scale-y", duration: 150 } }}
                  classNames={{
                    dropdown: "rounded-xl p-1 border-[#EAEAEA]",
                    option: "px-3 py-2 text-[13px] rounded-lg transition-colors duration-100 hover:bg-[#F1F5F9] hover:text-[#111111] data-[hovered]:bg-[#F1F5F9] data-[hovered]:text-[#111111] data-[selected]:bg-[#EAEAEA] data-[selected]:text-[#111111] data-[selected]:font-semibold"
                  }}
                  styles={{
                    label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "4px" },
                    input: { backgroundColor: "#FAFAFA", borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111", backgroundColor: "#FFFFFF" } }
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
                  radius="lg"
                  maxDropdownHeight={250}
                  comboboxProps={{ transitionProps: { transition: "scale-y", duration: 150 } }}
                  classNames={{
                    dropdown: "rounded-xl p-1 border-[#EAEAEA]",
                    option: "px-3 py-2 text-[13px] rounded-lg transition-colors duration-100 hover:bg-[#F1F5F9] hover:text-[#111111] data-[hovered]:bg-[#F1F5F9] data-[hovered]:text-[#111111] data-[selected]:bg-[#EAEAEA] data-[selected]:text-[#111111] data-[selected]:font-semibold"
                  }}
                  styles={{
                    label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "4px" },
                    input: { backgroundColor: "#FAFAFA", borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111", backgroundColor: "#FFFFFF" } }
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
                  radius="lg"
                  maxDropdownHeight={250}
                  comboboxProps={{ transitionProps: { transition: "scale-y", duration: 150 } }}
                  classNames={{
                    dropdown: "rounded-xl p-1 border-[#EAEAEA]",
                    option: "px-3 py-2 text-[13px] rounded-lg transition-colors duration-100 hover:bg-[#F1F5F9] hover:text-[#111111] data-[hovered]:bg-[#F1F5F9] data-[hovered]:text-[#111111] data-[selected]:bg-[#EAEAEA] data-[selected]:text-[#111111] data-[selected]:font-semibold"
                  }}
                  styles={{
                    label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "4px" },
                    input: { backgroundColor: "#FAFAFA", borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111", backgroundColor: "#FFFFFF" } }
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
                  radius="lg"
                  maxDropdownHeight={250}
                  comboboxProps={{ transitionProps: { transition: "scale-y", duration: 150 } }}
                  classNames={{
                    dropdown: "rounded-xl p-1 border-[#EAEAEA]",
                    option: "px-3 py-2 text-[13px] rounded-lg transition-colors duration-100 hover:bg-[#F1F5F9] hover:text-[#111111] data-[hovered]:bg-[#F1F5F9] data-[hovered]:text-[#111111] data-[selected]:bg-[#EAEAEA] data-[selected]:text-[#111111] data-[selected]:font-semibold"
                  }}
                  styles={{
                    label: { fontWeight: 500, fontSize: "13px", color: "#111111", marginBottom: "4px" },
                    input: { backgroundColor: "#FAFAFA", borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111", backgroundColor: "#FFFFFF" } }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Card: Title & Description */}
          <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-xl p-5 space-y-4 shadow-sm">
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
                label: { fontWeight: 500, fontSize: "14px", color: "#111111", marginBottom: "4px" },
                input: { backgroundColor: "#FAFAFA", borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111", backgroundColor: "#FFFFFF" } }
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
                label: { fontWeight: 500, fontSize: "14px", color: "#111111", marginBottom: "4px" },
                input: { backgroundColor: "#FAFAFA", borderColor: "#EAEAEA", "&:focus": { borderColor: "#111111", backgroundColor: "#FFFFFF" } }
              }}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            radius="lg"
            fullWidth
            color="dark"
            disabled={!file || uploading}
            styles={{
              root: {
                height: "48px",
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
