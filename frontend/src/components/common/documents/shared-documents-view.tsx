"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconListSearch,
  IconFileCertificate,
  IconLibrary,
  IconBooks,
  IconArrowRight,
  IconFilterOff,
  IconSortDescending,
  IconLanguage,
  IconWorld,
} from "@tabler/icons-react";
import {
  Button,
  Text,
  Group,
  Stack,
  Select,
  Pagination,
} from "@mantine/core";
import { useSharedDocuments } from "@/hooks/lecturer/use-shared-documents";

export function SharedDocumentsView() {
  const {
    role,
    loading,
    documents,
    totalDocuments,
    totalPages,
    page,
    q,
    subjectId,
    documentTypeId,
    languageId,
    documentSourceId,
    sortBy,
    updateFilters,
    clearFilters,
    subjects,
    documentTypes,
    languages,
    documentSources,
    subjectAccessCounts,
    subjectDocumentCounts,
  } = useSharedDocuments();

  const isSearchMode = !!q || !!documentTypeId || !!languageId || !!documentSourceId;
  const isSubjectMode = !!subjectId;
  const isRootMode = !isSubjectMode && !isSearchMode;

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const aAccess = subjectAccessCounts[a.id] || 0;
      const bAccess = subjectAccessCounts[b.id] || 0;
      return bAccess - aAccess || a.name.localeCompare(b.name, "vi");
    });
  }, [subjectAccessCounts, subjects]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFilters({ q: formData.get("q") as string, page: "1" });
  };

  return (
    <div className="flex-1 bg-zinc-50 relative font-sans w-full min-h-screen">
      <div className="container mx-auto max-w-6xl p-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-5 animate-in fade-in slide-in-from-top-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div>
            <Text size="xs" fw={600} className="text-zinc-500 tracking-[0.15em] uppercase mb-3 font-mono text-[11px]">
              HỆ SINH THÁI SỐ
            </Text>
            <h1 className="font-bold text-[40px] tracking-tight text-zinc-900 leading-none mb-0 select-none">
              {selectedSubject ? `${selectedSubject.code}.` : 'Khám Phá.'}
            </h1>
            {selectedSubject && (
              <p className="mt-4 text-zinc-600 font-medium">{selectedSubject.name}</p>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center gap-4 px-5 py-3 rounded-xl bg-white border border-zinc-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-600">
                <IconLibrary size={16} stroke={1.5} />
              </div>
              <div>
                <div className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 mb-0.5 uppercase">Tài liệu công khai</div>
                <div className="text-[14px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none">
                  {totalDocuments}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refined Modern Search & Filter Form */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-12 duration-700 ease-out flex flex-col gap-4">
          
          {/* Sleek Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative flex items-center bg-white border border-zinc-200 rounded-2xl shadow-sm focus-within:shadow-md focus-within:border-zinc-300 focus-within:ring-4 focus-within:ring-zinc-500/5 transition-all duration-300">
              <div className="pl-5 text-zinc-400">
                <IconSearch size={20} stroke={1.5} />
              </div>
              <input
                name="q"
                defaultValue={q}
                placeholder="Tìm kiếm tài liệu, mã môn..."
                className="w-full h-14 bg-transparent border-none focus:outline-none focus:ring-0 text-[15px] text-zinc-900 px-4 placeholder:text-zinc-400 font-medium"
              />
              <div className="pr-5 hidden sm:flex items-center gap-1.5 text-zinc-300 select-none whitespace-nowrap">
                <kbd className="font-sans text-[11px] font-semibold border border-zinc-200 rounded px-1.5 py-0.5 text-zinc-400">Enter</kbd>
                <span className="text-[12px] font-medium">để tìm</span>
              </div>
            </div>
          </form>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-3">
            
            <Select
              variant="filled"
              radius="xl"
              value={subjectId || null}
              onChange={(val) => updateFilters({ subjectId: val, termId: null })}
              placeholder="Môn học"
              data={subjects.map(s => ({ value: s.id, label: s.code }))}
              searchable
              clearable
              leftSection={<IconBooks size={16} className={subjectId ? "text-white" : "text-zinc-500"} stroke={1.5} />}
              classNames={{ input: 'placeholder:text-zinc-600 placeholder:opacity-100' }}
              styles={{ 
                input: { backgroundColor: subjectId ? '#18181B' : '#F4F4F5', border: subjectId ? '1px solid #18181B' : '1px solid #E4E4E7', height: '38px', minHeight: '38px', fontSize: '13px', color: subjectId ? '#FFFFFF' : '#18181B', fontWeight: 600, cursor: 'pointer' },
                section: { color: subjectId ? '#A1A1AA' : '#71717A' }
              }}
              className="w-full sm:w-[135px]"
            />
            <Select
              variant="filled"
              radius="xl"
              value={documentTypeId || null}
              onChange={(val) => updateFilters({ documentTypeId: val })}
              placeholder="Học liệu"
              data={documentTypes.map(t => ({ value: t.id, label: t.name }))}
              clearable
              leftSection={<IconFileCertificate size={16} className={documentTypeId ? "text-white" : "text-zinc-500"} stroke={1.5} />}
              classNames={{ input: 'placeholder:text-zinc-600 placeholder:opacity-100' }}
              styles={{ 
                input: { backgroundColor: documentTypeId ? '#18181B' : '#F4F4F5', border: documentTypeId ? '1px solid #18181B' : '1px solid #E4E4E7', height: '38px', minHeight: '38px', fontSize: '13px', color: documentTypeId ? '#FFFFFF' : '#18181B', fontWeight: 600, cursor: 'pointer' },
                section: { color: documentTypeId ? '#A1A1AA' : '#71717A' }
              }}
              className="w-full sm:w-[135px]"
            />
            <Select
              variant="filled"
              radius="xl"
              value={languageId || null}
              onChange={(val) => updateFilters({ languageId: val })}
              placeholder="Ngôn ngữ"
              data={languages.map(l => ({ value: l.id, label: l.name }))}
              clearable
              leftSection={<IconLanguage size={16} className={languageId ? "text-white" : "text-zinc-500"} stroke={1.5} />}
              classNames={{ input: 'placeholder:text-zinc-600 placeholder:opacity-100' }}
              styles={{ 
                input: { backgroundColor: languageId ? '#18181B' : '#F4F4F5', border: languageId ? '1px solid #18181B' : '1px solid #E4E4E7', height: '38px', minHeight: '38px', fontSize: '13px', color: languageId ? '#FFFFFF' : '#18181B', fontWeight: 600, cursor: 'pointer' },
                section: { color: languageId ? '#A1A1AA' : '#71717A' }
              }}
              className="w-full sm:w-[135px]"
            />
            <Select
              variant="filled"
              radius="xl"
              value={documentSourceId || null}
              onChange={(val) => updateFilters({ documentSourceId: val })}
              placeholder="Nguồn"
              data={documentSources.map(s => ({ value: s.id, label: s.name }))}
              clearable
              leftSection={<IconWorld size={16} className={documentSourceId ? "text-white" : "text-zinc-500"} stroke={1.5} />}
              classNames={{ input: 'placeholder:text-zinc-600 placeholder:opacity-100' }}
              styles={{ 
                input: { backgroundColor: documentSourceId ? '#18181B' : '#F4F4F5', border: documentSourceId ? '1px solid #18181B' : '1px solid #E4E4E7', height: '38px', minHeight: '38px', fontSize: '13px', color: documentSourceId ? '#FFFFFF' : '#18181B', fontWeight: 600, cursor: 'pointer' },
                section: { color: documentSourceId ? '#A1A1AA' : '#71717A' }
              }}
              className="w-full sm:w-[135px]"
            />
            
            <div className="w-px h-5 bg-zinc-300 mx-1 hidden sm:block"></div>
            
            <Select
              variant="filled"
              radius="xl"
              value={sortBy}
              onChange={(val) => updateFilters({ sortBy: val })}
              data={[
                { value: "date_desc", label: "Mới nhất" },
                { value: "date_asc", label: "Cũ nhất" },
                { value: "title_asc", label: "Tên A - Z" },
                { value: "title_desc", label: "Tên Z - A" },
                { value: "views_desc", label: "Nhiều view" },
              ]}
              allowDeselect={false}
              leftSection={<IconSortDescending size={16} className={sortBy !== 'date_desc' ? "text-white" : "text-zinc-500"} stroke={1.5} />}
              styles={{ 
                input: { backgroundColor: sortBy !== 'date_desc' ? '#18181B' : '#F4F4F5', border: sortBy !== 'date_desc' ? '1px solid #18181B' : '1px solid #E4E4E7', height: '38px', minHeight: '38px', fontSize: '13px', color: sortBy !== 'date_desc' ? '#FFFFFF' : '#18181B', fontWeight: 600, cursor: 'pointer' },
                section: { color: sortBy !== 'date_desc' ? '#A1A1AA' : '#71717A' }
              }}
              className="w-full sm:w-[160px]"
            />

            {(q || subjectId || documentTypeId || languageId || documentSourceId || sortBy !== 'date_desc') && (
              <button type="button" onClick={() => clearFilters()} className="h-9 px-3 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ml-1">
                <IconFilterOff size={16} stroke={2} />
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Root Mode: Subjects Grid */}
        {isRootMode && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200">
            <div className="flex justify-between items-end mb-6 pb-4 border-b border-zinc-200">
              <h4 className="text-[18px] font-bold tracking-tight text-zinc-900 m-0">Danh Sách Môn Học</h4>
              <Text size="xs" className="font-mono text-zinc-500 uppercase tracking-widest">
                TỔNG SỐ: <span className="text-zinc-900 font-bold ml-1">{sortedSubjects.length}</span>
              </Text>
            </div>

            {sortedSubjects.length === 0 ? (
              <div className="text-center py-24 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <IconBooks size={40} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
                <h5 className="text-[15px] font-medium text-zinc-900 mb-2">Chưa có môn học nào.</h5>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedSubjects.map((subject) => {
                  const docCount = subjectDocumentCounts[subject.id] || 0;

                  return (
                    <button
                      key={subject.id}
                      onClick={() => updateFilters({ subjectId: subject.id, termId: null, page: "1" })}
                      className="group flex flex-col p-6 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-100/80 to-transparent rounded-bl-[100px] -z-0 opacity-50 group-hover:from-zinc-200 transition-colors" />

                      <div className="relative z-10 flex flex-col h-full w-full">
                        <div className="flex items-start justify-between mb-5">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 border border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                            <IconBooks size={20} stroke={1.5} />
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-[9px] font-bold text-zinc-500 font-mono uppercase tracking-widest group-hover:border-zinc-300 transition-colors">
                            Bộ Tài Liệu
                          </span>
                        </div>
                        
                        <div className="w-full mt-auto">
                          <Text size="xs" fw={700} className="text-zinc-500 tracking-widest uppercase font-mono mb-2">
                            {subject.code || "UNKNOWN"}
                          </Text>
                          <h3 className="text-[18px] font-bold tracking-tight text-zinc-900 leading-snug line-clamp-2 group-hover:text-zinc-600 transition-colors">
                            {subject.name}
                          </h3>
                          
                          <p className="text-[13px] text-zinc-500 mt-3 line-clamp-2 leading-relaxed">
                            Kho lưu trữ tài liệu, bài giảng và tài nguyên số chuyên ngành dành cho môn học.
                          </p>
                          
                          <div className="flex items-center justify-between pt-5 mt-5 border-t border-zinc-100/80">
                            <div className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase group-hover:text-zinc-900 transition-colors">
                              {docCount} Tài Liệu
                            </div>
                            <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all transform group-hover:translate-x-1 border border-zinc-200 group-hover:border-zinc-900">
                              <IconArrowRight size={14} stroke={2} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Documents Grid */}
        {(isSubjectMode || isSearchMode) && (
          <>
            <div className="flex justify-between items-end mb-6 pb-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 border-b border-zinc-200 mt-8">
              <h4 className="text-[18px] font-bold tracking-tight text-zinc-900 m-0">Tài Liệu</h4>
              <Text size="xs" className="font-mono text-zinc-500 uppercase tracking-widest">
                KẾT QUẢ: <span className="text-zinc-900 font-bold ml-1">{totalDocuments}</span>
              </Text>
            </div>

            <div className={`transition-opacity duration-300 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"} animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300`}>
              {documents.length === 0 && !loading ? (
                <div className="text-center py-24 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                  <IconListSearch size={40} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
                  <h5 className="text-[15px] font-medium text-zinc-900 mb-2">Không tìm thấy tài liệu phù hợp.</h5>
                  <Button variant="outline" color="dark" radius="lg" onClick={() => clearFilters()}>
                    Xóa Bộ Lọc
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {documents.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group p-6"
                    >
                      <div className="flex-grow">
                        {/* Top Badges */}
                        <div className="mb-6 flex justify-between items-center gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 border border-zinc-200">
                              <IconFileCertificate size={20} stroke={1.5} />
                            </div>
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-bold text-zinc-600 font-mono uppercase tracking-widest">
                              {item.subject_code || "TÀI LIỆU"}
                            </span>
                          </div>
                          {item.document_type_name && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-sky-200 bg-sky-50 text-[10px] font-bold text-sky-600 font-sans uppercase tracking-wider shrink-0">
                              {item.document_type_name}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <Link href={`/${role}/documents/${item.slug || item.id}`} className="block focus:outline-none mb-3">
                          <h3 className="text-[18px] font-bold tracking-tight text-zinc-900 leading-snug line-clamp-2 group-hover:underline underline-offset-2 decoration-zinc-300">
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
                            <div className="text-[9px] font-sans font-bold tracking-widest text-zinc-400 mb-1 uppercase">Đăng bởi</div>
                            <div className="text-[12px] font-bold text-zinc-900 font-mono tracking-wider uppercase leading-none max-w-[120px] truncate">
                              {item.owner_email ? item.owner_email.split('@')[0] : 'Hệ thống'}
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
                        <div className="flex justify-end">
                          <Link
                            href={`/${role}/documents/${item.slug || item.id}`}
                            className="px-4 py-2 text-[12px] font-bold text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors uppercase tracking-widest"
                          >
                            Chi Tiết
                          </Link>
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
          </>
        )}
      </div>
    </div>
  );
}
