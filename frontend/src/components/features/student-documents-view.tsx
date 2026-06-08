"use client";

import { useState } from "react";
import { LayoutGrid, List, FileText, Brain, FileType2, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const subjects = ["Tất cả môn học", "Học máy", "Sinh học", "Khoa học máy tính"];

const documents = [
  {
    id: "1",
    title: "Cơ bản về Mạng Nơ-ron",
    desc: "Bài giảng tuần 3-5.",
    size: "2.4 MB",
    type: "PDF",
    icon: Brain,
    iconColor: "text-blue-500",
    bgIcon: "bg-blue-100",
    dateAdded: "24 Thg 10, 2023",
  },
  {
    id: "2",
    title: "Hô hấp tế bào và Quang hợp",
    desc: "Tài liệu hướng dẫn và sơ đồ.",
    size: "1.1 MB",
    type: "DOCX",
    icon: FileType2,
    iconColor: "text-green-500",
    bgIcon: "bg-green-100",
    dateAdded: "20 Thg 10, 2023",
  },
  {
    id: "3",
    title: "Tối ưu hóa Gradient Descent",
    desc: "Phân tích bài nghiên cứu.",
    size: "4.5 MB",
    type: "PDF",
    icon: Brain,
    iconColor: "text-purple-500",
    bgIcon: "bg-purple-100",
    dateAdded: "18 Thg 10, 2023",
  },
  {
    id: "4",
    title: "Nhập môn Di truyền học",
    desc: "Tài liệu đọc chương 4.",
    size: "3.2 MB",
    type: "PDF",
    icon: FileText,
    iconColor: "text-orange-500",
    bgIcon: "bg-orange-100",
    dateAdded: "15 Thg 10, 2023",
  },
];

export function StudentDocumentsView() {
  const [activeSubject, setActiveSubject] = useState("Tất cả môn học");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tài liệu môn học</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Xem và truy cập các tài liệu học tập được giảng viên cung cấp.
          </p>
        </div>
        <div className="flex rounded-lg border border-border p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold",
              viewMode === "grid" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Dạng lưới
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold",
              viewMode === "list" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
            Dạng danh sách
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubject(sub)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeSubject === sub
                ? "bg-[#3e8ced] text-white"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {sub}
          </button>
        ))}
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.id}
                className="group relative flex flex-col rounded-2xl border border-border/60 bg-white p-5 shadow-soft transition-all hover:shadow-md hover:border-[#3e8ced]/30"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      doc.bgIcon
                    )}
                  >
                    <Icon className={cn("h-5 w-5", doc.iconColor)} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => setSelectedDoc(doc)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-[#3e8ced] hover:text-white transition-colors" title="Xem tài liệu">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-[#3e8ced] hover:text-white transition-colors" title="Tải xuống">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="mb-1 text-base font-bold leading-tight text-foreground line-clamp-2 group-hover:text-[#3e8ced] transition-colors">
                  {doc.title}
                </h3>
                <p className="mb-6 text-sm text-muted-foreground line-clamp-2">
                  {doc.desc}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="text-xs font-medium text-muted-foreground">
                    Đã thêm {doc.dateAdded}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                    {doc.type} • {doc.size}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-white shadow-soft overflow-hidden">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="border-b border-border/60 bg-muted/30 text-xs uppercase text-foreground/70">
              <tr>
                <th className="px-6 py-4 font-medium">Tên tài liệu</th>
                <th className="px-6 py-4 font-medium">Ngày thêm</th>
                <th className="px-6 py-4 font-medium">Kích thước</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {documents.map((doc) => {
                const Icon = doc.icon;
                return (
                  <tr key={doc.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", doc.bgIcon)}>
                          <Icon className={cn("h-4 w-4", doc.iconColor)} />
                        </div>
                        <div>
                          <div className="font-medium text-foreground group-hover:text-[#3e8ced] transition-colors">{doc.title}</div>
                          <div className="text-xs">{doc.desc}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{doc.dateAdded}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
                        {doc.type} • {doc.size}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => setSelectedDoc(doc)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-[#3e8ced] hover:text-white transition-colors" title="Xem tài liệu">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-[#3e8ced] hover:text-white transition-colors" title="Tải xuống">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.title}</DialogTitle>
            <DialogDescription>{selectedDoc?.desc}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 rounded-md border bg-muted/10 flex items-center justify-center p-4">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-foreground">Nội dung tài liệu sẽ hiển thị ở đây</p>
              <p className="text-sm text-muted-foreground">Tính năng xem file PDF/DOCX trực tiếp đang được phát triển.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
