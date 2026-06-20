"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBook,
  IconCalendar,
  IconEye,
  IconFileText,
  IconWorld,
  IconSearch,
  IconChevronRight,
  IconFolderOpen,
} from "@tabler/icons-react";
import {
  TextInput,
  Button,
  Loader,
  Badge,
  Text,
  Paper,
  Group,
  Stack,
} from "@mantine/core";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTerm, setSelectedTerm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null);

  // Mock data for UI structure
  const terms = [
    { id: "t1", name: "Kỳ học 1 (Spring)" },
    { id: "t2", name: "Kỳ học 2 (Summer)" },
    { id: "t3", name: "Kỳ học 3 (Fall)" },
  ];

  const subjects = [
    { id: "s1", name: "SWD392 - Software Architecture", termId: "t1" },
    { id: "s2", name: "PRJ301 - Java Web", termId: "t1" },
    { id: "s3", name: "PRU211 - C# .NET", termId: "t2" },
    { id: "s4", name: "DBI202 - Database Systems", termId: "t3" },
  ];

  const fetchDocuments = useCallback(
    async (signal?: AbortSignal) => {
      if (!selectedTerm || !selectedSubject) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: "1",
          pageSize: "12",
          sortBy: "date_desc",
          term: selectedTerm.id,
          subject: selectedSubject.id,
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
        const docs = Array.isArray(data.documents) ? data.documents : [];

        // Inject mock data if empty (for preview purposes)
        if (docs.length === 0 && selectedSubject?.id === "s1") {
          setDocuments([
            {
              id: "doc-1",
              slug: "bai-giang-1",
              title: "Bài giảng 1: Giới thiệu môn học",
              preview_text: "Tổng quan về môn học và phương pháp đánh giá.",
              subject_name: selectedSubject.name,
              academic_term_name: selectedTerm.name,
              visibility: "school_wide",
              created_at: new Date().toISOString(),
            },
          ]);
        } else {
          setDocuments(docs);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to fetch shared documents:", err);
        // Fallback mock data if API fails
        if (selectedSubject?.id === "s1") {
          setDocuments([
            {
              id: "doc-1",
              slug: "bai-giang-1",
              title: "Bài giảng 1: Giới thiệu môn học",
              preview_text: "Tổng quan về môn học và phương pháp đánh giá.",
              subject_name: selectedSubject.name,
              academic_term_name: selectedTerm.name,
              visibility: "school_wide",
              created_at: new Date().toISOString(),
            },
          ]);
        } else {
          setDocuments([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, selectedTerm, selectedSubject],
  );

  useEffect(() => {
    if (!selectedTerm || !selectedSubject) return;
    const controller = new AbortController();
    const timer = window.setTimeout(
      () => {
        fetchDocuments(controller.signal);
      },
      searchQuery.trim() ? 250 : 0,
    );

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [fetchDocuments, searchQuery, selectedTerm, selectedSubject]);

  const filteredDocuments = useMemo(() => documents, [documents]);

  const handleBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
    } else if (selectedTerm) {
      setSelectedTerm(null);
    }
    setSearchQuery("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#000000] overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full px-6 py-10">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <Group justify="space-between" align="center" className="mb-4">
            <Group gap="md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600/20 text-teal-400 shadow-lg border border-teal-500/20">
                <IconFolderOpen size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-teal-400">Tài liệu chung</h1>
                <Group gap="xs" className="text-sm font-semibold text-white/70 mt-1">
                  <span
                    className={`cursor-pointer hover:text-white transition-colors ${!selectedTerm ? "text-white/80" : ""}`}
                    onClick={() => {
                      setSelectedTerm(null);
                      setSelectedSubject(null);
                    }}
                  >
                    Tất cả kỳ học
                  </span>

                  {selectedTerm && (
                    <>
                      <IconChevronRight size={14} />
                      <span
                        className={`cursor-pointer hover:text-white transition-colors ${!selectedSubject ? "text-white/80" : ""}`}
                        onClick={() => setSelectedSubject(null)}
                      >
                        {selectedTerm.name}
                      </span>
                    </>
                  )}

                  {selectedSubject && (
                    <>
                      <IconChevronRight size={14} />
                      <span className="text-white/80">{selectedSubject.name}</span>
                    </>
                  )}
                </Group>
              </div>
            </Group>

            {(selectedTerm || selectedSubject) && (
              <Button
                variant="outline"
                color="gray"
                onClick={handleBack}
                radius="md"
                styles={{
                  root: { borderColor: "rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.6)" }
                }}
              >
                Quay lại
              </Button>
            )}
          </Group>
        </div>

        {/* Level 1: Select Term (flat, no year grouping) */}
        {!selectedTerm ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="grid gap-4 md:grid-cols-3">
              {terms.map((term) => (
                <Paper
                  key={term.id}
                  withBorder
                  p="xl"
                  radius="lg"
                  onClick={() => {
                    setSelectedTerm(term);
                  }}
                  className="cursor-pointer border-white/5 hover:border-teal-400/50 hover:shadow-md transition-all group !bg-[#0d0d0d]"
                >
                  <Group gap="md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors border border-white/5">
                      <IconFolderOpen size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
                        {term.name}
                      </h3>
                      <Text size="xs" className="mt-0.5 text-white/90">Bấm để chọn kỳ học</Text>
                    </div>
                  </Group>
                </Paper>
              ))}
            </div>
          </div>
        ) : !selectedSubject ? (
          /* Level 2: Select Subject */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Group gap="xs" mb="md">
              <IconBook size={20} className="text-teal-400" />
              <h2 className="text-lg font-bold text-white/90">
                Chọn Môn Học
              </h2>
            </Group>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjects
                .filter((s) => s.termId === selectedTerm.id)
                .map((subject) => (
                  <Paper
                    key={subject.id}
                    withBorder
                    p="xl"
                    radius="lg"
                    onClick={() => setSelectedSubject(subject)}
                    className="cursor-pointer border-white/5 hover:border-teal-400/50 hover:shadow-md transition-all group !bg-[#0d0d0d]"
                  >
                    <Group gap="md">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors border border-white/5">
                        <IconBook size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-2">
                          {subject.name}
                        </h3>
                        <Text size="xs" className="mt-1 text-white/90">Bấm để xem tài liệu</Text>
                      </div>
                    </Group>
                  </Paper>
                ))}
              {subjects.filter((s) => s.termId === selectedTerm.id).length === 0 && (
                <div className="col-span-full py-12 text-center bg-[#111111] rounded-2xl border border-dashed border-white/10">
                  <Text className="text-white/70">Chưa có môn học nào trong kỳ này.</Text>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Level 3: Documents List */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="mb-6 relative">
              <TextInput
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                radius="md"
                size="md"
                leftSection={<IconSearch size={18} className="text-white/70" />}
                styles={{
                  input: {
                    backgroundColor: "#111111",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                  },
                }}
              />
            </div>
            {error && <Text color="red" size="sm" mb="md" fw={500}>{error}</Text>}

            {loading ? (
              <div className="flex items-center justify-center py-20 animate-in fade-in duration-500">
                <Loader size="lg" color="teal" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="py-20 text-center bg-[#111111] rounded-[2rem] border border-white/5 shadow-sm animate-in fade-in duration-500">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/2 border border-white/5">
                  <IconFileText size={40} className="text-white/20" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white/90">
                  {searchQuery ? "Không tìm thấy tài liệu nào" : "Chưa có tài liệu nào"}
                </h3>
                <Text className="text-white/70 font-medium">
                  {searchQuery
                    ? "Hãy thử một từ khóa khác."
                    : "Giảng viên chưa tải lên tài liệu cho môn học này."}
                </Text>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 delay-200 duration-500">
                {filteredDocuments.map((doc) => (
                  <Paper
                    key={doc.id}
                    onClick={() => router.push(`/${role}/documents/${doc.slug || doc.id}`)}
                    withBorder
                    p="lg"
                    radius="lg"
                    className="group cursor-pointer border-white/5 hover:shadow-xl hover:border-teal-500/40 hover:-translate-y-1 transition-all duration-300 bg-[#111111]"
                  >
                    <Group justify="space-between" align="start" mb="md">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-teal-400 transition-colors group-hover:bg-teal-600 group-hover:text-white border border-white/5">
                        <IconFileText size={28} />
                      </div>
                      <Badge
                        color="teal"
                        variant="filled"
                        radius="md"
                        py="sm"
                        leftSection={<IconWorld size={12} />}
                      >
                        {doc.visibility === "school_wide" ? "Toàn trường" : "Công khai"}
                      </Badge>
                    </Group>

                    <Text fw={700} size="md" className="mb-3 line-clamp-2 text-white/90 group-hover:text-teal-400 transition-colors">
                      {doc.title}
                    </Text>

                    {getPreview(doc) && (
                      <Text size="sm" className="mb-5 line-clamp-2 leading-relaxed text-white/80">
                        {getPreview(doc)}
                      </Text>
                    )}

                    <Group
                      justify="space-between"
                      align="center"
                      className="mt-auto pt-4"
                      style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}
                    >
                      <Text size="xs" className="truncate max-w-[150px] text-white/70">
                        {doc.owner_email ? `Bởi: ${doc.owner_email}` : "Bởi: Giảng viên"}
                      </Text>
                      <Text size="xs" className="text-white/70">
                        {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
