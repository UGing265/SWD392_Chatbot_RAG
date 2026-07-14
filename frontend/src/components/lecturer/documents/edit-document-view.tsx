"use client";

import { useEditDocument } from "@/hooks/lecturer/use-edit-document";
import {
  Button,
  Group,
  TextInput,
  Textarea,
  Select,
  Stack,
  Title,
  Text,
  Paper,
  Loader,
  Container,
} from "@mantine/core";
import {
  IconDeviceFloppy,
  IconArrowLeft,
} from "@tabler/icons-react";

export function EditDocumentView({ slug }: { slug: string }) {
  const {
    loading,
    saving,
    subjects,
    documentTypes,
    languages,
    documentSources,
    
    title, setTitle,
    description, setDescription,
    subjectId, setSubjectId,
        documentTypeId, setDocumentTypeId,
    languageId, setLanguageId,
    documentSourceId, setDocumentSourceId,
    visibility, setVisibility,
    
    handleSubmit,
    router,
    role,
  } = useEditDocument(slug, "lecturer");

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
        <Loader size="lg" color="dark" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50 relative font-sans w-full min-h-screen pb-12">
      <Container size="md" pt={48}>
        <Button
          variant="subtle"
          color="dark"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push(`/${role}/documents/my`)}
          mb="xl"
          radius="lg"
        >
          Quay lại Thư viện
        </Button>

        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <Text size="xs" fw={600} className="text-zinc-500 tracking-[0.15em] uppercase mb-3 font-mono text-[11px]">
            CHỈNH SỬA
          </Text>
          <h1 className="font-serif text-[40px] tracking-[-0.03em] text-zinc-900 leading-none mb-2">
            Cập Nhật Tài Liệu.
          </h1>
          <Text c="dimmed" size="sm">Thay đổi thông tin phân loại và hiển thị của tài liệu.</Text>
        </div>

        <Paper
          withBorder
          p="xl"
          radius="lg"
          className="bg-white/80 backdrop-blur-xl shadow-xl shadow-zinc-200/50 border-zinc-200 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="xl">
              <TextInput
                label="Tiêu đề tài liệu"
                placeholder="Nhập tiêu đề"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                radius="lg"
                size="md"
                styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
              />

              <Textarea
                label="Mô tả"
                placeholder="Nhập mô tả tài liệu (không bắt buộc)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                radius="lg"
                size="md"
                minRows={3}
                styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
              />

              <Group grow align="flex-start" gap="lg">
                <Select
                  label="Môn học"
                  placeholder={subjects.length === 0 ? "Chưa được phân công môn học" : "Chọn môn học"}
                  value={subjectId}
                  onChange={setSubjectId}
                  data={subjects.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
                  disabled={subjects.length === 0}
                  searchable
                  nothingFoundMessage="Không tìm thấy môn học"
                  clearable
                  radius="lg"
                  size="md"
                />

              </Group>

              <Group grow align="flex-start" gap="lg">
                <Select
                  label="Loại học liệu"
                  placeholder="Chọn loại"
                  value={documentTypeId}
                  onChange={setDocumentTypeId}
                  data={documentTypes.map(d => ({ value: d.id, label: d.name }))}
                  searchable
                  clearable
                  radius="lg"
                  size="md"
                />
                <Select
                  label="Ngôn ngữ"
                  placeholder="Chọn ngôn ngữ"
                  value={languageId}
                  onChange={setLanguageId}
                  data={languages.map(l => ({ value: l.id, label: l.name }))}
                  searchable
                  clearable
                  radius="lg"
                  size="md"
                />
              </Group>

              <Group grow align="flex-start" gap="lg">
                <Select
                  label="Nguồn tài liệu"
                  placeholder="Chọn nguồn"
                  value={documentSourceId}
                  onChange={setDocumentSourceId}
                  data={documentSources.map(s => ({ value: s.id, label: s.name }))}
                  searchable
                  clearable
                  radius="lg"
                  size="md"
                />
                <Select
                  label="Độ hiển thị"
                  placeholder="Chọn độ hiển thị"
                  value={visibility}
                  onChange={(val) => setVisibility(val || "school_wide")}
                  data={[
                    { value: "school_wide", label: "Toàn trường (School Wide)" },
                    { value: "public", label: "Công khai (Public)" },
                    { value: "private", label: "Riêng tư (Private)" },
                  ]}
                  allowDeselect={false}
                  radius="lg"
                  size="md"
                  required
                />
              </Group>

              <Group justify="flex-end" mt="md">
                <Button variant="subtle" color="gray" onClick={() => router.push(`/${role}/documents/my`)} radius="lg">
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  color="dark" 
                  loading={saving} 
                  leftSection={<IconDeviceFloppy size={18} />}
                  radius="lg"
                  className="bg-zinc-900 hover:bg-zinc-800"
                >
                  Lưu Thay Đổi
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </div>
  );
}

