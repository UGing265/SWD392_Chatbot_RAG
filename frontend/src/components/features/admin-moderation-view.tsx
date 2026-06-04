"use client";

import { AlertTriangle, Trash2, CheckCircle, MoreVertical, FileWarning } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const reportedDocuments = [
  {
    id: "R-001",
    fileName: "Slides_SWD392_Session05.pptx",
    lecturer: "Trần Thị Thu",
    reporter: "trietlm@fpt.edu.vn",
    reason: "SLIDE BỊ LỖI HIỂN THỊ PHÔNG CHỮ Ở MỘT SỐ TRANG SAU.",
    subject: "SWD392",
  },
];

export function AdminModerationView() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Kiểm duyệt báo cáo tài liệu xấu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Phê duyệt hoặc loại bỏ các tài liệu bị báo cáo vi phạm nội dung hoặc kỹ thuật
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Danh sách tài liệu học tập bị sinh viên báo cáo lỗi (nội dung sai lệch, tài liệu trùng lặp, hoặc vi phạm bản quyền). 
            Quản trị viên cần phê duyệt để giữ lại hoặc xóa bỏ khỏi CSDL RAG.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/60">
              <TableHead className="pl-6 h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Tài liệu bị báo cáo
              </TableHead>
              <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Người báo cáo
              </TableHead>
              <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Lý do
              </TableHead>
              <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Môn học
              </TableHead>
              <TableHead className="pr-6 h-12 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportedDocuments.length > 0 ? (
              reportedDocuments.map((doc) => (
                <TableRow key={doc.id} className="group transition-colors hover:bg-muted/30">
                  <TableCell className="pl-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {doc.fileName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {doc.lecturer}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-sm text-muted-foreground">
                      {doc.reporter}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="inline-flex rounded-full bg-peach-soft px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-peach-foreground">
                      {doc.reason}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-sm font-medium text-foreground">
                      {doc.subject}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Bỏ qua báo cáo
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg bg-rose px-4 py-1.5 text-xs font-semibold text-white shadow-soft transition-all hover:opacity-90 active:scale-[0.98]">
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa vĩnh viễn
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
                      <FileWarning className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Không có báo cáo tài liệu nào cần xử lý
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
