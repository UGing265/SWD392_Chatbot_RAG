"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconFolderOpen,
  IconBook,
  IconChevronRight,
  IconEye,
  IconListSearch,
} from "@tabler/icons-react";
import {
  TextInput,
  Button,
  Badge,
  Text,
  Paper,
  Group,
  Stack,
  Select,
  Pagination,
} from "@mantine/core";
import { useSharedDocuments } from "@/hooks/lecturer/use-shared-documents";

export function SharedDocumentsView() {
  const {
    role,
    router,
    loading,
    documents,
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
  } = useSharedDocuments();

  // Mode helpers
  const isSearchMode = !!q || !!documentTypeId || !!languageId || !!documentSourceId;
  const isSubjectMode = !!subjectId;
  const isTermMode = !!termId && !isSubjectMode && !isSearchMode;
  const isRootMode = !termId && !isSubjectMode && !isSearchMode;

  const selectedTerm = terms.find((t) => t.id === termId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);

  // Group terms by year for root mode
  const groupedTerms = useMemo(() => {
    return terms.reduce((acc, term) => {
      const y = term.year || "Khác";
      if (!acc[y]) acc[y] = [];
      acc[y].push(term);
      return acc;
    }, {} as Record<string, typeof terms>);
  }, [terms]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFilters({ q: formData.get("q") as string, page: "1" });
  };

  return (
    <div className="flex-1 bg-zinc-50 relative font-sans w-full">
      <div className="container mx-auto max-w-6xl p-6 py-12">
        {/* Header & Breadcrumbs */}
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <Text size="xs" fw={600} className="text-zinc-500 tracking-[0.15em] mb-3 uppercase font-mono text-[11px]">
            HỆ SINH THÁI
          </Text>
          <h1 className="font-serif text-[40px] tracking-[-0.03em] text-zinc-900 mb-6 select-none">
            Khám Phá.
          </h1>

          {/* Breadcrumbs */}
          <Group gap="xs" className="px-0 inline-flex">
            <Text
              className="cursor-pointer font-medium hover:text-[#111111] transition-colors"
              c={isRootMode ? "#787774" : "#111111"}
              onClick={() => clearFilters()}
              size="sm"
            >
              Tất Cả Học Kỳ
            </Text>
            
            {(selectedTerm || isSubjectMode || isSearchMode) && (
              <IconChevronRight size={14} className="text-[#EAEAEA] mx-1" />
            )}

            {isSearchMode && !termId && !subjectId ? (
              <Text size="sm" c="dimmed" fw={500}>Kết quả tìm kiếm: "{q}"</Text>
            ) : selectedTerm ? (
              <>
                <Text
                  className={`font-medium transition-colors ${!isSubjectMode ? "text-[#787774] cursor-default" : "text-[#111111] cursor-pointer hover:text-[#787774]"}`}
                  onClick={() => isSubjectMode && updateFilters({ subjectId: null, page: "1" })}
                  size="sm"
                >
                  {selectedTerm.name}
                </Text>
              </>
            ) : null}

            {selectedSubject && (
              <>
                <IconChevronRight size={14} className="text-[#EAEAEA] mx-1" />
                <Text size="sm" c="dimmed" fw={500}>{selectedSubject.code}</Text>
              </>
            )}
          </Group>
        </div>

        {/* STATE 1: ACADEMIC TERMS */}
        {isRootMode && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {Object.entries(groupedTerms)
              .sort((a, b) => {
                if (a[0] === "Khác") return 1;
                if (b[0] === "Khác") return -1;
                return Number(b[0]) - Number(a[0]);
              })
              .map(([year, yearTerms]) => (
                <div key={year}>
                  <div className="flex items-center gap-3 mb-6 border-b border-zinc-200 pb-4">
                    <IconFolderOpen size={20} className="text-zinc-900" />
                    <h2 className="text-[16px] font-bold text-zinc-900 font-sans tracking-tight">
                      {year === "Khác" ? "Học kỳ khác" : `NĂM HỌC ${year}`}
                    </h2>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {yearTerms
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((term) => {
                        const termSubjectsCount = subjects.filter(s => s.academicTermId === term.id).length;
                        return (
                          <div
                            key={term.id}
                            onClick={() => updateFilters({ termId: term.id })}
                            className="flex flex-col items-start justify-between cursor-pointer bg-white border border-zinc-200 rounded-[24px] p-6 hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group"
                          >
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-700 mb-6 border border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                              <IconFolderOpen size={24} stroke={1.5} />
                            </div>
                            <h4 className="text-[16px] font-bold text-zinc-900 mb-2 font-serif group-hover:underline decoration-zinc-300 underline-offset-2">
                              {term.name}
                            </h4>
                            <Text size="xs" className="font-mono mt-1 text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                              {termSubjectsCount} MÔN HỌC
                            </Text>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* STATE 2: SUBJECTS LIST */}
        {isTermMode && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {subjects.filter((s) => s.academicTermId === termId).length === 0 ? (
              <div className="text-center py-20 rounded-[24px] bg-white border border-zinc-200 shadow-sm">
                <Text size="sm" className="text-zinc-500 mb-6">Học kỳ này chưa có môn học nào.</Text>
                <Button onClick={() => clearFilters()} variant="outline" color="dark" radius="xl" size="sm">
                  Quay Lại Học Kỳ
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {subjects
                  .filter((s) => s.academicTermId === termId)
                  .map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => updateFilters({ subjectId: sub.id, termId: termId })}
                      className="cursor-pointer bg-white border border-zinc-200 p-6 rounded-[24px] hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group flex gap-4 items-start"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-700 border border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                        <IconBook size={24} stroke={1.5} />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-zinc-900 mb-1 leading-tight font-sans">{sub.code}</h3>
                        <Text size="xs" className="text-zinc-500 line-clamp-2 leading-relaxed">{sub.name}</Text>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* STATE 3: DOCUMENTS & SEARCH FORM */}
        {(isSubjectMode || isSearchMode) && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Search & Filter Form */}
            <div className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm mb-12">
              <Stack gap="lg">
                {/* Row 1: Search */}
                <form onSubmit={handleSearchSubmit} className="flex gap-4 items-center flex-wrap">
                  <div className="flex-1 relative min-w-[200px]">
                    <IconSearch size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      name="q"
                      defaultValue={q}
                      placeholder="Tìm kiếm tài liệu..."
                      className="w-full h-12 pl-12 pr-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-[14px] text-zinc-900 focus:outline-none focus:border-zinc-800 transition-colors"
                    />
                  </div>
                  <button type="submit" className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white text-[14px] font-medium rounded-2xl transition-colors">
                    Tìm Kiếm
                  </button>
                  {(q || subjectId || documentTypeId || languageId || documentSourceId) && (
                    <button type="button" onClick={() => clearFilters()} className="h-12 px-6 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 text-[14px] font-medium rounded-2xl transition-colors">
                      Xóa lọc
                    </button>
                  )}
                </form>

                {/* Row 2: Selects */}
                <Group gap="md" grow>
                  <Select
                    value={subjectId || null}
                    onChange={(val) => updateFilters({ subjectId: val })}
                    placeholder="Tất cả môn học"
                    data={subjects
                      .filter(s => !termId || s.academicTermId === termId)
                      .map(s => ({ value: s.id, label: s.code }))}
                    searchable
                    radius="sm"
                    clearable
                    styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
                  />
                  <Select
                    value={documentTypeId || null}
                    onChange={(val) => updateFilters({ documentTypeId: val })}
                    placeholder="Tất cả học liệu"
                    data={documentTypes.map(t => ({ value: t.id, label: t.name }))}
                    radius="sm"
                    clearable
                    styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
                  />
                  <Select
                    value={languageId || null}
                    onChange={(val) => updateFilters({ languageId: val })}
                    placeholder="Tất cả ngôn ngữ"
                    data={languages.map(l => ({ value: l.id, label: l.name }))}
                    radius="sm"
                    clearable
                    styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
                  />
                  <Select
                    value={documentSourceId || null}
                    onChange={(val) => updateFilters({ documentSourceId: val })}
                    placeholder="Tất cả nguồn"
                    data={documentSources.map(s => ({ value: s.id, label: s.name }))}
                    radius="sm"
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
                    radius="sm"
                    allowDeselect={false}
                    styles={{ input: { borderColor: '#EAEAEA', '&:focus': { borderColor: '#111111' } } }}
                  />
                </Group>
              </Stack>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-end mb-6 border-b border-zinc-200 pb-4">
              <h4 className="text-[18px] font-serif tracking-[-0.02em] text-zinc-900 m-0">Danh Sách</h4>
              <Text size="xs" className="font-mono text-zinc-500 uppercase tracking-widest">
                KẾT QUẢ: <span className="text-zinc-900 font-bold ml-1">{totalDocuments}</span>
              </Text>
            </div>

            {/* Grid */}
            <div className={`transition-opacity duration-300 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
              {documents.length === 0 && !loading ? (
                <div className="text-center py-24 rounded-[24px] bg-white border border-zinc-200 shadow-sm">
                  <div className="mb-4 text-zinc-300 flex justify-center">
                    <IconListSearch size={40} stroke={1.5} />
                  </div>
                  <h5 className="text-[15px] font-medium text-zinc-900 mb-2">Không tìm thấy tài liệu phù hợp</h5>
                  <Text size="sm" className="text-zinc-500 mb-6">Vui lòng thử từ khóa khác hoặc xóa bộ lọc.</Text>
                  <Button variant="outline" color="dark" radius="xl" onClick={() => clearFilters()}>
                    Xóa Bộ Lọc
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {documents.map((item) => (
                    <Link
                      key={item.id}
                      href={`/${role}/documents/${item.slug || item.id}`}
                      className="flex flex-col bg-white border border-zinc-200 rounded-[24px] overflow-hidden hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group p-6"
                    >
                      <div className="flex-grow">
                        {/* Top Badges */}
                        <div className="mb-6 flex justify-between items-start">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 border border-zinc-200">
                            <IconBook size={20} stroke={1.5} />
                          </div>
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-bold text-zinc-600 font-mono uppercase tracking-widest">
                            {item.subject_code || item.subject_name || "TÀI LIỆU"}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-[18px] font-bold text-zinc-900 mb-3 leading-snug line-clamp-2 group-hover:underline underline-offset-2 decoration-zinc-300 font-serif">
                          {item.title}
                        </h4>

                        {/* Excerpt */}
                        <Text size="sm" className="text-zinc-500 line-clamp-3 leading-relaxed mb-6">
                          {item.preview_text || item.description || "Bản xem trước hiện chưa khả dụng. Bấm để xem chi tiết."}
                        </Text>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-5 mt-auto border-t border-zinc-100/80 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-600 font-sans font-bold uppercase tracking-wider">
                            {(item.owner_email ? item.owner_email[0] : "U")}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-sans font-bold tracking-widest text-zinc-400 mb-0.5 uppercase">Tác giả</span>
                            <span className="text-[12px] font-mono font-bold text-zinc-900 tracking-wider truncate max-w-[100px] uppercase">
                              {item.owner_email ? item.owner_email.split('@')[0] : "System"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-sans font-bold tracking-widest text-zinc-400 mb-0.5 uppercase">Ngày & View</span>
                          <div className="flex items-center gap-2 font-mono text-[12px] font-bold tracking-wider text-zinc-900">
                            <span>{new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
                            <span className="text-zinc-300">|</span>
                            <div className="flex items-center gap-1">
                              <IconEye size={12} stroke={2.5} />
                              <span>{item.view_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
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
                  radius="sm"
                  color="dark"
                  withEdges
                />
              </Group>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
