"use client";

import Link from "next/link";
import {
  IconSearch,
  IconEye,
  IconListSearch,
  IconDatabaseImport,
  IconFileCertificate,
  IconTrash,
} from "@tabler/icons-react";
import {
  TextInput,
  Button,
  Text,
  Group,
  Stack,
  Select,
  Pagination,
} from "@mantine/core";
import { useMyDocuments } from "@/hooks/lecturer/use-my-documents";

const getVisibilityBadge = (visibility: string) => {
  switch (visibility) {
    case "private":
      return {
        label: "Riêng tư",
        className: "bg-rose-50 border-rose-200 text-rose-600",
      };
    case "school_wide":
      return {
        label: "Nội bộ",
        className: "bg-sky-50 border-sky-200 text-sky-600",
      };
    case "public":
    default:
      return {
        label: "Công khai",
        className: "bg-emerald-50 border-emerald-200 text-emerald-600",
      };
  }
};

export function MyDocumentsView() {
  const {
    role,
    router,
    loading,
    documents,
    activeUploadJobs,
    totalDocuments,
    totalPages,
    page,
    q,
    subjectId,
    termId,
    documentTypeId,
    languageId,
    documentSourceId,
    sortBy,
    updateFilters,
    clearFilters,
    subjects,
    terms,
    documentTypes,
    languages,
    documentSources,
    handleDelete,
  } = useMyDocuments();

  const displayDocuments = documents.filter(
    (item) => item.status !== "processing" && item.status !== "pending"
  );

  const displayedCount = Math.max(
    0,
    totalDocuments - documents.filter((d) => d.status === "processing" || d.status === "pending").length
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFilters({ q: formData.get("q") as string, page: "1" });
  };

  return (
    <div className="flex-1 bg-zinc-50 relative font-sans w-full">
      <div className="container mx-auto max-w-6xl p-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-5 animate-in fade-in slide-in-from-top-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div>
            <Text size="xs" fw={600} className="text-zinc-500 tracking-[0.15em] uppercase mb-3 font-mono text-[11px]">
              KHÔNG GIAN CÁ NHÂN
            </Text>
            <h1 className="font-serif text-[40px] tracking-[-0.03em] text-zinc-900 leading-none mb-0 select-none">
              Thư Viện.
            </h1>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center gap-4 px-5 py-3 rounded-xl bg-white border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-600">
                <IconDatabaseImport size={16} stroke={1.5} />
              </div>
              <div>
                <div className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 mb-0.5 uppercase">Tổng tài liệu</div>
                <div className="text-[14px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none">
                  {totalDocuments}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Upload Jobs Integration Panel */}
        {activeUploadJobs.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <Text size="xs" fw={700} className="text-zinc-500 tracking-[0.15em] uppercase font-mono text-[11px]">
                Tài liệu đang tích hợp ({activeUploadJobs.length})
              </Text>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeUploadJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 shrink-0">
                        <IconDatabaseImport size={16} stroke={1.5} className="animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <Text className="text-[14px] font-bold text-zinc-900 truncate" fw={600}>
                          {job.file_name}
                        </Text>
                        <Text className="text-[12px] text-zinc-500 truncate">
                          {job.message || "Đang xử lý..."}
                        </Text>
                      </div>
                    </div>
                    <Text className="text-[12px] font-bold font-mono text-zinc-700 shrink-0">
                      {job.progress_percent}%
                    </Text>
                  </div>
                  
                  <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0EA5E9] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${job.progress_percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Form */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100">
          <Stack gap="lg">
            {/* Row 1: Search */}
            <form onSubmit={handleSearchSubmit} className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 relative min-w-[200px]">
                <IconSearch size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Tìm kiếm tài liệu..."
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-[14px] text-zinc-900 focus:outline-none focus:border-zinc-800 transition-colors"
                />
              </div>
              <button type="submit" className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white text-[14px] font-medium rounded-xl transition-colors">
                Tìm Kiếm
              </button>
              <button type="button" onClick={() => clearFilters()} className="h-12 px-6 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 text-[14px] font-medium rounded-xl transition-colors">
                Xóa lọc
              </button>
            </form>

            {/* Row 2: Selects */}
            <Group gap="md" grow>
              <Select
                value={subjectId || null}
                onChange={(val) => updateFilters({ subjectId: val })}
                placeholder="Tất cả môn học"
                data={subjects.map(s => ({ value: s.id, label: s.code }))}
                searchable
                radius="lg"
                clearable
                styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
              />
              <Select
                value={documentTypeId || null}
                onChange={(val) => updateFilters({ documentTypeId: val })}
                placeholder="Tất cả học liệu"
                data={documentTypes.map(t => ({ value: t.id, label: t.name }))}
                radius="lg"
                clearable
                styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
              />
              <Select
                value={languageId || null}
                onChange={(val) => updateFilters({ languageId: val })}
                placeholder="Tất cả ngôn ngữ"
                data={languages.map(l => ({ value: l.id, label: l.name }))}
                radius="lg"
                clearable
                styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
              />
              <Select
                value={documentSourceId || null}
                onChange={(val) => updateFilters({ documentSourceId: val })}
                placeholder="Tất cả nguồn"
                data={documentSources.map(s => ({ value: s.id, label: s.name }))}
                radius="lg"
                clearable
                styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
              />
              <Select
                value={sortBy}
                onChange={(val) => updateFilters({ sortBy: val })}
                data={[
                  { value: "date_desc", label: "Mới nhất trước" },
                  { value: "date_asc", label: "Cũ nhất trước" },
                  { value: "title_asc", label: "Tên A - Z" },
                  { value: "title_desc", label: "Tên Z - A" },
                  { value: "views_desc", label: "Nhiều lượt xem" },
                  { value: "views_asc", label: "Ít lượt xem" },
                ]}
                radius="lg"
                allowDeselect={false}
                styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
              />
            </Group>
          </Stack>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-end mb-6 pb-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 border-b border-zinc-200">
          <h4 className="text-[18px] font-serif tracking-[-0.02em] text-zinc-900 m-0">Danh Sách</h4>
          <Text size="xs" className="font-mono text-zinc-500 uppercase tracking-widest">
            KẾT QUẢ: <span className="text-zinc-900 font-bold ml-1">{displayedCount}</span>
          </Text>
        </div>

        {/* Document Grid */}
        <div className={`transition-opacity duration-300 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"} animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300`}>
          {displayDocuments.length === 0 && !loading ? (
            <div className="text-center py-24 rounded-2xl bg-white border border-zinc-200 shadow-sm">
              {(q || subjectId) ? (
                <>
                  <IconListSearch size={40} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
                  <h5 className="text-[15px] font-medium text-zinc-900 mb-2">Không tìm thấy tài liệu phù hợp.</h5>
                  <Button variant="outline" color="dark" radius="lg" onClick={() => clearFilters()}>
                    Xóa Bộ Lọc
                  </Button>
                </>
              ) : (
                <>
                  <IconFileCertificate size={40} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
                  <h5 className="text-[15px] font-medium text-zinc-900 mb-2">Chưa có tài liệu nào.</h5>
                  <Text size="sm" className="text-zinc-500 mb-6">Bạn chưa tải lên tài liệu nào trong thư viện cá nhân.</Text>
                  <Button component={Link} href={`/${role}/upload`} color="dark" radius="lg" className="bg-zinc-900">
                    Tải Lên Ngay
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayDocuments.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group p-6"
                >
                  <div className="flex-grow">
                    {/* Top Badges */}
                    <div className="mb-6 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 border border-zinc-200">
                          <IconFileCertificate size={20} stroke={1.5} />
                        </div>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-bold text-zinc-600 font-mono uppercase tracking-widest">
                          {item.subject_code || item.subject_name || "TÀI LIỆU"}
                        </span>
                      </div>
                      {(() => {
                        const badge = getVisibilityBadge(item.visibility);
                        return (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full border text-[10px] font-bold font-sans uppercase tracking-wider ${badge.className}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Title */}
                    <Link href={`/${role}/documents/${item.slug || item.id}`} className="block focus:outline-none mb-3">
                      <h3 className="text-[18px] font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:underline underline-offset-2 decoration-zinc-300 font-serif">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Preview Text */}
                    <Text size="sm" className="text-zinc-500 line-clamp-2 leading-relaxed mb-6">
                      {item.preview_text || item.description || "Chưa có mô tả cho tài liệu này."}
                    </Text>
                  </div>

                  <div>
                    {/* Metadata */}
                    <div className="flex items-center justify-between pt-5 border-t border-zinc-100/80 mb-5">
                      <div>
                        <div className="text-[9px] font-sans font-bold tracking-widest text-zinc-400 mb-1 uppercase">Đăng tải</div>
                        <div className="text-[12px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none">
                          {new Date(item.updated_at || item.created_at).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-sans font-bold tracking-widest text-zinc-400 mb-1 uppercase">Lượt xem</div>
                        <div className="text-[12px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none">
                          {item.view_count || 0}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/${role}/documents/${item.slug || item.id}`}
                        className="px-4 py-2 text-[12px] font-bold text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors uppercase tracking-widest"
                      >
                        Chi Tiết
                      </Link>
                      
                      <Link
                        href={`/${role}/documents/edit/${item.slug || item.id}`}
                        className="px-4 py-2 text-[12px] font-bold text-zinc-700 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors uppercase tracking-widest"
                      >
                        Sửa
                      </Link>
                      
                      <button
                        onClick={(e) => handleDelete(e, item.slug || item.id)}
                        className="w-9 h-9 flex items-center justify-center text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors shrink-0"
                      >
                        <IconTrash size={16} stroke={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center" mt={48}>
            <Pagination
              value={page}
              onChange={(p) => updateFilters({ page: p.toString() })}
              total={totalPages}
              radius="lg"
              color="dark"
              withEdges
            />
          </Group>
        )}
      </div>
    </div>
  );
}
