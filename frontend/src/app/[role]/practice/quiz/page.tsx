"use client";

import { Suspense } from "react";
import { Loader, Center, Stack, Text } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { TakeQuizView } from "@/components/student/quiz/take-quiz-view";
import { QuizPreviewView } from "@/components/lecturer/quiz/quiz-preview-view";

function QuizPageContent() {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  if (isPreview) {
    return <QuizPreviewView />;
  }

  return <TakeQuizView />;
}

export default function QuizGamificationPage() {
  return (
    <div className="flex-1 bg-zinc-50 min-h-screen py-8">
      <Suspense
        fallback={
          <Center className="p-12 h-[50vh]">
            <Stack gap="xs" align="center">
              <Loader size="lg" color="indigo" />
              <Text size="sm" c="dimmed" fw={500}>Đang tải cấu hình bài tập...</Text>
            </Stack>
          </Center>
        }
      >
        <QuizPageContent />
      </Suspense>
    </div>
  );
}
