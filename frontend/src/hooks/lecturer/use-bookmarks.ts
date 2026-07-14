import { useState, useEffect, useCallback } from "react";
import { documentApi } from "@/api/document";
import { DocumentListItem } from "./use-explore";

export function useBookmarks() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedDocIds, setBookmarkedDocIds] = useState<Set<string>>(new Set());

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentApi.getBookmarks();
      setDocuments(data.documents || []);
      const ids = (data.documents || []).map((d: any) => d.id);
      setBookmarkedDocIds(new Set(ids));
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const toggleBookmark = async (docId: string, slug?: string) => {
    try {
      const data = await documentApi.toggleBookmark(slug || docId);
      if (data.bookmarked) {
        setBookmarkedDocIds(prev => new Set(prev).add(docId));
      } else {
        // If unbookmarked on this page, immediately remove it from view
        setBookmarkedDocIds(prev => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  return {
    documents,
    loading,
    bookmarkedDocIds,
    toggleBookmark,
  };
}
