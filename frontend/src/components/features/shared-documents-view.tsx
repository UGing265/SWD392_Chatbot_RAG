"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Eye,
  FileText,
  Globe,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

interface DocumentListItem {
  id: string;
  slug: string;
  title: string;
  preview_text?: string;
  description?: string | null;
  subject_name?: string | null;
  academic_term_name?: string | null;
  owner_email?: string | null;
  document_type_name?: string | null;
  visibility: string;
  status?: string;
  chunk_count?: number;
  view_count?: number;
  created_at: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getPreview(doc: DocumentListItem) {
  return doc.preview_text || doc.description || "";
}

export function SharedDocumentsView() {
  const pathname = usePathname();
  const router = useRouter();
  const role = pathname.split("/")[1] || "student";
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDocuments = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: "1",
        pageSize: "12",
        sortBy: "date_desc",
      });

      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }

      const response = await fetch(`${API_BASE_URL}/api/documents?${params.toString()}`, {
        headers: getAuthHeaders(),
        signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Không thể tải danh sách tài liệu.");
      }

      const data = await response.json();
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Failed to fetch shared documents:", err);
      setDocuments([]);
      setError(err instanceof Error ? err.message : "Không thể tải danh sách tài liệu.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchDocuments(controller.signal);
    }, searchQuery.trim() ? 250 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [fetchDocuments, searchQuery]);

  const filteredDocuments = useMemo(() => documents, [documents]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto max-w-6xl p-6 py-12">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent">
                Tài liệu chung
              </h1>
              <p className="text-muted-foreground">Tài liệu giảng viên đã tải lên cho sinh viên</p>
            </div>
          </div>
        </div>

        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 delay-100 duration-500">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm tài liệu công khai..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 rounded-2xl border-gray-200 pl-12 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          {error && (
            <p className="mt-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 animate-in fade-in duration-500">
            <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="py-20 text-center animate-in fade-in duration-500">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              {searchQuery ? "Không tìm thấy tài liệu nào" : "Chưa có tài liệu công khai nào"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Thử từ khóa khác" : "Tài liệu giáo viên tải lên sẽ hiển thị ở đây sau khi xử lý xong"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 delay-200 duration-500 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <article
                key={doc.id}
                onClick={() => router.push(`/${role}/documents/${doc.slug || doc.id}`)}
                className="group cursor-pointer rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-green-200 hover:shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                    <Globe className="h-3 w-3" />
                    {doc.visibility === "school_wide" ? "Toàn trường" : "Công khai"}
                  </span>
                </div>

                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-green-600">
                  {doc.title}
                </h3>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <span className="truncate">{doc.subject_name || "Chưa có môn học"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="truncate">{doc.academic_term_name || "Chưa có kỳ học"}</span>
                  </div>
                </div>

                {getPreview(doc) && (
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">{getPreview(doc)}</p>
                )}

                <div className="mb-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <span className="truncate text-xs text-gray-400">
                    {doc.owner_email ? `Đăng bởi: ${doc.owner_email}` : "Giảng viên"}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="h-10 w-full gap-2 rounded-xl border-green-200 text-green-700 transition-colors hover:border-green-300 hover:bg-green-50"
                >
                  <Eye className="h-4 w-4" />
                  Xem tài liệu
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
