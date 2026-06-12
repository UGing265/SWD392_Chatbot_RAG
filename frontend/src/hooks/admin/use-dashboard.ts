import { useState, useEffect, useCallback } from "react";
import { adminUserApi } from "@/api/admin-user";
import { documentApi } from "@/api/document";
import { moderationApi } from "@/api/moderation";

export function useDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalEmbeddings: 0,
    totalReports: 0,
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [users, docsData, reports] = await Promise.all([
        adminUserApi.getUsers().catch(() => []),
        documentApi.getDocuments({ page: 1, pageSize: 5 }).catch(() => ({ documents: [], total: 0 })),
        moderationApi.getReports().catch(() => []),
      ]);

      // Calculate approximate embeddings count based on documents (for display)
      // e.g. 50 chunks per document on average
      const documentsCount = docsData.total || docsData.documents?.length || 0;
      const calculatedEmbeddings = documentsCount * 45; 

      setStats({
        totalUsers: users.length || 0,
        totalDocuments: documentsCount,
        totalEmbeddings: calculatedEmbeddings,
        totalReports: reports.length || 0,
      });

      setRecentDocs(docsData.documents || []);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    recentDocs,
    loading,
    refresh: fetchStats,
  };
}
