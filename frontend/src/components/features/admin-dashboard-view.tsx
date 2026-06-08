"use client";

import { useState } from "react";
import {
  Database,
  Users,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  FileText,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const metrics = [
  {
    label: "Tổng người dùng",
    value: "5",
    change: "+2",
    up: true,
    icon: Users,
    bar: 40,
  },
  {
    label: "Tài liệu học tập",
    value: "4",
    change: "+1",
    up: true,
    icon: Database,
    bar: 30,
  },
  {
    label: "Vector Embeddings",
    value: "287",
    change: "+42",
    up: true,
    icon: ShieldCheck,
    bar: 65,
  },
  {
    label: "Tài liệu bị báo cáo",
    value: "1",
    change: "0",
    up: false,
    icon: FileText,
    bar: 10,
    isWarning: true,
  },
];

const processedDocuments = [
  {
    id: "D-001",
    name: "GiaoTrinh_PRN222_Full.pdf",
    lecturer: "Nguyễn Văn Minh",
    size: "14.2 MB",
    status: "ĐÃ EMBED (142 CHUNKS)",
    updatedAt: "04/06/2026",
    type: "success",
  },
  {
    id: "D-002",
    name: "DeThiThu_PRN222_PE.docx",
    lecturer: "Nguyễn Văn Minh",
    size: "1.8 MB",
    status: "ĐÃ EMBED (12 CHUNKS)",
    updatedAt: "03/06/2026",
    type: "success",
  },
  {
    id: "D-003",
    name: "Slides_SWD392_Session05.pptx",
    lecturer: "Trần Thị Thu",
    size: "5.4 MB",
    status: "ĐÃ EMBED (38 CHUNKS)",
    updatedAt: "01/06/2026",
    type: "success",
  },
];

export function AdminDashboardView() {
  const [period, setPeriod] = useState<"1D" | "1W" | "1M">("1W");

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Hệ thống quản trị và Thống kê</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi hiệu suất hệ thống RAG và hoạt động tải lên tài liệu
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-white p-1">
          {(["1D", "1W", "1M"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{m.value}</p>
                </div>
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  m.isWarning ? "bg-rose-100/50" : "bg-primary/10"
                )}>
                  <Icon className={cn("h-5 w-5", m.isWarning ? "text-rose-500" : "text-primary")} />
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", m.isWarning ? "bg-rose-400" : "bg-primary/60")}
                  style={{ width: `${m.bar}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border/60 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Tiến trình hệ thống & Tài liệu mới tải lên</h2>
            <p className="text-xs text-muted-foreground">Danh sách các tài liệu đang được xử lý hoặc đã hoàn tất</p>
          </div>
          <button className="text-xs font-medium text-primary hover:underline">Xem tất cả</button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Tài liệu</TableHead>
              <TableHead>Giảng viên</TableHead>
              <TableHead>Kích thước</TableHead>
              <TableHead>Trạng thái bóc tách</TableHead>
              <TableHead>Ngày cập nhật</TableHead>
              <TableHead className="w-10 pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="pl-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                      <Database className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{doc.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-foreground">{doc.lecturer}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-semibold text-success-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {doc.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{doc.updatedAt}</TableCell>
                <TableCell className="pr-5">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <button className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pop transition-transform hover:scale-105">
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
