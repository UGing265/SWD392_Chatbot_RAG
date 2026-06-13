import { useState, useEffect, useCallback } from "react";
import { adminUserApi } from "@/api/admin-user";
import { documentApi } from "@/api/document";
import { moderationApi } from "@/api/moderation";
import { notify } from "@/lib/notifications";

export function useDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalEmbeddings: 0,
    totalReports: 0,
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (isRefresh = false) => {
    setLoading(true);
    try {
      const [users, docsData, reports] = await Promise.all([
        adminUserApi.getUsers().catch(() => []),
        documentApi
          .getDocuments({ page: 1, pageSize: 5 })
          .catch(() => ({ documents: [], total: 0 })),
        moderationApi.getReports().catch(() => []),
      ]);

      const documentsCount = docsData.total || docsData.documents?.length || 0;
      const calculatedEmbeddings = documentsCount * 45;

      const usersList = Array.isArray(users) ? users : [];
      const reportsList = Array.isArray(reports) ? reports : [];

      setStats({
        totalUsers: usersList.length,
        totalDocuments: documentsCount,
        totalEmbeddings: calculatedEmbeddings,
        totalReports: reportsList.length,
      });

      setRecentDocs(docsData.documents || []);
      
      if (isRefresh) {
        notify.success("Cập nhật thành công", "Số liệu thống kê mới nhất đã được tải.");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      if (isRefresh) {
        notify.error("Cập nhật thất bại", "Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(false);
  }, [fetchStats]);

  return {
    stats,
    recentDocs,
    loading,
    refresh: () => fetchStats(true),
  };
}
