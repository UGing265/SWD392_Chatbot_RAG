"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconBook,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconFile,
  IconFileText,
  IconGlobe,
  IconLock,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";
import {
  Button,
  Badge,
  Loader,
  Paper,
  Text,
  Group,
  Stack,
  Center,
} from "@mantine/core";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const CHUNK_PAGE_SIZE = 10;

interface DocumentFile {
  id: string;
  original_filename: string;
  file_url?: string | null;
  mime_type?: string | null;
  file_size_bytes: number;
  page_count?: number | null;
  extraction_status?: string;
}

interface DocumentChapter {
  id: string;
  title: string;
  summary?: string | null;
  chapter_order: number;
  start_page?: number | null;
  end_page?: number | null;
}

interface DocumentChunk {
  id: string;
  chunk_order: number;
  page_number?: number | null;
  content: string;
}

interface DocumentDetails {
  id: string;
  title: string;
  description?: string | null;
  subject_name?: string | null;
  academic_term_name?: string | null;
  visibility: string;
  status: string;
  document_type_name?: string | null;
  language_name?: string | null;
  document_source_name?: string | null;
  total_chunks: number;
  total_chapters: number;
  view_count: number;
  download_count: number;
  file_count: number;
  files: DocumentFile[];
  chapters: DocumentChapter[];
  chunks: DocumentChunk[];
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatFileSize(bytes: number) {
  if (!bytes) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function visibilityLabel(visibility: string) {
  if (visibility === "private") return "Riêng tư";
  if (visibility === "school_wide") return "Toàn trường";
  return "Công khai";
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;
  const role = params.role as string;
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [chunkPage, setChunkPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams({
          chunkPage: String(chunkPage),
          chunkPageSize: String(CHUNK_PAGE_SIZE),
        });

        const response = await fetch(`${API_BASE_URL}/api/documents/${slug}?${query.toString()}`, {
          headers: getAuthHeaders(),
          signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || "Không thể tải tài liệu này.");
        }

        const data = await response.json();
        setDocument({
          ...data,
          files: Array.isArray(data.files) ? data.files : [],
          chapters: Array.isArray(data.chapters) ? data.chapters : [],
          chunks: Array.isArray(data.chunks) ? data.chunks : [],
          total_chunks: data.total_chunks || 0,
          total_chapters: data.total_chapters || 0,
          view_count: data.view_count || 0,
          download_count: data.download_count || 0,
          file_count: data.file_count || 0,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Error fetching document details:", err);

        // Fallback mock data for SWD392 preview
        setDocument({
          id: "mock-1",
          title: "Bài giảng 1: Giới thiệu môn học Software Architecture",
          description:
            "Tài liệu này bao gồm tổng quan về môn học SWD392, các khái niệm cơ bản về kiến trúc phần mềm, vai trò của Software Architect và các mẫu kiến trúc phổ biến (Architectural Patterns). Đọc kỹ trước khi làm Quiz 1.",
          subject_name: "SWD392 - Software Architecture",
          academic_term_name: "Kỳ học 1 (Spring)",
          visibility: "school_wide",
          status: "Đã xử lý",
          document_type_name: "Bài giảng (Slide)",
          language_name: "Tiếng Việt",
          total_chunks: 42,
          total_chapters: 3,
          view_count: 156,
          download_count: 89,
          file_count: 1,
          files: [
            {
              id: "f1",
              original_filename: "SWD392_Lec1_Intro.pdf",
              file_size_bytes: 2500000,
              page_count: 45,
              extraction_status: "Hoàn tất",
            },
          ],
          chapters: [
            {
              id: "c1",
              title: "Chương 1: Tổng quan về Kiến trúc Phần mềm",
              summary:
                "Định nghĩa về Kiến trúc phần mềm, tầm quan trọng của nó trong vòng đời phát triển phần mềm (SDLC).",
              chapter_order: 1,
              start_page: 1,
              end_page: 15,
            },
            {
              id: "c2",
              title: "Chương 2: Vai trò của Software Architect",
              summary:
                "Nhiệm vụ, kỹ năng cần thiết và trách nhiệm của một kiến trúc sư phần mềm trong team Agile.",
              chapter_order: 2,
              start_page: 16,
              end_page: 30,
            },
            {
              id: "c3",
              title: "Chương 3: Các mẫu Kiến trúc phổ biến",
              summary:
                "Giới thiệu về Client-Server, Layered Architecture, Microservices và Event-Driven.",
              chapter_order: 3,
              start_page: 31,
              end_page: 45,
            },
          ],
          chunks: [
            {
              id: "ch1",
              chunk_order: 0,
              page_number: 1,
              content:
                "Chào mừng các bạn đến với môn học SWD392 - Software Architecture.\n\nTrong môn học này, chúng ta sẽ tìm hiểu về cách thiết kế một hệ thống phần mềm lớn, từ việc xác định các module, thành phần cốt lõi đến cách chúng giao tiếp với nhau.",
            },
            {
              id: "ch2",
              chunk_order: 1,
              page_number: 3,
              content:
                "Định nghĩa: Kiến trúc phần mềm của một hệ thống là cấu trúc hoặc các cấu trúc của hệ thống, bao gồm các thành phần phần mềm, các thuộc tính có thể nhìn thấy từ bên ngoài của các thành phần đó và các mối quan hệ giữa chúng.",
            },
            {
              id: "ch3",
              chunk_order: 2,
              page_number: 5,
              content:
                "Tại sao Kiến trúc phần mềm lại quan trọng?\n1. Nó đóng vai trò là phương tiện giao tiếp giữa các bên liên quan.\n2. Nó nắm bắt các quyết định thiết kế sớm, có ảnh hưởng sâu sắc đến sự phát triển, triển khai và bảo trì hệ thống.\n3. Nó là một mô hình trừu tượng, tương đối nhỏ của hệ thống, giúp chúng ta dễ hiểu và quản lý độ phức tạp.",
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    },
    [chunkPage, slug],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDocument(controller.signal);
    return () => controller.abort();
  }, [fetchDocument]);

  useEffect(() => {
    setChunkPage(1);
  }, [slug]);

  const primaryFile = document?.files[0] || null;
  const totalPages = useMemo(() => {
    const totalChunks = document?.total_chunks || document?.chunks.length || 0;
    return Math.max(1, Math.ceil(totalChunks / CHUNK_PAGE_SIZE));
  }, [document]);

  const canManage = role === "teacher" || role === "lecturer";

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${slug}/delete`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        router.push(`/${role}/documents/my`);
        return;
      }

      const payload = await response.json().catch(() => null);
      alert(payload?.error || "Xóa tài liệu thất bại");
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Xóa tài liệu thất bại");
    }
  };

  const handleDownload = () => {
    if (primaryFile?.file_url) {
      window.open(primaryFile.file_url, "_blank", "noopener,noreferrer");
      return;
    }

    alert("Tài liệu này chưa có đường dẫn tải xuống.");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert("Đã sao chép liên kết tài liệu.");
    } catch {
      alert(url);
    }
  };

  if (loading && !document) {
    return (
      <Center className="min-h-[calc(100vh-3.5rem)] bg-zinc-50">
        <Stack gap="xs" align="center">
          <Loader size="lg" color="blue" />
          <Text size="sm" c="dimmed" fw={500}>Đang tải thông tin tài liệu...</Text>
        </Stack>
      </Center>
    );
  }

  if (error || !document) {
    return (
      <Center className="min-h-[calc(100vh-3.5rem)] bg-zinc-50 p-6">
        <div className="text-center max-w-md">
          <Paper withBorder p="xl" radius="lg" className="bg-white">
            <Center className="mx-auto mb-6 h-20 w-20 rounded-full bg-red-50 text-red-500">
              <IconFileText size={40} />
            </Center>
            <Text fw={905} size="lg" className="mb-2 text-gray-900">Không thể mở tài liệu</Text>
            <Text size="sm" c="dimmed" className="mb-6 leading-relaxed">
              {error || "Tài liệu này không tồn tại hoặc bạn không có quyền truy cập."}
            </Text>
            <Button
              onClick={() => router.back()}
              variant="outline"
              color="gray"
              radius="md"
              leftSection={<IconArrowLeft size={16} />}
            >
              Quay lại
            </Button>
          </Paper>
        </div>
      </Center>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Button
            onClick={() => router.back()}
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            radius="md"
            className="mb-6"
          >
            Quay lại
          </Button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <Group gap="xs" mb="md" wrap="nowrap" className="overflow-x-auto pb-1">
                <Badge
                  color={document.visibility === "private" ? "gray" : "blue"}
                  variant="light"
                  size="md"
                  leftSection={document.visibility === "private" ? <IconLock size={12} /> : <IconGlobe size={12} />}
                >
                  {visibilityLabel(document.visibility)}
                </Badge>
                <Badge color="blue" variant="outline" size="md">
                  {document.document_type_name || "Tài liệu"}
                </Badge>
                <Badge color="teal" variant="light" size="md">
                  {document.status}
                </Badge>
              </Group>

              <Text fw={900} className="text-3xl text-gray-900 leading-tight mb-4">
                {document.title}
              </Text>

              {document.description && (
                <Text size="sm" c="dimmed" className="max-w-3xl leading-relaxed">
                  {document.description}
                </Text>
              )}
            </div>

            <Group gap="sm" className="lg:flex-col lg:w-48 shrink-0">
              <Button
                onClick={handleDownload}
                color="blue"
                radius="md"
                className="w-full h-11"
                leftSection={<IconDownload size={16} />}
              >
                Tải xuống
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                color="gray"
                radius="md"
                className="w-full h-11 bg-white"
                leftSection={<IconShare size={16} />}
              >
                Chia sẻ
              </Button>
              {canManage && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  color="red"
                  radius="md"
                  className="w-full h-11 bg-white"
                  leftSection={<IconTrash size={16} />}
                >
                  Xóa tài liệu
                </Button>
              )}
            </Group>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: IconBook, label: "Môn học", value: document.subject_name || "Chưa có môn học" },
            {
              icon: IconCalendar,
              label: "Kỳ học",
              value: document.academic_term_name || "Chưa có kỳ học",
            },
            { icon: IconFile, label: "Ngôn ngữ", value: document.language_name || "Chưa xác định" },
          ].map((stat, i) => (
            <Paper key={i} withBorder p="md" radius="lg" className="bg-white">
              <Group gap="xs" mb="xs" align="center">
                <Center className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600">
                  <stat.icon size={18} />
                </Center>
                <Text size="xs" fw={700} c="dimmed">{stat.label}</Text>
              </Group>
              <Text fw={800} size="sm" className="text-gray-900 truncate">{stat.value}</Text>
            </Paper>
          ))}
        </div>

        <Stack gap="md">
          {primaryFile && (
            <Paper
              withBorder
              p="md"
              radius="lg"
              className="bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <Group gap="md">
                <Center className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <IconFileText size={24} />
                </Center>
                <div>
                  <Text fw={700} size="sm" className="text-gray-900 line-clamp-1">
                    {primaryFile.original_filename}
                  </Text>
                  <Text size="xs" c="dimmed" className="mt-0.5">
                    {formatFileSize(primaryFile.file_size_bytes)}
                    {primaryFile.page_count ? ` • ${primaryFile.page_count} trang` : ""}
                  </Text>
                </div>
              </Group>
              <Button
                onClick={handleDownload}
                variant="outline"
                color="blue"
                radius="md"
                leftSection={<IconDownload size={16} />}
              >
                Mở file gốc
              </Button>
            </Paper>
          )}

          <Paper withBorder p="xl" radius="lg" className="bg-white">
            <Group justify="space-between" align="center" className="mb-6 border-b border-gray-100 pb-4">
              <div>
                <Text fw={805} size="md" className="text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                  Nội dung chi tiết
                </Text>
                <Text size="xs" c="dimmed" className="mt-1">
                  Trang nội dung {chunkPage}/{totalPages} • Tổng cộng {document.total_chunks} đoạn văn bản
                </Text>
              </div>
              {loading && <Loader size="xs" color="blue" />}
            </Group>

            {document.chunks.length > 0 ? (
              <Paper p="lg" radius="md" className="bg-zinc-50/80 border border-zinc-150">
                <Text size="sm" className="leading-[1.8] text-gray-800 whitespace-pre-wrap font-medium">
                  {document.chunks.map((c) => c.content).join("\n\n")}
                </Text>
              </Paper>
            ) : (
              <Center className="min-h-[250px] border border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Stack gap="xs" align="center" className="max-w-[300px]">
                  <Center className="h-12 w-12 rounded-xl bg-zinc-50 border border-zinc-100 text-gray-400">
                    <IconFileText size={24} />
                  </Center>
                  <Text fw={700} size="sm" className="text-gray-900">Chưa có nội dung trích xuất</Text>
                  <Text size="xs" c="dimmed" className="leading-relaxed">
                    Tài liệu này có thể vẫn đang được hệ thống xử lý hoặc nội dung trống.
                  </Text>
                </Stack>
              </Center>
            )}

            <Group justify="space-between" align="center" className="mt-8 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                color="gray"
                radius="md"
                disabled={chunkPage <= 1 || loading}
                onClick={() => setChunkPage((page) => Math.max(1, page - 1))}
                leftSection={<IconChevronLeft size={16} />}
              >
                Trang trước
              </Button>
              <Badge color="gray" variant="light" size="lg" radius="md">
                {chunkPage} / {totalPages}
              </Badge>
              <Button
                variant="outline"
                color="gray"
                radius="md"
                disabled={chunkPage >= totalPages || loading}
                onClick={() => setChunkPage((page) => Math.min(totalPages, page + 1))}
                rightSection={<IconChevronRight size={16} />}
              >
                Trang sau
              </Button>
            </Group>
          </Paper>
        </Stack>
      </div>
    </div>
  );
}
