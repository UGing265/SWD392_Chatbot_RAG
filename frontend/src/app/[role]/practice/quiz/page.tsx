"use client";

import { Suspense } from "react";
import { Loader, Center, Stack, Text } from "@mantine/core";
import { TakeQuizView } from "@/components/student/quiz/take-quiz-view";

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
        <TakeQuizView />
      </Suspense>
    </div>
  );
}
