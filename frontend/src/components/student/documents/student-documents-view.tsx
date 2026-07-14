"use client";

import {
  IconGridPattern,
  IconList,
  IconFileText,
  IconBrain,
  IconDownload,
  IconEye,
  IconFolder,
} from "@tabler/icons-react";
import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Paper,
  ActionIcon,
  Table,
} from "@mantine/core";
import { useStudentDocuments } from "@/hooks/student/use-documents";
import { cn } from "@/lib/utils";

export function StudentDocumentsView() {
  const {
    activeSubject,
    setActiveSubject,
    viewMode,
    setViewMode,
    selectedDoc,
    setSelectedDoc,
    subjects,
    documents,
  } = useStudentDocuments();

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <IconFolder size={20} className="text-zinc-900" stroke={1.5} />
            <h1 className="font-bold text-zinc-900 tracking-tight text-lg">Kho Học Liệu</h1>
          </div>
          
          <div
            className="flex items-center gap-2 overflow-x-auto py-1 w-full min-w-0 sm:w-auto sm:justify-end"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-full p-1 shadow-sm transition-all">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase transition-all duration-300 font-mono",
                  viewMode === "grid" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/80" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                <IconGridPattern size={14} stroke={2} />
                Lưới
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase transition-all duration-300 font-mono",
                  viewMode === "list" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/80" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                <IconList size={14} stroke={2} />
                Danh sách
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">

        {/* Filter Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100">
          <div className="flex flex-wrap gap-3">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={cn(
                  "px-5 py-2.5 rounded-[12px] border text-[13px] font-bold uppercase tracking-wider transition-all duration-300 font-mono",
                  activeSubject === sub 
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-[0_4px_14px_rgba(0,0,0,0.1)]" 
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
                )}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Document Grid */}
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200">
          {viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents.map((doc) => {
                const Icon = doc.icon;
                return (
                  <div
                    key={doc.id}
                    className="flex flex-col bg-white border border-zinc-200 rounded-[24px] overflow-hidden hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group p-6"
                  >
                    <div className="flex-grow">
                      {/* Top Action & Icon */}
                      <div className="mb-6 flex justify-between items-start">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 border border-zinc-200">
                          <Icon size={20} stroke={1.5} />
                        </div>
                        <div className="flex gap-2">
                          <ActionIcon
                            variant="subtle"
                            color="dark"
                            radius="full"
                            onClick={() => setSelectedDoc(doc)}
                            className="bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200 transition-colors"
                          >
                            <IconEye size={16} stroke={1.5} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="dark"
                            radius="full"
                            className="bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200 transition-colors"
                          >
                            <IconDownload size={16} stroke={1.5} />
                          </ActionIcon>
                        </div>
                      </div>

                      <h4 className="text-[18px] font-bold text-zinc-900 mb-3 leading-snug line-clamp-2 group-hover:underline underline-offset-2 decoration-zinc-300 font-serif">
                        {doc.title}
                      </h4>
                      <Text size="sm" className="text-zinc-500 line-clamp-3 leading-relaxed mb-6">
                        {doc.desc}
                      </Text>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-5 mt-auto border-t border-zinc-100/80 flex justify-between items-center">
                      <div>
                        <span className="block text-[9px] font-sans font-bold tracking-widest text-zinc-400 mb-1 uppercase">Định dạng</span>
                        <Badge variant="light" className="bg-zinc-100 text-zinc-700 font-mono tracking-widest text-[10px] uppercase rounded-full">
                          {doc.type} • {doc.size}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] font-sans font-bold tracking-widest text-zinc-400 mb-1 uppercase">Ngày thêm</span>
                        <div className="text-[12px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none">
                          {doc.dateAdded}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Paper withBorder radius="2xl" className="overflow-hidden bg-white border-zinc-200 shadow-sm">
              <Table.ScrollContainer minWidth={600}>
                <Table highlightOnHover verticalSpacing="lg" className="text-zinc-900">
                  <Table.Thead className="bg-zinc-50 border-b border-zinc-200">
                    <Table.Tr>
                      <Table.Th className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase px-6 py-4">Tên tài liệu</Table.Th>
                      <Table.Th className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase px-6 py-4">Ngày thêm</Table.Th>
                      <Table.Th className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase px-6 py-4">Định dạng</Table.Th>
                      <Table.Th style={{ textAlign: "right" }} className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase px-6 py-4">Hành động</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {documents.map((doc) => {
                      const Icon = doc.icon;
                      return (
                        <Table.Tr key={doc.id} className="group border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                          <Table.Td className="px-6">
                            <Group gap="md">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200">
                                <Icon size={18} stroke={1.5} />
                              </div>
                              <div>
                                <Text className="font-serif font-bold text-zinc-900 text-[16px] group-hover:underline underline-offset-2 decoration-zinc-300">
                                  {doc.title}
                                </Text>
                                <Text size="xs" className="text-zinc-500 line-clamp-1">{doc.desc}</Text>
                              </div>
                            </Group>
                          </Table.Td>
                          <Table.Td className="px-6 font-mono text-[13px] font-bold text-zinc-900 uppercase tracking-wider">{doc.dateAdded}</Table.Td>
                          <Table.Td className="px-6">
                            <Badge variant="light" className="bg-zinc-100 text-zinc-700 font-mono tracking-widest text-[10px] uppercase rounded-full border border-zinc-200">
                              {doc.type} • {doc.size}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: "right" }} className="px-6">
                            <Group gap={8} justify="flex-end" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ActionIcon
                                variant="subtle"
                                color="dark"
                                radius="full"
                                onClick={() => setSelectedDoc(doc)}
                                title="Xem tài liệu"
                                className="bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 transition-colors shadow-sm"
                              >
                                <IconEye size={16} stroke={1.5} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="dark"
                                radius="full"
                                title="Tải xuống"
                                className="bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 transition-colors shadow-sm"
                              >
                                <IconDownload size={16} stroke={1.5} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
          )}
        </div>
      </div>

      {/* Document View Modal */}
      <Modal
        opened={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={
          <Text className="font-serif font-bold text-[24px] text-zinc-900 tracking-tight">
            {selectedDoc?.title}
          </Text>
        }
        size="lg"
        radius="2xl"
        styles={{
          content: { backgroundColor: '#ffffff', border: '1px solid #EAEAEA', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' },
          header: { backgroundColor: '#ffffff', padding: '24px 24px 16px', borderBottom: '1px solid #FAFAFA' },
          body: { padding: '24px' }
        }}
        overlayProps={{ backgroundOpacity: 0.2, blur: 4 }}
      >
        <Stack gap="xl">
          <Text size="sm" className="text-zinc-600 leading-relaxed font-sans">
            {selectedDoc?.desc}
          </Text>
          <div className="flex flex-col items-center justify-center py-16 bg-zinc-50 border border-zinc-200 border-dashed rounded-[24px]">
            <div className="w-16 h-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-300 mb-6 shadow-sm">
              <IconFileText size={32} stroke={1.5} />
            </div>
            <Text className="font-bold text-zinc-900 text-center text-[16px] mb-2 font-sans">
              Nội dung tài liệu sẽ hiển thị ở đây
            </Text>
            <Text size="sm" className="text-zinc-500 text-center font-medium max-w-sm">
              Tính năng xem file PDF/DOCX trực tiếp đang được phát triển.
            </Text>
          </div>
        </Stack>
      </Modal>
    </div>
  );
}
