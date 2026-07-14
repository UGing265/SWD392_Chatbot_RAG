"use client";

import { useEffect, useState } from "react";
import { Button, Select, TextInput, Textarea, Loader, Stack, Group, SimpleGrid, ActionIcon, LoadingOverlay } from "@mantine/core";
import { IconCheck, IconX, IconArrowRight, IconSettings2 } from "@tabler/icons-react";
import { ragApi } from "@/api/client";
import { notify } from "@/lib/notifications";

interface InlineDocumentEditProps {
  slug: string;
  docId: string;
  subjects: { id: string; code?: string; name?: string }[];
  documentTypes: { id: string; name: string }[];
  languages: { id: string; name: string }[];
  documentSources: { id: string; name: string }[];
  onCancel: () => void;
  onSave: () => void;
}

export function InlineDocumentEdit({
  slug,
  docId,
  subjects,
  documentTypes,
  languages,
  documentSources,
  onCancel,
  onSave,
}: InlineDocumentEditProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject_id: "",
    document_type_id: "",
    language_id: "",
    visibility: "public",
    document_source_id: "",
  });

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await ragApi.get(`/documents/${slug || docId}`);
        const data = res.data;
        setFormData({
          title: data.title || "",
          description: data.description || "",
          subject_id: data.subject_id || "",
          document_type_id: data.document_type_id || "",
          language_id: data.language_id || "",
          visibility: data.visibility || "public",
          document_source_id: data.document_source_id || "",
        });
      } catch (error) {
        notify.error("Lỗi", "Không thể tải thông tin tài liệu");
        onCancel();
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [slug, docId, onCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      notify.error("Lỗi", "Tên tài liệu không được để trống");
      return;
    }
    if (!formData.subject_id) {
      notify.error("Lỗi", "Vui lòng chọn môn học");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: docId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        subject_id: formData.subject_id || null,
        document_type_id: formData.document_type_id || null,
        language_id: formData.language_id || null,
        visibility: formData.visibility,
        document_source_id: formData.document_source_id || null,
      };

      await ragApi.post(`/documents/${slug || docId}/edit`, payload);
      notify.success("Thành công", "Đã cập nhật thông tin tài liệu");
      onSave();
    } catch (error) {
      notify.error("Lỗi", "Không thể lưu thay đổi");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = {
    input: "!bg-white focus:!bg-white !border-black/10 hover:!border-black/20 focus:!border-black/20 focus:!shadow-sm !rounded-lg transition-all duration-300 !h-10 !px-4 !text-[13px] !font-medium",
    label: "!text-[10px] !font-bold !capitalize !text-zinc-500 !mb-1.5",
    dropdown: "!rounded-xl !border-0 !ring-1 !ring-black/5 !shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] !p-2 !bg-white/95 !backdrop-blur-2xl",
    option: "!rounded-lg data-[hovered]:!bg-zinc-100/80 data-[selected]:!bg-zinc-100 data-[selected]:!text-zinc-900 !text-[13px] !font-semibold transition-all duration-200 !px-4 !py-2 !mb-0.5 last:!mb-0"
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-4 sm:p-5 relative flex flex-col mx-auto w-full animate-in fade-in zoom-in-95 duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "xl", blur: 2 }} loaderProps={{ color: "gray", type: "dots" }} />
        
        {/* Header section */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div>
            <Group gap="xs" mb="sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">
                <IconSettings2 size={12} stroke={2} />
                Quản lý tài liệu
              </span>
            </Group>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
              Chỉnh sửa thông tin
            </h2>
          </div>
          <ActionIcon 
            onClick={onCancel}
            variant="subtle" 
            color="gray"
            className="!w-8 !h-8 !rounded-full hover:!bg-zinc-100 transition-colors"
          >
            <IconX size={18} stroke={1.5} />
          </ActionIcon>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">
            {/* Left Column: Main Information */}
            <div className="lg:col-span-7 space-y-4">
              <TextInput
                label="Tên tài liệu"
                placeholder="Nhập tên tài liệu..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                classNames={inputClasses}
              />
              <Select
                label="Môn học"
                placeholder={subjects.length === 0 ? "Chưa được phân công môn học" : "Chọn môn học"}
                data={subjects.map(s => {
                  const label = s.name || s.code || "";
                  return { value: s.id, label };
                })}
                value={formData.subject_id}
                onChange={(val) => setFormData({ ...formData, subject_id: val || "" })}
                required
                disabled={subjects.length === 0}
                searchable
                nothingFoundMessage="Không tìm thấy môn học"
                classNames={inputClasses}
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
              <Textarea
                label="Mô tả"
                placeholder="Nhập mô tả chi tiết về tài liệu..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                minRows={3}
                autosize
                classNames={{
                  ...inputClasses,
                  input: "!bg-white focus:!bg-white !border-black/10 hover:!border-black/20 focus:!border-black/20 focus:!shadow-sm !rounded-lg transition-all duration-300 !py-3 !px-4 !text-[13px] !font-medium",
                }}
              />
            </div>

            {/* Right Column: Metadata (The Split Panel) */}
            <div className="lg:col-span-5 bg-zinc-50/50 p-4 sm:p-5 rounded-2xl border border-black/5 space-y-4">
              <Select
                label="Phân quyền"
                data={[
                  { value: "public", label: "Công khai" },
                  { value: "school_wide", label: "Nội bộ trường" },
                  { value: "private", label: "Riêng tư" },
                ]}
                value={formData.visibility}
                onChange={(val) => setFormData({ ...formData, visibility: val || "public" })}
                classNames={inputClasses}
              />
              
              <Select
                label="Loại tài liệu"
                placeholder="Chọn loại"
                data={documentTypes.map(t => ({ value: t.id, label: t.name }))}
                value={formData.document_type_id}
                onChange={(val) => setFormData({ ...formData, document_type_id: val || "" })}
                searchable
                clearable
                classNames={inputClasses}
              />
              <Select
                label="Ngôn ngữ"
                placeholder="Chọn ngôn ngữ"
                data={languages.map(l => ({ value: l.id, label: l.name }))}
                value={formData.language_id}
                onChange={(val) => setFormData({ ...formData, language_id: val || "" })}
                searchable
                clearable
                classNames={inputClasses}
              />

              <Select
                label="Nguồn gốc"
                placeholder="Chọn nguồn"
                data={documentSources.map(s => ({ value: s.id, label: s.name }))}
                value={formData.document_source_id}
                onChange={(val) => setFormData({ ...formData, document_source_id: val || "" })}
                searchable
                clearable
                classNames={inputClasses}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <Group justify="flex-end" mt={24} className="pt-5 border-t border-black/5">
            <Button 
              variant="default" 
              onClick={onCancel} 
              disabled={saving}
              className="!h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !text-zinc-700 hover:!bg-zinc-50 !border-zinc-200 !shadow-sm transition-colors"
            >
              Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              loading={saving}
              className="!h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !bg-zinc-900 hover:!bg-zinc-800 !text-white !shadow-sm !border-0 transition-colors"
            >
              Lưu thay đổi
            </Button>
          </Group>
        </form>
    </div>
  );
}
