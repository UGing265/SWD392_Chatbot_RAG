import { useState } from "react";
import { IconFileText, IconBrain } from "@tabler/icons-react";

export const subjects = ["Tất cả môn học", "Học máy", "Sinh học", "Khoa học máy tính"];

export const documents = [
  {
    id: "1",
    title: "Cơ bản về Mạng Nơ-ron",
    desc: "Bài giảng tuần 3-5.",
    size: "2.4 MB",
    type: "PDF",
    icon: IconBrain,
    iconColor: "blue",
    dateAdded: "24 Thg 10, 2023",
  },
  {
    id: "2",
    title: "Hô hấp tế bào và Quang hợp",
    desc: "Tài liệu hướng dẫn và sơ đồ.",
    size: "1.1 MB",
    type: "DOCX",
    icon: IconFileText,
    iconColor: "green",
    dateAdded: "20 Thg 10, 2023",
  },
  {
    id: "3",
    title: "Tối ưu hóa Gradient Descent",
    desc: "Phân tích bài nghiên cứu.",
    size: "4.5 MB",
    type: "PDF",
    icon: IconBrain,
    iconColor: "grape",
    dateAdded: "18 Thg 10, 2023",
  },
  {
    id: "4",
    title: "Nhập môn Di truyền học",
    desc: "Tài liệu đọc chương 4.",
    size: "3.2 MB",
    type: "PDF",
    icon: IconFileText,
    iconColor: "orange",
    dateAdded: "15 Thg 10, 2023",
  },
];

export function useStudentDocuments() {
  const [activeSubject, setActiveSubject] = useState("Tất cả môn học");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDoc, setSelectedDoc] = useState<(typeof documents)[0] | null>(null);

  const filteredDocuments = documents.filter((doc) => {
    if (activeSubject === "Tất cả môn học") return true;
    if (activeSubject === "Học máy" && doc.title.toLowerCase().includes("mạng nơ-ron")) return true;
    if (activeSubject === "Học máy" && doc.title.toLowerCase().includes("gradient descent")) return true;
    if (activeSubject === "Sinh học" && doc.title.toLowerCase().includes("hô hấp tế bào")) return true;
    if (activeSubject === "Sinh học" && doc.title.toLowerCase().includes("di truyền học")) return true;
    if (activeSubject === "Khoa học máy tính" && doc.title.toLowerCase().includes("mạng nơ-ron")) return true;
    return false;
  });

  return {
    activeSubject,
    setActiveSubject,
    viewMode,
    setViewMode,
    selectedDoc,
    setSelectedDoc,
    subjects,
    documents: filteredDocuments,
  };
}
