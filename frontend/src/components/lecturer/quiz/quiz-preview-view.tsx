"use client";

import React, { useState, useEffect } from "react";
import {
  IconChevronLeft,
  IconSparkles,
  IconSend,
} from "@tabler/icons-react";
import {
  Button,
  Paper,
  Text,
  Group,
  Stack,
  Badge,
  Loader,
  Center,
} from "@mantine/core";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { quizApi, QuizDetailResponse } from "@/api/quiz";
import { cn } from "@/lib/utils";

export function QuizPreviewView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const role = (params?.role as string) || "lecturer";
  
  const quizId = searchParams.get("id");
  const [quizDetail, setQuizDetail] = useState<QuizDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await quizApi.getQuizDetail(quizId);
        setQuizDetail(data);
      } catch (err) {
        console.error("Failed to fetch quiz detail:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetail();
  }, [quizId]);

  const handleBack = () => {
    router.push(`/${role}/practice`);
  };

  const handlePublish = async () => {
    if (!quizId) return;
    try {
      setPublishing(true);
      await quizApi.publishQuiz(quizId);
      router.push(`/${role}/practice`);
    } catch (err) {
      console.error("Failed to publish quiz:", err);
      alert("Phát hành Quiz thất bại.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <Center className="py-20">
        <Stack gap="xs" align="center">
          <Loader size="md" color="indigo" />
          <Text size="sm" c="dimmed" fw={500}>Đang tải chi tiết bài tập...</Text>
        </Stack>
      </Center>
    );
  }

  if (!quizDetail) {
    return (
      <Center className="py-20">
        <Stack gap="md" align="center">
          <Text size="sm" c="red" fw={600}>Không thể tải thông tin bài tập.</Text>
          <Button onClick={handleBack} variant="outline" color="gray" radius="lg">
            Quay lại
          </Button>
        </Stack>
      </Center>
    );
  }

  const { quiz, questions } = quizDetail;

  return (
    <div className="w-full bg-transparent">
      <div className="max-w-3xl mx-auto w-full px-6 py-6 space-y-8 animate-in fade-in duration-300">
        {/* Back navigation button */}
        <Button
          onClick={handleBack}
          variant="subtle"
          color="gray"
          leftSection={<IconChevronLeft size={16} />}
          radius="lg"
          className="!text-zinc-500 hover:!bg-zinc-100 self-start font-bold"
        >
          Quay lại danh sách
        </Button>

        {/* Quiz Info Bar (lecturer preview style matching student active view) */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest block mb-1">
              Xem thử bài tập (Giảng viên)
            </span>
            <h2 className="font-extrabold text-lg text-zinc-900 mb-3">{quiz.Title}</h2>
            <Group gap="xs">
              <Badge color="indigo" variant="light" size="sm" radius="lg">
                Môn học ID: {quiz.SubjectID.substring(0, 8)}...
              </Badge>
              <Badge color="dark" variant="outline" size="sm" radius="lg" className="!border-zinc-200 !text-zinc-500">
                {questions.length} câu hỏi
              </Badge>
              <Badge color={quiz.Status === "published" ? "emerald" : "orange"} variant="light" size="sm" radius="lg">
                {quiz.Status === "published" ? "Đã Phát Hành" : "Bản Nháp"}
              </Badge>
            </Group>
          </div>

          {quiz.Status === "draft" && (
            <Button
              onClick={handlePublish}
              loading={publishing}
              color="emerald"
              radius="lg"
              size="md"
              leftSection={<IconSend size={16} />}
              className="font-extrabold shadow-sm bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
            >
              Phát hành Quiz
            </Button>
          )}
        </div>

        {/* Questions List */}
        <Stack gap="md">
          {questions.map((q, index) => {
            const questionId = q.ID || (q as any).id || `q-${index}`;
            const content = q.Content || (q as any).content || "Nội dung câu hỏi đang tải...";
            const questionType = q.QuestionType || (q as any).questionType || (q as any).question_type || "single_choice";
            const options = q.Options || (q as any).options || [];
            const explanation = q.Explanation || (q as any).explanation || "";

            return (
              <Paper
                key={questionId}
                withBorder
                p="lg"
                radius="2xl"
                className="bg-white border-zinc-200 shadow-sm relative overflow-hidden"
              >
                {/* Question Title & Text */}
                <Text component="div" fw={755} size="md" className="text-zinc-850 leading-relaxed mb-5 font-sans">
                  <span className="text-indigo-600 mr-2 font-bold">Câu {index + 1}:</span>
                  {content}
                  {questionType === "multiple_choice" && (
                    <Badge size="xs" color="indigo" variant="light" ml="xs" className="align-middle">
                      Chọn nhiều đáp án
                    </Badge>
                  )}
                  {questionType === "true_false" && (
                    <Badge size="xs" color="dark" variant="light" ml="xs" className="align-middle">
                      Đúng / Sai
                    </Badge>
                  )}
                </Text>

                {/* Options List */}
                {options.length > 0 ? (
                  <Stack gap="sm">
                    {options.map((opt: any, i: number) => {
                      const optId = opt.ID || opt.id || `opt-${index}-${i}`;
                      const optContent = opt.Content || opt.content || "";
                      const isCorrect = opt.IsCorrect !== undefined 
                        ? opt.IsCorrect 
                        : opt.is_correct !== undefined 
                        ? opt.is_correct 
                        : opt.isCorrect || false;

                      return (
                        <div
                          key={optId}
                          className={cn(
                            "flex items-center p-4 rounded-xl border transition-all select-none",
                            isCorrect
                              ? "bg-emerald-50/50 border-emerald-500/60 text-emerald-700"
                              : "bg-zinc-50/30 border-zinc-150 text-zinc-700"
                          )}
                        >
                          <div
                            className={cn(
                              "h-5 w-5 border mr-3 flex items-center justify-center shrink-0 transition-all",
                              questionType === "multiple_choice" ? "rounded-md" : "rounded-full",
                              isCorrect ? "border-emerald-500 bg-emerald-500" : "border-zinc-300 bg-white"
                            )}
                          >
                            {isCorrect && (
                              <span className="text-white text-[10px] font-bold">✓</span>
                            )}
                          </div>
                          <span className="text-sm font-semibold leading-relaxed">{optContent}</span>
                        </div>
                      );
                    })}
                  </Stack>
                ) : (
                  <Text size="xs" c="dimmed" fs="italic">Không có phương án lựa chọn.</Text>
                )}

                {/* AI Explanation */}
                {explanation && (
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-zinc-50/40 border border-indigo-100/45 shadow-[inset_0_1px_2.5px_rgba(255,255,255,0.75)] flex gap-3 items-start hover:shadow-sm transition-all duration-300">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100/80 text-indigo-600 shrink-0 mt-0.5 shadow-sm">
                      <IconSparkles size={14} stroke={2} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                        Giải Thích Chi Tiết (AI)
                      </span>
                      <Text size="xs" className="text-zinc-650 font-medium leading-relaxed font-sans">
                        {explanation}
                      </Text>
                    </div>
                  </div>
                )}
              </Paper>
            );
          })}
        </Stack>
      </div>
    </div>
  );
}
