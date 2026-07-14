"use client";

import { useState } from "react";
import { Text, Tabs } from "@mantine/core";
import { TakeQuizView } from "../quiz/take-quiz-view";
import { StudentDashboard } from "./student-dashboard";

export function StudentPracticeView() {
  const [activeTab, setActiveTab] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const savedAttempt = localStorage.getItem("active_quiz_attempt");
      if (savedAttempt) {
        return "quizzes";
      }
    }
    return "dashboard";
  });

  return (
    <div className="p-4 md:p-6 lg:px-12 lg:py-8 w-full space-y-8 min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 font-sans">Góc Luyện Tập</h1>
        <Text size="sm" className="mt-1 font-medium text-zinc-500">
          Theo dõi tiến trình học tập cá nhân, xem kết quả tích lũy và thực hiện các bài Quiz do giảng viên giao.
        </Text>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab} className="w-full">
        <Tabs.List className="border-b border-zinc-200/80 mb-6">
          <Tabs.Tab
            value="dashboard"
            className="!font-bold !text-xs uppercase tracking-wider !text-zinc-500 hover:!text-zinc-900 data-[active]:!text-indigo-650 data-[active]:!border-indigo-650"
          >
            Dashboard
          </Tabs.Tab>
          <Tabs.Tab
            value="quizzes"
            className="!font-bold !text-xs uppercase tracking-wider !text-zinc-500 hover:!text-zinc-900 data-[active]:!text-indigo-650 data-[active]:!border-indigo-650"
          >
            Đề thi hệ thống
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard" className="pt-2">
          <StudentDashboard onNavigateToQuizzes={() => setActiveTab("quizzes")} />
        </Tabs.Panel>

        <Tabs.Panel value="quizzes" className="pt-2">
          <TakeQuizView />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
