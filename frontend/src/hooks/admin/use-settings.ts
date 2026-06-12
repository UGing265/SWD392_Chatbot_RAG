import { useState } from "react";
import { notify } from "@/lib/notifications";

export function useAdminSettings() {
  const [embeddingModel, setEmbeddingModel] = useState("gemini-embedding-001");
  const [vectorDimensions, setVectorDimensions] = useState("3072");
  const [chunkSize, setChunkSize] = useState("512 tokens");
  const [similarityThreshold, setSimilarityThreshold] = useState("0.75");

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Security-Require 2FA for Admins": true,
    "Security-Session Timeout (1 hour)": true,
    "Security-IP Allowlist": false,
    "Notifications-Indexing failure alerts": true,
    "Notifications-Daily usage report": true,
    "Notifications-New user registration": false,
  });

  const [geminiApiKey, setGeminiApiKey] = useState("sk-••••••••••••••••");
  const [vectorDbConnection, setVectorDbConnection] = useState("postgresql://localhost:5432/studymate_vectors");

  const [saving, setSaving] = useState(false);

  const handleToggle = (key: string, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    notify.success("Lưu cấu hình thành công", "Các tùy chọn hệ thống đã được cập nhật.");
  };

  const handleReset = () => {
    setEmbeddingModel("gemini-embedding-001");
    setVectorDimensions("3072");
    setChunkSize("512 tokens");
    setSimilarityThreshold("0.75");
    setGeminiApiKey("sk-••••••••••••••••");
    setVectorDbConnection("postgresql://localhost:5432/studymate_vectors");
    notify.info("Đã đặt lại cấu hình mặc định");
  };

  return {
    embeddingModel,
    setEmbeddingModel,
    vectorDimensions,
    setVectorDimensions,
    chunkSize,
    setChunkSize,
    similarityThreshold,
    setSimilarityThreshold,
    toggles,
    handleToggle,
    geminiApiKey,
    setGeminiApiKey,
    vectorDbConnection,
    setVectorDbConnection,
    saving,
    handleSave,
    handleReset,
  };
}
