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

  const sharedInputClasses = "!bg-white focus:!bg-white !border-black/10 hover:!border-black/20 focus:!border-black/20 focus:!shadow-sm !rounded-lg transition-all duration-300 !text-[13px] !font-medium";
  const inputClasses = { 
    input: `${sharedInputClasses} !h-10 !px-4`,
    label: "!text-[10px] !font-bold !capitalize !text-zinc-500 !mb-1.5"
  };
  const selectClasses = { 
    input: `${sharedInputClasses} !h-10 !px-4`,
    label: "!text-[10px] !font-bold !capitalize !text-zinc-500 !mb-1.5",
    dropdown: "!rounded-xl !border-0 !ring-1 !ring-black/5 !shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] !p-2 !bg-white/95 !backdrop-blur-2xl",
    option: "!rounded-lg data-[hovered]:!bg-zinc-100/80 data-[selected]:!bg-zinc-100 data-[selected]:!text-zinc-900 !text-[13px] !font-semibold transition-all duration-200 !px-4 !py-2 !mb-0.5 last:!mb-0"
  };
  const textareaClasses = { 
    input: `${sharedInputClasses} !py-3 !px-4`,
    label: "!text-[10px] !font-bold !capitalize !text-zinc-500 !mb-1.5"
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
      yOffset="10vh"
      overlayProps={{
        backgroundOpacity: 0.55,
      }}
      transitionProps={{ transition: 'fade', duration: 200 }}
      classNames={{
        content: "!bg-white !transform-none",
      }}
    >
      <div className="flex flex-col relative font-sans overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white">
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
              
              <div className="p-6">
                {/* File Upload Section */}
                <div className="mb-6">
                  <h3 className="text-[14px] font-bold tracking-tight text-zinc-900 mb-2">Tệp Đính Kèm</h3>
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
                        w-full h-[90px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5
                        transition-all cursor-pointer group
                        ${dragActive ? 'bg-zinc-100 border-zinc-400' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'}
                      `}
                    >
                      <IconCloudUpload size={24} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" stroke={1.5} />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Core Info */}
                  <div>
                    <div className="flex flex-col gap-3">
                      <TextInput
                        id="modal-title"
                        label="Tiêu đề tài liệu"
                        placeholder="Nhập tiêu đề tài liệu..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={uploading}
                        classNames={inputClasses}
                      />

                      <Textarea
                        id="modal-description"
                        label="Mô tả chi tiết"
                        placeholder="Mô tả chi tiết nội dung hoặc ghi chú thêm..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        disabled={uploading}
                        classNames={textareaClasses}
                      />
                    </div>
                  </div>

                  {/* Right Column: Classification */}
                  <div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Select
                          id="modal-subject"
                          label="Môn học"
                          placeholder={subjects.length === 0 ? "Chưa được phân công môn học" : "Chọn môn học..."}
                          data={subjects.map(s => {
                            const label = s.name || s.code || "";
                            return { value: s.id, label };
                          })}
                          value={subjectId}
                          onChange={(val) => setSubjectId(val || "")}
                          disabled={uploading || subjects.length === 0}
                          searchable
                          nothingFoundMessage="Không tìm thấy môn học"
                          clearable
                          classNames={selectClasses}
                          comboboxProps={{ width: 'max-content', position: 'bottom-start' }}
                          renderOption={({ option }) => {
                            const parts = option.label.split(' - ');
                            if (parts.length >= 2) {
                              const code = parts[0];
                              const name = parts.slice(1).join(' - ');
                              return (
                                <div className="flex flex-col gap-0.5 py-0.5">
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">{code}</span>
                                  <span className="text-[13px] font-semibold whitespace-nowrap">{name}</span>
                                </div>
                              );
                            }
                            return <span className="whitespace-nowrap">{option.label}</span>;
                          }}
                        />
                      </div>
                      
                      <Select
                        id="modal-documentType"
                        label="Loại tài liệu"
                        placeholder="Chọn loại tài liệu..."
                        data={documentTypes.map((dt) => ({ value: dt.id, label: dt.name }))}
                        value={documentTypeId}
                        onChange={(val) => setDocumentTypeId(val || "")}
                        disabled={uploading}
                        clearable
                        classNames={selectClasses}
                      />

                      <Select
                        id="modal-language"
                        label="Ngôn ngữ"
                        placeholder="Chọn ngôn ngữ..."
                        data={languages.map((l) => ({ value: l.id, label: l.name }))}
                        value={languageId}
                        onChange={(val) => setLanguageId(val || "")}
                        disabled={uploading}
                        clearable
                        classNames={selectClasses}
                      />
                      
                      <Select
                        id="modal-documentSource"
                        label="Nguồn gốc"
                        placeholder="Chọn nguồn gốc..."
                        data={documentSources.map((ds) => ({ value: ds.id, label: ds.name }))}
                        value={documentSourceId}
                        onChange={(val) => setDocumentSourceId(val || "")}
                        disabled={uploading}
                        clearable
                        classNames={selectClasses}
                      />

                      <Select
                        id="modal-visibility"
                        label="Quyền truy cập"
                        placeholder="Chọn quyền truy cập..."
                        data={[
                          { value: "private", label: "Riêng tư (Chỉ mình tôi)" },
                          { value: "school_wide", label: "Nội bộ trường" },
                          { value: "public", label: "Công khai" },
                        ]}
                        value={visibility}
                        onChange={(val) => setVisibility(val || "private")}
                        disabled={uploading}
                        classNames={selectClasses}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 border-t border-zinc-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
                <Button
                  variant="default"
                  className="!h-10 !rounded-lg !text-[13px] !font-semibold !text-zinc-700 hover:!bg-zinc-50 !border-zinc-200 !shadow-sm transition-colors"
                  onClick={() => onClose()}
                  disabled={uploading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={!file || !title.trim() || uploading}
                  loading={uploading}
                  className="!h-10 !rounded-lg !text-[13px] !font-semibold !bg-zinc-900 hover:!bg-zinc-800 !text-white !shadow-sm !border-0 transition-colors"
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
