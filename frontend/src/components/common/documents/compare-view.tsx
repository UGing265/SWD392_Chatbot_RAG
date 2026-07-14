"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  IconGitCompare, 
  IconSearch, 
  IconCheck, 
  IconFile, 
  IconSquareCheck,
  IconBook,
  IconDownload,
  IconLibrary,
  IconBooks,
  IconArrowLeft,
  IconX,
  IconListSearch
} from "@tabler/icons-react";
import { Button, TextInput, Text, Pill, Group, Select, Modal } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { documentApi } from "@/api/document";
import { ragApi } from "@/api/client";
import { notify } from "@/lib/notifications";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocumentListItem {
  id: string;
  slug: string;
  title: string;
  subject_id?: string | null;
  preview_text?: string;
  description?: string | null;
  subject_name?: string | null;
  subject_code?: string | null;
  owner_email?: string | null;
  document_type_name?: string | null;
  visibility: string;
  status?: string;
  view_count?: number;
  created_at: string;
  updated_at: string;
}

interface CompareViewProps {
  role?: string;
}

export function CompareView({ role = "student" }: CompareViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [subjects, setSubjects] = useState<{id: string, code: string, name: string}[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  const [selectedDocs, setSelectedDocs] = useState<DocumentListItem[]>([]);
  const [comparing, setComparing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [compareResult, setCompareResult] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [debouncedSearch, subjectId]);

  useEffect(() => {
    // Clear selection when subject changes to prevent mixed-subject comparisons
    setSelectedDocs([]);
  }, [subjectId]);

  const fetchSubjects = async () => {
    try {
      const res = await ragApi.get("/documents/lookups");
      setSubjects(res.data?.subjects || []);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await ragApi.get("/documents", { 
        params: { 
          pageSize: 50, 
          q: debouncedSearch,
          subjectId: subjectId || undefined
        }
      });
      setDocuments(res.data?.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleSelectDoc = (doc: DocumentListItem) => {
    if (!subjectId) {
      notify.warning("Yêu cầu chọn môn học", "Vui lòng chọn môn học ở thanh tìm kiếm phía trên trước khi chọn tài liệu.");
      return;
    }

    if (selectedDocs.some(d => d.id === doc.id)) {
      setSelectedDocs(selectedDocs.filter(d => d.id !== doc.id));
    } else {
      if (selectedDocs.length > 0) {
        const firstDocSubjectId = selectedDocs[0].subject_id;
        if (doc.subject_id !== firstDocSubjectId) {
          notify.warning("Khác môn học", "Chỉ có thể so sánh các tài liệu thuộc cùng một môn học.");
          return;
        }
      }

      if (selectedDocs.length >= 5) {
        notify.warning("Giới hạn so sánh", "Bạn chỉ có thể so sánh tối đa 5 tài liệu cùng lúc.");
        return;
      }
      setSelectedDocs([...selectedDocs, doc]);
    }
  };

  const handleRemoveDoc = (id: string) => {
    setSelectedDocs(selectedDocs.filter(d => d.id !== id));
  };

  const handleCompare = async () => {
    if (selectedDocs.length < 2 || selectedDocs.length > 5) return;
    
    setComparing(true);
    setCompareResult(null);
    try {
      const docIds = selectedDocs.map(d => d.id);
      const res = await documentApi.compareDocuments(docIds, "");
      console.log("=== RAW COMPARE RESULT ===", JSON.stringify(res.markdown));
      setCompareResult(res.markdown || "Không có kết quả trả về.");
      notify.success("Hoàn tất", "Đã phân tích xong sự khác biệt giữa các tài liệu.");
    } catch (error: any) {
      console.error("Compare error", error);
      notify.error("Lỗi so sánh", error.response?.data?.error || "Không thể phân tích tài liệu lúc này.");
    } finally {
      setComparing(false);
    }
  };

  const handleExportPdf = async () => {
    if (selectedDocs.length < 2) return;
    setExporting(true);
    try {
      const docIds = selectedDocs.map(d => d.id);
      const blob = await documentApi.exportCompareDocuments(docIds, "");
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bang_So_Sanh_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      notify.success("Hoàn tất", "Đã tải xuống file PDF thành công.");
    } catch (error: any) {
      console.error("Export error", error);
      notify.error("Lỗi xuất PDF", error.response?.data?.error || "Không thể tạo file PDF lúc này.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <IconGitCompare size={20} className="text-zinc-900" stroke={1.5} />
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">So Sánh Tài Liệu</h1>
          </div>
        </div>
      </div>

      {/* Top Search Bar & Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex flex-col">
        {!subjectId ? (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200">
            <div className="flex justify-between items-end mb-6 pb-4 border-b border-zinc-200">
              <h4 className="text-[18px] font-bold tracking-tight text-zinc-900 m-0 flex items-center gap-2">
                <IconLibrary size={22} className="text-zinc-700" />
                Chọn Môn Học Để So Sánh
              </h4>
              <Text size="xs" className="font-semibold text-zinc-400 capitalize tracking-wide font-sans">
                Tổng số: <span className="text-zinc-900 font-bold ml-1">{subjects.length}</span>
              </Text>
            </div>

            {subjects.length === 0 ? (
              <div className="text-center py-24 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <IconBooks size={40} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
                <h5 className="text-[15px] font-medium text-zinc-900 mb-2">Đang tải danh sách môn học...</h5>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-24">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSubjectId(subject.id)}
                    className="group flex flex-col p-6 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-800 hover:shadow-md transition-all duration-300 text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-100/80 to-transparent rounded-bl-[100px] -z-0 opacity-50 group-hover:from-zinc-200 transition-colors" />

                    <div className="relative z-10 flex flex-col h-full w-full">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 border border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                          <IconBooks size={20} stroke={1.5} />
                        </div>
                        <span className="inline-flex items-center gap-1.5 font-bold text-zinc-600 text-xs bg-zinc-100 px-2.5 py-1 rounded-md whitespace-nowrap group-hover:bg-zinc-200 transition-colors">
                          {subject.code}
                        </span>
                      </div>
                      
                      <div className="mt-auto">
                        <h3 className="text-base font-bold text-zinc-900 leading-tight mb-2 group-hover:text-zinc-800 transition-colors">
                          {subject.name}
                        </h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4 flex flex-col xl:flex-row xl:items-center gap-4 justify-between animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out border-b border-zinc-100 pb-3">
            <div className="flex flex-col sm:flex-row w-full xl:max-w-2xl gap-3">
              <Button
                variant="default"
                onClick={() => setSubjectId(null)}
                leftSection={<IconArrowLeft size={16} />}
                className="!border-zinc-200 hover:!bg-zinc-100 !text-zinc-700 !font-semibold !rounded-xl !h-10 shrink-0"
              >
                Đổi môn
              </Button>

              <TextInput
                placeholder={`Tìm tài liệu trong ${subjects.find(s => s.id === subjectId)?.code}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<IconSearch size={16} stroke={1.5} className="text-zinc-400" />}
                classNames={{
                  input: "!bg-white !border-zinc-200 hover:!border-zinc-300 focus:!border-zinc-400 !rounded-xl !h-10 !text-[13px] !font-sans !font-medium !text-zinc-800 !shadow-sm !transition-all",
                }}
                className="w-full sm:max-w-md"
              />
            </div>
            <div className="flex items-center gap-3">
               <Text size="sm" c="dimmed" className="font-semibold text-zinc-400 capitalize tracking-wide font-sans text-xs hidden sm:block">
                 Chọn 2-5 tài liệu để bắt đầu
               </Text>
            </div>
          </div>
        )}

        {/* Results Modal */}
        <Modal 
          opened={!!compareResult} 
          onClose={() => setCompareResult(null)}
          size="90%"
          centered
          title={
            <div className="flex items-center gap-2">
              <IconCheck size={20} className="text-emerald-500" />
              <span className="font-bold text-zinc-800 text-lg">Bảng Phân Tích So Sánh</span>
            </div>
          }
          classNames={{
            header: "!px-6 !py-5 !border-b !border-zinc-200",
            body: "!p-6 !bg-zinc-50/30",
            content: "!rounded-2xl !shadow-2xl",
            inner: "!p-4"
          }}
          styles={{
            body: { maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }
          }}
        >
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleExportPdf}
              loading={exporting}
              leftSection={<IconDownload size={18} />}
              variant="filled"
              className="!h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !bg-zinc-900 hover:!bg-zinc-800 !text-white !shadow-sm transition-colors !border-0"
            >
              Xuất PDF
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <div className="prose prose-sm sm:prose-base max-w-none prose-zinc 
              prose-headings:font-bold prose-headings:text-zinc-800 
              prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-sm bg-white">
                      <table className="w-full text-sm text-left !m-0" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className="bg-zinc-50/80 border-b border-zinc-200" {...props} />,
                  tbody: ({node, ...props}) => <tbody className="divide-y divide-zinc-200 bg-white" {...props} />,
                  tr: ({node, ...props}) => <tr className="hover:bg-zinc-50 transition-colors" {...props} />,
                  th: ({node, ...props}) => <th className="!p-4 align-top !font-bold !text-zinc-900 border-r border-zinc-200 last:border-r-0 min-w-[200px]" {...props} />,
                  td: ({node, ...props}) => <td className="!p-4 align-top !text-zinc-700 !leading-relaxed border-r border-zinc-200 last:border-r-0 min-w-[200px]" {...props} />
                }}
              >
                {compareResult}
              </ReactMarkdown>
            </div>
          </div>
        </Modal>

        {/* Main Content Area (Only visible when subject is selected) */}
        {subjectId && (
          <div className="flex flex-col lg:flex-row gap-6 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 pb-24">
            
            {/* Left Section: Document Grid */}
            <div className={`flex-1 transition-opacity duration-300 min-w-0 ${loadingDocs ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            {documents.length === 0 && !loadingDocs ? (
              <div className="text-center py-24 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <IconListSearch size={40} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
                <h5 className="text-[15px] font-medium text-zinc-900 mb-2">Không tìm thấy tài liệu phù hợp.</h5>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {documents.map((item) => {
                  const isSelected = selectedDocs.some(d => d.id === item.id);

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col bg-white border rounded-2xl overflow-hidden transition-all duration-300 group p-5 ${isSelected ? "border-zinc-800 shadow-md ring-1 ring-zinc-800/50" : "border-zinc-200 hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"}`}
                    >
                      <div className="flex-grow">
                        {/* Top Badges */}
                        <div className="mb-4 flex justify-between items-center gap-2">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-600 text-xs bg-zinc-100 px-2.5 py-1 rounded-md whitespace-nowrap uppercase">
                              {item.subject_code || "TÀI LIỆU"}
                            </span>
                          </div>
                          {item.document_type_name && (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-sky-600 text-xs bg-sky-50 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 uppercase">
                              {item.document_type_name}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <Link href={`/${role}/documents/${item.slug || item.id}`} className="block focus:outline-none mb-2">
                          <h3 className="text-[16px] font-bold tracking-tight text-zinc-900 leading-snug line-clamp-2 group-hover:underline underline-offset-2 decoration-zinc-300">
                            {item.title}
                          </h3>
                        </Link>

                        {/* Preview Text */}
                        <Text size="xs" className="text-zinc-500 line-clamp-2 leading-relaxed mb-4">
                          {item.preview_text || item.description || "Chưa có mô tả cho tài liệu này."}
                        </Text>
                      </div>

                      <div>
                        {/* Metadata */}
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100/80 mb-4">
                          <div>
                            <div className="font-semibold text-zinc-400 capitalize tracking-wide font-sans text-xs mb-1">Đăng bởi</div>
                            <div className="text-[13px] font-bold text-zinc-900 font-sans leading-none max-w-[120px] truncate">
                              {item.owner_email ? item.owner_email.split('@')[0] : 'Hệ thống'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-zinc-400 capitalize tracking-wide font-sans text-xs mb-1">Lượt xem</div>
                            <div className="text-[13px] font-bold text-zinc-900 font-sans leading-none">
                              {item.view_count || 0}
                            </div>
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-between items-center mt-auto">
                          {isSelected ? (
                            <Button
                              variant="filled"
                              onClick={() => handleSelectDoc(item)}
                              className="w-full !h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !bg-zinc-900 hover:!bg-zinc-800 !text-white !shadow-sm shrink-0 transition-colors !border-0"
                              leftSection={<IconCheck size={16} stroke={2.5} />}
                            >
                              Đã Chọn
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              onClick={() => handleSelectDoc(item)}
                              className="w-full !h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !text-zinc-700 hover:!bg-zinc-50 !border-zinc-200 !shadow-sm shrink-0 transition-colors"
                            >
                              Chọn So Sánh
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Section: Sidebar for Selected Documents */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="sticky top-[100px] bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                 <h4 className="font-bold text-zinc-900 mb-4 text-[15px] uppercase tracking-wide">Tài Liệu Đã Chọn ({selectedDocs.length}/5)</h4>
                 
                 {/* List of selected documents */}
                 <div className="flex flex-col gap-3 mb-6 min-h-[100px]">
                    {selectedDocs.length === 0 ? (
                       <div className="text-zinc-500 text-[13px] text-center py-8">
                         Chưa chọn tài liệu nào.
                       </div>
                    ) : (
                       selectedDocs.map(doc => (
                          <div key={doc.id} className="flex items-start justify-between gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100 group">
                             <div className="text-[13px] font-semibold text-zinc-800 line-clamp-2 leading-snug">{doc.title}</div>
                             <button 
                               onClick={() => handleRemoveDoc(doc.id)} 
                               className="text-zinc-400 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 shrink-0 mt-0.5"
                               title="Bỏ chọn"
                             >
                                <IconX size={16} stroke={2} />
                             </button>
                          </div>
                       ))
                    )}
                 </div>
                 
                 {/* Compare Button */}
                 <Button
                    fullWidth
                    variant="filled"
                    onClick={handleCompare}
                    loading={comparing}
                    disabled={selectedDocs.length < 2 || selectedDocs.length > 5}
                    className="!h-9 !px-4 !rounded-lg !text-[13px] !font-semibold !bg-zinc-900 hover:!bg-zinc-800 !text-white !shadow-sm shrink-0 transition-colors !border-0"
                 >
                    PHÂN TÍCH SO SÁNH
                 </Button>
                 
                 {selectedDocs.length < 2 && (
                    <Text size="xs" c="dimmed" className="mt-3 text-center text-zinc-500 font-medium">
                      Vui lòng chọn ít nhất 2 tài liệu để phân tích
                    </Text>
                 )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
