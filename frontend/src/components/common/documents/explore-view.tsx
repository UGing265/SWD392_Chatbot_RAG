"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  IconListSearch,
  IconFileCertificate,
  IconLibrary,
  IconBooks,
  IconArrowRight,
  IconBookmark,
  IconBookmarkFilled,
} from "@tabler/icons-react";
import {
  Button,
  Text,
  Group,
  Pagination,
} from "@mantine/core";
import { useExplore } from "@/hooks/lecturer/use-explore";
import { DocumentFilters } from "./document-filters";

export function ExploreView() {
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
    bookmarkedDocIds,
    toggleBookmark,
  } = useExplore();

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
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <IconLibrary size={20} stroke={1.5} className="text-zinc-900" />
              <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
                {selectedSubject ? selectedSubject.code : 'Khám Phá'}
              </h1>
            </div>
            {selectedSubject && (
              <>
                <span className="hidden sm:inline text-zinc-300">/</span>
                <span className="text-sm text-zinc-500 font-medium">{selectedSubject.name}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center justify-end gap-3 flex-1">
            <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-full pr-3 py-1.5 pl-1.5 shadow-sm transition-all hover:bg-zinc-100 hover:border-zinc-300">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-zinc-200 text-zinc-500 mr-2 shadow-sm">
                <IconFileCertificate size={14} stroke={1.5} />
              </div>
              <div className="font-semibold text-zinc-400 capitalize tracking-wide font-sans text-xs mr-2">Tài liệu công khai</div>
              <div className="font-bold text-zinc-900 text-sm leading-none tabular-nums">{totalDocuments}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">
        {/* Search & Filter Bar - Uses Drawer pattern like 'Tài liệu của tôi' */}
        <DocumentFilters
          q={q}
          subjectId={subjectId}
          documentTypeId={documentTypeId}
          languageId={languageId}
          documentSourceId={documentSourceId}
          sortBy={sortBy}
          subjects={subjects}
          documentTypes={documentTypes}
          languages={languages}
          documentSources={documentSources}
          updateFilters={updateFilters}
          clearFilters={clearFilters}
          handleSearchSubmit={handleSearchSubmit}
        />

        {/* Root Mode: Subjects Grid */}
        {isRootMode && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200">
            <div className="flex justify-between items-end mb-6 pb-4 border-b border-zinc-200">
              <h4 className="text-[18px] font-bold tracking-tight text-zinc-900 m-0">Danh Sách Môn Học</h4>
              <Text size="xs" className="font-semibold text-zinc-400 capitalize tracking-wide font-sans">
                Tổng số: <span className="text-zinc-900 font-bold ml-1">{sortedSubjects.length}</span>
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
                      onClick={() => updateFilters({ subjectId: subject.id, page: "1" })}
                      className="group flex flex-col p-6 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-100/80 to-transparent rounded-bl-[100px] -z-0 opacity-50 group-hover:from-zinc-200 transition-colors" />

                      <div className="relative z-10 flex flex-col h-full w-full">
                        <div className="flex items-start justify-between mb-5">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 border border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                            <IconBooks size={20} stroke={1.5} />
                          </div>
                          <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-600 text-xs bg-zinc-100 px-2.5 py-1 rounded-md whitespace-nowrap group-hover:bg-zinc-200 transition-colors">
                            Bộ tài liệu
                          </span>
                        </div>
                        
                        <div className="w-full mt-auto">
                          <Text size="xs" fw={700} className="text-zinc-600 tracking-wide font-sans uppercase mb-2">
                            {subject.code || "UNKNOWN"}
                          </Text>
                          <h3 className="text-[18px] font-bold tracking-tight text-zinc-900 leading-snug line-clamp-2 group-hover:text-zinc-600 transition-colors">
                            {subject.name}
                          </h3>
                          
                          <p className="text-[13px] text-zinc-500 mt-3 line-clamp-2 leading-relaxed">
                            Kho lưu trữ tài liệu, bài giảng và tài nguyên số chuyên ngành dành cho môn học.
                          </p>
                          
                          <div className="flex items-center justify-between pt-5 mt-5 border-t border-zinc-100/80">
                            <div className="font-semibold text-zinc-400 capitalize tracking-wide font-sans text-xs group-hover:text-zinc-900 transition-colors">
                              {docCount} Tài liệu
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
        <div className="mt-8">
          <div className="flex justify-between items-end mb-6 pb-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 border-b border-zinc-200">
            <h4 className="text-[18px] font-bold tracking-tight text-zinc-900 m-0">Tài Liệu</h4>
            <Text size="xs" className="font-semibold text-zinc-400 capitalize tracking-wide font-sans">
              Kết quả: <span className="text-zinc-900 font-bold ml-1">{totalDocuments}</span>
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
                        <button
                          onClick={() => toggleBookmark(item.id, item.slug)}
                          className={`p-2 rounded-full transition-colors ${
                            bookmarkedDocIds.has(item.id) 
                              ? "text-zinc-900 bg-zinc-100" 
                              : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                          }`}
                          title={bookmarkedDocIds.has(item.id) ? "Bỏ lưu tài liệu" : "Lưu tài liệu"}
                        >
                          {bookmarkedDocIds.has(item.id) ? (
                            <IconBookmarkFilled size={18} />
                          ) : (
                            <IconBookmark size={18} stroke={1.5} />
                          )}
                        </button>
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
        </div>
      </div>
    </div>
  );
}
