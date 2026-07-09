import { useState, useEffect } from "react";

export const chartData = [
  { week: "W1", performance: 65, goal: 70 },
  { week: "W2", performance: 62, goal: 70 },
  { week: "W3", performance: 78, goal: 70 },
  { week: "W4", performance: 85, goal: 70 },
  { week: "W5", performance: 88, goal: 70 },
];

export const mockStudentResults = [
  {
    id: "ST1",
    name: "Lê Văn A",
    score: 95,
    time: "12m",
    correct: 19,
    wrong: 1,
    date: "2024-06-01",
  },
  {
    id: "ST2",
    name: "Nguyễn Thị B",
    score: 80,
    time: "15m",
    correct: 16,
    wrong: 4,
    date: "2024-06-02",
  },
  {
    id: "ST3",
    name: "Trần Văn C",
    score: 45,
    time: "8m",
    correct: 9,
    wrong: 11,
    date: "2024-06-03",
  },
];

export function usePractice() {
  const [activeTab, setActiveTab] = useState<string | null>("dashboard");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isViewQuizOpen, setIsViewQuizOpen] = useState(false);

  return {
    activeTab,
    setActiveTab,
    isGenerateModalOpen,
    setIsGenerateModalOpen,
    isViewQuizOpen,
    setIsViewQuizOpen,
    chartData,
    mockStudentResults,
  };
}
