"use client";
import { useDashboard } from "@/hooks/admin/use-dashboard";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconDatabase,
  IconFileText,
  IconLayoutDashboard,
  IconRefresh,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";

const statusConfig = {
  completed: { label: "Hoạt động", color: "green" },
  pending: { label: "Đang xử lý", color: "yellow" },
  processing: { label: "Đang xử lý", color: "blue" },
  failed: { label: "Thất bại", color: "red" },
  rejected: { label: "Bị từ chối", color: "red" },
} as const;

type RecentDocument = {
  id: string;
  title: string;
  owner_name?: string | null;
  owner_email?: string | null;
  created_at?: string | null;
  status?: string | null;
};

export function AdminDashboardView() {
  const { stats, recentDocs, loading, refresh } = useDashboard();

  const metrics = [
    {
      label: "Tổng Người Dùng",
      value: stats.totalUsers.toString(),
      icon: IconUsers,
      description: "Tài khoản đăng ký hệ thống",
    },
    {
      label: "Tài Liệu Học Tập",
      value: stats.totalDocuments.toString(),
      icon: IconDatabase,
      description: "Tài liệu đã tải lên",
    },
    {
      label: "Vector Embeddings",
      value: stats.totalEmbeddings.toString(),
      icon: IconShieldCheck,
      description: "Đoạn văn bản đã nhúng RAG",
    },
    {
      label: "Tài Liệu Bị Báo Cáo",
      value: stats.totalReports.toString(),
      icon: IconAlertCircle,
      description: "Cần kiểm duyệt",
      isWarning: stats.totalReports > 0,
    },
  ];

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <IconLayoutDashboard size={20} stroke={1.5} className="text-zinc-900" />
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
              Bảng Điều Khiển
            </h1>
          </div>
          <Button
            onClick={refresh}
            variant="default"
            size="xs"
            radius="md"
            leftSection={<IconRefresh size={14} />}
            className="!h-8 !text-[12px] !px-4 !font-semibold !rounded-lg"
          >
            Làm Mới
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size="md" color="dark" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="group bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                        {metric.label}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all duration-300">
                        <Icon size={16} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[28px] font-black text-zinc-950 leading-none tracking-tight">
                        {metric.value}
                      </span>
                      {metric.isWarning && (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.55)]" />
                      )}
                    </div>
                    <span className="text-[12px] font-medium text-zinc-500">
                      {metric.description}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Recent Documents Table */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-zinc-900 mb-0.5">
                    Tài Liệu Mới Tải Lên
                  </h2>
                  <p className="text-[12px] text-zinc-500 font-medium">
                    Các tài liệu mới nhất trong hệ thống RAG
                  </p>
                </div>
                <Badge color="dark" variant="light" radius="xl" className="font-mono tracking-widest">
                  {recentDocs.length} tài liệu
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: 700 }}>
                  <thead>
                    <tr className="bg-zinc-50/80 border-b border-zinc-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                        Tài Liệu
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                        Giảng Viên
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                        Trạng Thái
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                        Ngày Cập Nhật
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDocs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-sm text-zinc-500">
                          Chưa có tài liệu nào trong hệ thống
                        </td>
                      </tr>
                    ) : (
                      recentDocs.map((doc: RecentDocument) => {
                        const statusKey =
                          doc.status && doc.status in statusConfig
                            ? (doc.status as keyof typeof statusConfig)
                            : "completed";
                        const status = statusConfig[statusKey];

                        return (
                          <tr key={doc.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                                  <IconFileText size={14} className="text-zinc-500" />
                                </div>
                                <span className="text-[13px] font-semibold text-zinc-900 truncate max-w-[200px]">
                                  {doc.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="text-[13px] font-medium text-zinc-600">
                                {doc.owner_name || doc.owner_email || "Không rõ"}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-1 rounded-md whitespace-nowrap ${
                                status.color === "green" ? "bg-emerald-50 text-emerald-600" :
                                status.color === "yellow" ? "bg-amber-50 text-amber-600" :
                                status.color === "blue" ? "bg-blue-50 text-blue-600" :
                                "bg-red-50 text-red-600"
                              }`}>
                                <div className={`rounded-full w-1.5 h-1.5 ${
                                  status.color === "green" ? "bg-emerald-500" :
                                  status.color === "yellow" ? "bg-amber-500" :
                                  status.color === "blue" ? "bg-blue-500" :
                                  "bg-red-500"
                                }`} />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="text-[12px] text-zinc-500 font-mono tracking-wider">
                                {doc.created_at
                                  ? new Date(doc.created_at).toLocaleDateString("vi-VN")
                                  : "-"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
