"use client";

import { useState } from "react";
import {
  IconFileText,
  IconCircleCheck,
  IconX,
  IconCloudUpload,
  IconArrowRight,
  IconBooks,
  IconFileCertificate,
  IconLanguage,
  IconWorld,
  IconLock,
} from "@tabler/icons-react";
import {
  Button,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Modal,
} from "@mantine/core";

import { useUpload } from "@/hooks/lecturer/use-upload";

export interface UploadModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadModal({ opened, onClose, onSuccess }: UploadModalProps) {
  const {
    file,
    title,
    setTitle,
    description,
    setDescription,
    subjectId,
    setSubjectId,
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
    documentTypes,
    languages,
    documentSources,
    handleFileChange,
    removeFile,
    handleUpload,
    setFile,
    resetForm,
  } = useUpload({
    onSuccess: () => {
      if (onSuccess) onSuccess();
      onClose();
    }
  });

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
        alert("Định dạng file không hỗ trợ. Vui lòng tải lên PDF, DOCX, PPTX.");
      }
    }
  };

  const selectStyles = {
    input: { backgroundColor: '#F4F4F5', border: '1px solid #E4E4E7', height: '38px', minHeight: '38px', fontSize: '13px', color: '#18181B', fontWeight: 600, cursor: 'pointer' },
    section: { color: '#71717A' }
  };

  const textInputStyles = {
    input: { backgroundColor: '#F4F4F5', border: '1px solid #E4E4E7', height: '42px', fontSize: '14px', color: '#18181B', fontWeight: 600 }
  };

  const textareaStyles = {
    input: { backgroundColor: '#F4F4F5', border: '1px solid #E4E4E7', fontSize: '14px', color: '#18181B', fontWeight: 500, padding: '12px 16px' }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (!uploading) {
          resetForm();
          onClose();
        }
      }}
      size="60rem"
      radius="xl"
      padding={0}
      withCloseButton={false}
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 4,
      }}
    >
      <div className="flex flex-col relative font-sans overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-white">
          <div>
            <h2 className="text-[20px] font-bold text-zinc-900 tracking-tight">Tải lên tài liệu</h2>
            <p className="text-[13px] text-zinc-500 font-medium mt-1">
              Đóng góp tài liệu vào kho tri thức để hệ thống AI phân tích
            </p>
          </div>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            radius="xl"
            onClick={() => !uploading && onClose()}
            className="hover:bg-zinc-100 text-zinc-400"
          >
            <IconX size={20} stroke={2} />
          </ActionIcon>
        </div>

        {uploaded ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center p-16 bg-zinc-50">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <IconCircleCheck size={40} stroke={1.5} />
            </div>
            <h3 className="mb-2 text-[24px] font-bold text-zinc-900 tracking-tight">
              Tải lên thành công!
            </h3>
            <p className="text-zinc-500 font-medium text-center max-w-sm mb-0">
              Tài liệu đã được đưa vào hàng đợi xử lý AI.
            </p>
          </div>
        ) : (
          /* Form Content */
          <div className="flex flex-col max-h-[80vh] overflow-y-auto">
            <form id="upload-modal-form" onSubmit={handleUpload}>
              
              <div className="p-8">
                {/* File Upload Section */}
                <div className="mb-8">
                  <h3 className="text-[14px] font-bold tracking-tight text-zinc-900 mb-3">Tệp Đính Kèm</h3>
                  <input
                    type="file"
                    id="modal-file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  
                  {!file ? (
                    <label
                      htmlFor="modal-file"
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`
                        w-full h-[140px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2
                        transition-all cursor-pointer group
                        ${dragActive ? 'bg-zinc-100 border-zinc-400' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'}
                      `}
                    >
                      <IconCloudUpload size={28} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" stroke={1.5} />
                      <div className="text-center px-4">
                        <p className="text-[13px] font-bold text-zinc-700 mb-1">
                          Nhấn để chọn file <span className="font-medium text-zinc-500">hoặc kéo thả vào đây</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Hỗ trợ: PDF, DOCX, PPTX (Max 50MB)
                        </p>
                      </div>
                    </label>
                  ) : (
                    <div className="w-full p-4 border border-zinc-200 bg-zinc-50 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-zinc-200 text-zinc-700 flex items-center justify-center shrink-0">
                          <IconFileText size={20} stroke={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-zinc-900 truncate max-w-[300px] mb-0.5">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-3">
                            <p className="text-[11px] font-bold text-zinc-500 font-mono">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                              <IconCircleCheck size={12} /> Tải xong
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFile();
                        }}
                        className="hover:bg-red-50 rounded-full"
                      >
                        <IconX size={16} stroke={2} />
                      </ActionIcon>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Core Info */}
                  <div>
                    <h3 className="text-[14px] font-bold tracking-tight text-zinc-900 mb-4">Thông Tin Chung</h3>
                    <div className="flex flex-col gap-5">
                      <TextInput
                        id="modal-title"
                        placeholder="Tiêu đề tài liệu..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={uploading}
                        variant="filled"
                        radius="xl"
                        styles={textInputStyles}
                      />

                      <Textarea
                        id="modal-description"
                        placeholder="Mô tả chi tiết nội dung hoặc ghi chú thêm..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        disabled={uploading}
                        variant="filled"
                        radius="xl"
                        styles={textareaStyles}
                      />
                    </div>
                  </div>

                  {/* Right Column: Classification */}
                  <div>
                    <h3 className="text-[14px] font-bold tracking-tight text-zinc-900 mb-4">Phân Loại Nâng Cao</h3>
                    <div className="flex flex-col gap-4">
                      <Select
                        id="modal-subject"
                        placeholder="Môn học"
                        data={subjects.map((s) => ({ value: s.id, label: s.code || (s.name ? s.name.split(" - ")[0] : "") }))}
                        value={subjectId}
                        onChange={(val) => setSubjectId(val || "")}
                        disabled={uploading}
                        searchable
                        clearable
                        variant="filled"
                        radius="xl"
                        leftSection={<IconBooks size={16} className="text-zinc-500" stroke={1.5} />}
                        styles={selectStyles}
                      />
                      
                      <Select
                        id="modal-documentType"
                        placeholder="Học liệu"
                        data={documentTypes.map((dt) => ({ value: dt.id, label: dt.name }))}
                        value={documentTypeId}
                        onChange={(val) => setDocumentTypeId(val || "")}
                        disabled={uploading}
                        clearable
                        variant="filled"
                        radius="xl"
                        leftSection={<IconFileCertificate size={16} className="text-zinc-500" stroke={1.5} />}
                        styles={selectStyles}
                      />

                      <Select
                        id="modal-language"
                        placeholder="Ngôn ngữ"
                        data={languages.map((l) => ({ value: l.id, label: l.name }))}
                        value={languageId}
                        onChange={(val) => setLanguageId(val || "")}
                        disabled={uploading}
                        clearable
                        variant="filled"
                        radius="xl"
                        leftSection={<IconLanguage size={16} className="text-zinc-500" stroke={1.5} />}
                        styles={selectStyles}
                      />
                      
                      <Select
                        id="modal-documentSource"
                        placeholder="Nguồn gốc"
                        data={documentSources.map((ds) => ({ value: ds.id, label: ds.name }))}
                        value={documentSourceId}
                        onChange={(val) => setDocumentSourceId(val || "")}
                        disabled={uploading}
                        clearable
                        variant="filled"
                        radius="xl"
                        leftSection={<IconWorld size={16} className="text-zinc-500" stroke={1.5} />}
                        styles={selectStyles}
                      />

                      <Select
                        id="modal-visibility"
                        placeholder="Quyền truy cập"
                        data={[
                          { value: "private", label: "Riêng tư (Chỉ mình tôi)" },
                          { value: "school_wide", label: "Nội bộ trường" },
                          { value: "public", label: "Công khai" },
                        ]}
                        value={visibility}
                        onChange={(val) => setVisibility(val || "private")}
                        disabled={uploading}
                        variant="filled"
                        radius="xl"
                        leftSection={<IconLock size={16} className="text-zinc-500" stroke={1.5} />}
                        styles={selectStyles}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-8 py-5 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3 sticky bottom-0 z-10">
                <Button
                  variant="default"
                  radius="xl"
                  size="md"
                  className="font-bold border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  onClick={() => onClose()}
                  disabled={uploading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={!file || !title.trim() || uploading}
                  loading={uploading}
                  size="md"
                  radius="xl"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-colors"
                  rightSection={<IconArrowRight size={16} />}
                >
                  Xác nhận tải lên
                </Button>
              </div>

            </form>
          </div>
        )}

      </div>
    </Modal>
  );
}
