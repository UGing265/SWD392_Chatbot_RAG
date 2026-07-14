"use client";

import { useState } from "react";
import { Tabs } from "@mantine/core";
import { IconTarget } from "@tabler/icons-react";
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
    <div className="flex-grow bg-zinc-50 relative font-sans w-full min-h-screen">
      {/* Sticky elegant header in student style */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full mb-8">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <IconTarget size={20} stroke={1.5} className="text-zinc-900" />
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
              Góc Luyện Tập
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 space-y-8">
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
    </div>
  );
}
