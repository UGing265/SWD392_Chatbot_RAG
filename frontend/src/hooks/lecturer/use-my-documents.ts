import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface Document {
  id: string;
  title: string;
  description: string | null;
  subject_name: string | null;
  academic_term_name: string | null;
  visibility: string;
  status: string;
  created_at: string;
  slug?: string;
}

export function useMyDocuments() {
  const pathname = usePathname();
  const router = useRouter();
  const role = pathname.split("/")[1] || "student";
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "subject" | "term">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const useMockData = () => {
    const mockDocuments: Document[] = [
      {
        id: "1",
        title: "Giáo trình Lập trình Web - Chương 1",
        description: "Giới thiệu về HTML, CSS và JavaScript cơ bản",
        subject_name: "Lập trình Web",
        academic_term_name: "HK1 2024-2025",
        visibility: "private",
        status: "completed",
        created_at: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        title: "Bài giảng Cơ sở dữ liệu - Chương 3",
        description: "SQL và các câu truy vấn cơ bản",
        subject_name: "Cơ sở dữ liệu",
        academic_term_name: "HK1 2024-2025",
        visibility: "private",
        status: "completed",
        created_at: "2024-01-20T14:00:00Z",
      },
      {
        id: "3",
        title: "Tài liệu ôn thi Toán cao cấp",
        description: "Tổng hợp các bài tập và lý thuyết",
        subject_name: "Toán cao cấp",
        academic_term_name: "HK2 2024-2025",
        visibility: "public",
        status: "completed",
        created_at: "2024-02-01T09:15:00Z",
      },
    ];
    setDocuments(mockDocuments);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/documents/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        const errText = await response.text();
        console.warn("Failed to fetch documents:", response.status, errText);
        useMockData();
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const sortedDocuments = [...documents].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "date") {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortBy === "subject") {
      comparison = (a.subject_name || "").localeCompare(b.subject_name || "");
    } else if (sortBy === "term") {
      comparison = (a.academic_term_name || "").localeCompare(b.academic_term_name || "");
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const filteredDocuments = sortedDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/documents/${docId}/delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return {
    role,
    router,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    documents: filteredDocuments,
    handleDelete,
    refresh: fetchDocuments,
  };
}
