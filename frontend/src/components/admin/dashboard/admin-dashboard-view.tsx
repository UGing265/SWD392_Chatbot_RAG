"use client";

import { useDashboard } from "@/hooks/admin/use-dashboard";
import { Loader } from "@mantine/core";
import {
  IconUsers,
  IconDatabase,
  IconShieldCheck,
  IconAlertCircle,
  IconRefresh,
  IconFileText,
} from "@tabler/icons-react";

export function AdminDashboardView() {
  const { stats, recentDocs, loading, refresh } = useDashboard();

  const metrics = [
    {
      label: "Tổng người dùng",
      value: stats.totalUsers.toString(),
      icon: IconUsers,
      bg: "rgba(31, 108, 159, 0.08)",
      color: "#1F6C9F",
      description: "Tài khoản đăng ký hệ thống",
    },
    {
      label: "Tài liệu học tập",
      value: stats.totalDocuments.toString(),
      icon: IconDatabase,
      bg: "rgba(52, 101, 56, 0.08)",
      color: "#346538",
      description: "Tài liệu học tập đã tải lên",
    },
    {
      label: "Vector Embeddings",
      value: stats.totalEmbeddings.toString(),
      icon: IconShieldCheck,
      bg: "rgba(107, 33, 168, 0.08)",
      color: "#6B21A8",
      description: "Các đoạn văn bản đã nhúng RAG",
    },
    {
      label: "Tài liệu bị báo cáo",
      value: stats.totalReports.toString(),
      icon: IconAlertCircle,
      bg: stats.totalReports > 0 ? "rgba(159, 47, 45, 0.08)" : "rgba(120, 119, 116, 0.08)",
      color: stats.totalReports > 0 ? "#9F2F2D" : "#787774",
      description: "Cần quản trị viên kiểm duyệt",
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA] dark:border-[#333333]">
        <div className="flex flex-col gap-1">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-[#111111] dark:text-[#f8fafc]">
            Hệ thống quản trị & Thống kê
          </h1>
          <p className="text-sm text-[#787774] dark:text-[#94a3b8] font-sans font-normal">
            Theo dõi hiệu suất hệ thống RAG và hoạt động tải lên tài liệu học tập.
          </p>
        </div>
        <div>
          <button
            onClick={refresh}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-[#111111] hover:bg-[#222222] dark:bg-[#f8fafc] dark:hover:bg-[#e2e8f0] text-white dark:text-[#111111] font-sans font-medium text-sm rounded-xl transition-all active:scale-98 cursor-pointer border-0 shadow-none"
          >
            <IconRefresh size={16} strokeWidth={2.2} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="md" color="dark" />
        </div>
      ) : (
        <>
          {/* Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m) => {
              const Icon = m.icon;
              const isReported = m.label === "Tài liệu bị báo cáo" && stats.totalReports > 0;
              return (
                <div
                  key={m.label}
                  className={`border rounded-xl p-6 bg-white dark:bg-[#18181b] transition-all flex flex-col justify-between min-h-[160px] ${
                    isReported
                      ? "border-red-200 dark:border-red-950/40 hover:border-red-300 dark:hover:border-red-900"
                      : "border-[#EAEAEA] dark:border-[#333333] hover:border-[#CCCCCC] dark:hover:border-[#555555]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] text-[#787774] dark:text-[#94a3b8] font-sans tracking-wider uppercase font-semibold">
                      {m.label}
                    </span>
                    <div className="w-9 h-9 rounded-xl border border-border flex items-center justify-center shrink-0 text-[#787774] dark:text-[#94a3b8] bg-[#FCFCFB] dark:bg-[#1c1c21]">
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-3xl font-normal font-sans tracking-tight text-[#111111] dark:text-[#f8fafc]">
                      {m.value}
                    </span>
                    {isReported && (
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    )}
                  </div>

                  <p className="text-[12px] text-[#787774] dark:text-[#94a3b8] mt-3 font-sans font-normal leading-relaxed">
                    {m.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recent Documents Table Section */}
          <div className="border border-[#EAEAEA] dark:border-[#333333] rounded-xl bg-white dark:bg-[#18181b] overflow-hidden">
            <div className="p-6 border-b border-[#EAEAEA] dark:border-[#333333] bg-[#FCFCFB] dark:bg-[#1b1b1f]">
              <h3 className="font-sans text-xl font-bold text-[#111111] dark:text-[#f8fafc] leading-tight">
                Tiến trình hệ thống & Tài liệu mới tải lên
              </h3>
              <p className="text-xs text-[#787774] dark:text-[#94a3b8] mt-1 font-sans">
                Danh sách các tài liệu mới nhất đã được phê duyệt và lưu trữ trong hệ thống RAG.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#EAEAEA] dark:border-[#333333] bg-[#F9F9F8] dark:bg-[#151518]">
                    <th className="px-6 py-3.5 text-xs font-sans tracking-wider uppercase text-[#787774] dark:text-[#94a3b8] font-semibold">
                      Tài liệu
                    </th>
                    <th className="px-6 py-3.5 text-xs font-sans tracking-wider uppercase text-[#787774] dark:text-[#94a3b8] font-semibold">
                      Giảng viên
                    </th>
                    <th className="px-6 py-3.5 text-xs font-sans tracking-wider uppercase text-[#787774] dark:text-[#94a3b8] font-semibold">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3.5 text-xs font-sans tracking-wider uppercase text-[#787774] dark:text-[#94a3b8] font-semibold">
                      Ngày cập nhật
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#333333]">
                  {recentDocs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#787774] dark:text-[#94a3b8] font-sans">
                        Chưa có tài liệu nào trong hệ thống
                      </td>
                    </tr>
                  ) : (
                    recentDocs.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-[#FCFCFB] dark:hover:bg-[#1c1c21] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <IconFileText size={18} className="text-[#a1a1aa] dark:text-[#71717a] shrink-0" />
                            <span className="text-sm font-medium text-[#111111] dark:text-[#f8fafc] font-sans">
                              {doc.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#333333] dark:text-[#e4e4e7] font-sans">
                            {doc.owner_name || "Không rõ"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${
                              doc.status === "completed" 
                                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                                : doc.status === "pending"
                                ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                                : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                            }`} />
                            <span className="text-xs font-sans tracking-wider uppercase font-semibold text-muted-foreground">
                              {doc.status === "completed" ? "Thành công" : doc.status === "pending" ? "Đang xử lý" : doc.status || "Thành công"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-sans text-[#787774] dark:text-[#94a3b8]">
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString("vi-VN") : "—"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
