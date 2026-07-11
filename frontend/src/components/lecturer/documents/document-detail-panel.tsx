"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ragApi } from "@/api/client";
import {
  IconFileText,
  IconBooks,
  IconClock,
  IconEye,
  IconLock,
  IconDatabase,
  IconLanguage,
  IconWorld,
  IconExternalLink,
  IconEdit,
  IconTrash,
  IconSparkles,
  IconCircleCheck,
  IconListDetails,
} from "@tabler/icons-react";
import { ActionIcon, Badge, Loader, Text, Button, Select, Accordion, Pagination, Group } from "@mantine/core";
import { notify } from "@/lib/notifications";

export function DocumentDetailPanel({ documentId, role }: { documentId: string, role: string }) {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Chapter pagination state
  const [chapterPage, setChapterPage] = useState(1);
  const chaptersPerPage = 4;

  useEffect(() => {
    if (!documentId) return;
    setLoading(true);
    ragApi.get(`/documents/${documentId}`)
      .then(res => {
        setDoc(res.data);
        setChapterPage(1); // Reset page on new doc
      })
      .catch(err => console.error("Error fetching document details", err))
      .finally(() => setLoading(false));
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white border border-zinc-200 rounded-2xl animate-in fade-in">
        <Loader color="dark" size="md" />
        <p className="mt-4 text-[14px] text-zinc-500 font-medium">Đang tải dữ liệu AI...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20 bg-white border border-zinc-200 rounded-2xl shadow-sm animate-in fade-in">
        <IconFileText size={48} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
        <h3 className="text-[18px] font-bold text-zinc-900 mb-2">Chưa chọn tài liệu</h3>
        <p className="text-zinc-500 max-w-sm mx-auto">
          Vui lòng chọn một tài liệu ở tab Overview để xem chi tiết.
        </p>
      </div>
    );
  }

  const getVisibilityLabel = (vis: string) => {
    if (vis === "private") return "Riêng tư";
    if (vis === "school_wide") return "Nội bộ";
    return "Công khai";
  };

  const getVisibilityColor = (vis: string) => {
    switch (vis) {
      case "public": return "green";
      case "school_wide": return "blue";
      default: return "red";
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge 
              color={getVisibilityColor(doc.visibility)} 
              variant="light" 
              size="sm" 
              radius="sm"
            >
              {doc.visibility === "public" ? "Công khai" : doc.visibility === "school_wide" ? "Nội bộ" : "Riêng tư"}
            </Badge>
            <Text size="xs" className="font-mono text-zinc-500 tracking-widest uppercase">
              {doc.document_type_id ? "Tài Liệu Học Tập" : "Tài liệu"}
            </Text>
          </div>
          <h2 className="text-[24px] font-bold text-zinc-900 leading-tight mb-0">
            {doc.title}
          </h2>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button 
            component={Link} 
            href={`/${role}/documents/${doc.slug || doc.id}`} 
            variant="default" 
            size="sm" 
            radius="md" 
            className="border-zinc-200"
            leftSection={<IconExternalLink size={16} />}
          >
            Mở toàn màn hình
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Col: Metadata */}
        <div className="lg:col-span-4 border-r border-zinc-100 bg-zinc-50/30 p-8">
          <h3 className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase font-mono mb-6">
            Thuộc tính
          </h3>
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <IconBooks size={18} className="text-zinc-400 mt-0.5 shrink-0" stroke={1.5} />
              <div>
                <p className="text-[12px] font-bold text-zinc-900 mb-0.5">Môn học</p>
                <p className="text-[13px] text-zinc-600">{doc.subject_name || "N/A"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <IconLanguage size={18} className="text-zinc-400 mt-0.5 shrink-0" stroke={1.5} />
              <div>
                <p className="text-[12px] font-bold text-zinc-900 mb-0.5">Ngôn ngữ</p>
                <p className="text-[13px] text-zinc-600">Tiếng Việt</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconWorld size={18} className="text-zinc-400 mt-0.5 shrink-0" stroke={1.5} />
              <div>
                <p className="text-[12px] font-bold text-zinc-900 mb-0.5">Nguồn gốc</p>
                <p className="text-[13px] text-zinc-600">Tài liệu nội bộ</p>
              </div>
            </div>

            <div className="w-full h-[1px] bg-zinc-200 my-2" />

            <div className="flex items-start gap-3">
              <IconDatabase size={18} className="text-zinc-400 mt-0.5 shrink-0" stroke={1.5} />
              <div>
                <p className="text-[12px] font-bold text-zinc-900 mb-0.5">Tệp gốc</p>
                <p className="text-[13px] text-zinc-600 font-mono bg-zinc-100 px-2 py-0.5 rounded inline-block mt-1">
                  {doc.resource?.split("/").pop() || "unknown.pdf"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconClock size={18} className="text-zinc-400 mt-0.5 shrink-0" stroke={1.5} />
              <div>
                <p className="text-[12px] font-bold text-zinc-900 mb-0.5">Ngày cập nhật</p>
                <p className="text-[13px] font-mono text-zinc-600">
                  {new Date(doc.updated_at || doc.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconEye size={18} className="text-zinc-400 mt-0.5 shrink-0" stroke={1.5} />
              <div>
                <p className="text-[12px] font-bold text-zinc-900 mb-0.5">Lượt truy cập</p>
                <p className="text-[13px] font-mono text-zinc-600">
                  {doc.view_count || 0} lượt
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Preview */}
        <div className="lg:col-span-8 p-8 flex flex-col h-full bg-white">
          <div className="flex items-center gap-2 mb-6">
            <IconSparkles size={18} className="text-emerald-500" />
            <h3 className="text-[14px] font-bold tracking-tight text-zinc-900 mb-0">
              AI Analysis & Preview
            </h3>
          </div>

          <div className="flex-grow bg-white border border-zinc-200 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-[100px] pointer-events-none" />

            {/* Simulated Chunks Stats */}
            <div>
              <h4 className="text-[12px] font-bold tracking-widest text-zinc-400 uppercase font-mono mb-4">
                Trạng thái lập chỉ mục (Vector DB)
              </h4>
              <div className="flex gap-4">
                <div className="bg-white border border-zinc-200 px-4 py-3 rounded-lg flex-1">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase">Trạng thái</p>
                  <p className="text-[14px] font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                    <IconCircleCheck size={16} /> Đã sẵn sàng
                  </p>
                </div>
                <div className="bg-white border border-zinc-200 px-4 py-3 rounded-lg flex-1">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase">Định dạng</p>
                  <p className="text-[14px] font-bold text-zinc-900 mt-1 uppercase">
                    {doc.resource?.split(".").pop() || "PDF"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Chapters / Sơ lược các chương */}
            {doc.chapters && doc.chapters.length > 0 && (
              <div className="mt-8 pt-6 border-t border-zinc-200">
                <div className="flex items-center gap-2 mb-4">
                  <IconListDetails size={18} className="text-zinc-400" />
                  <h4 className="text-[12px] font-bold tracking-widest text-zinc-400 uppercase font-mono mb-0">
                    Sơ lược các chương
                  </h4>
                </div>
                
                <div className="min-h-[260px]">
                  <Accordion variant="separated" radius="md" classNames={{
                    item: "!bg-white border-zinc-200 mb-2 shadow-sm",
                    control: "hover:bg-zinc-50/50 py-3",
                    label: "text-[14px] font-bold text-zinc-800",
                    content: "text-[13.5px] text-zinc-600 leading-relaxed font-serif pb-4 pt-1"
                  }}>
                    {doc.chapters.slice((chapterPage - 1) * chaptersPerPage, chapterPage * chaptersPerPage).map((chapter: any) => (
                      <Accordion.Item key={chapter.id} value={chapter.id}>
                        <Accordion.Control>
                          <div className="flex items-center justify-between gap-4">
                            <span className="line-clamp-1">{chapter.title}</span>
                            {(chapter.start_page || chapter.end_page) && (
                              <Badge variant="light" color="gray" size="sm" radius="sm" className="shrink-0">
                                Trang {chapter.start_page} {chapter.end_page && chapter.end_page !== chapter.start_page ? `- ${chapter.end_page}` : ''}
                              </Badge>
                            )}
                          </div>
                        </Accordion.Control>
                        <Accordion.Panel>
                          {chapter.summary || "Chưa có nội dung tóm tắt cho chương này."}
                        </Accordion.Panel>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </div>
                
                {doc.chapters.length > chaptersPerPage && (
                  <Group justify="center" mt={16}>
                    <Pagination
                      value={chapterPage}
                      onChange={setChapterPage}
                      total={Math.ceil(doc.chapters.length / chaptersPerPage)}
                      size="sm"
                      radius="md"
                      color="dark"
                      withEdges
                    />
                  </Group>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

