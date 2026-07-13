"use client";

import Link from "next/link";
import {
  IconListSearch,
  IconFileCertificate,
  IconBookmarkFilled,
  IconBookmark,
} from "@tabler/icons-react";
import { Text } from "@mantine/core";
import { useParams } from "next/navigation";
import { useBookmarks } from "@/hooks/lecturer/use-bookmarks";

export function BookmarksView() {
  const params = useParams();
  const role = (params?.role as string) || "student";
  const { documents, loading, bookmarkedDocIds, toggleBookmark } = useBookmarks();

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <IconBookmarkFilled size={20} className="text-zinc-900" stroke={1.5} />
            <h1 className="font-bold text-zinc-900 tracking-tight text-lg">Đã Lưu</h1>
          </div>
          <div
            className="flex items-center gap-2 overflow-x-auto py-1 w-full min-w-0 sm:w-auto sm:justify-end"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-full pr-3 py-1.5 pl-1.5 shadow-sm transition-all hover:bg-zinc-100 hover:border-zinc-300">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-zinc-200 text-zinc-500 mr-2 shadow-sm">
                <IconBookmark size={14} stroke={1.5} />
              </div>
              <div className="font-semibold text-zinc-400 capitalize tracking-wide font-sans text-xs mr-2">Tài liệu đã lưu</div>
              <div className="font-bold text-zinc-900 text-sm leading-none tabular-nums">{documents.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">
        {/* List Section */}
        <div className={`transition-opacity duration-300 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"} animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100`}>
          {documents.length === 0 && !loading ? (
            <div className="text-center py-24 rounded-2xl bg-white border border-zinc-200 shadow-sm">
              <IconListSearch size={40} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
              <h5 className="text-[15px] font-medium text-zinc-900 mb-2">Bạn chưa lưu tài liệu nào.</h5>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group p-5"
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
      </div>
    </div>
  );
}
