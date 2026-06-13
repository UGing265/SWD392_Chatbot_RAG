"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  IconArrowRight,
  IconCircleCheck,
  IconCircleX,
  IconBulb,
  IconTrophy,
  IconRefresh,
  IconEye,
} from "@tabler/icons-react";
import {
  Button,
  Progress,
  Loader,
  Paper,
  Text,
  Group,
  Stack,
  Center,
} from "@mantine/core";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

// Mock JSON Data returned from LLM
const MOCK_QUIZ = [
  {
    id: 1,
    question: "Phát biểu nào sau đây đúng nhất về Middleware trong mô hình Backend?",
    options: [
      "Trực tiếp truy vấn CSDL để lấy dữ liệu.",
      "Là phần mềm trung gian xử lý Request trước khi đến Route Handler.",
      "Chỉ dùng để kết xuất giao diện HTML.",
      "Là một loại cơ sở dữ liệu NoSQL.",
    ],
    correct_answer: 1,
    explanation:
      "Middleware đứng giữa Request và Route Handler, chuyên thực thi các tác vụ như xác thực (Authentication), ghi log, kiểm tra quyền hạn trước khi cho phép Request đi tiếp.",
  },
  {
    id: 2,
    question: "Session Token thường được lưu trữ ở đâu trên trình duyệt để đảm bảo bảo mật?",
    options: ["LocalStorage", "SessionStorage", "HttpOnly Cookie", "URL Parameters"],
    correct_answer: 2,
    explanation:
      "HttpOnly Cookie giúp ngăn chặn mã JavaScript độc hại (XSS) truy cập vào Session Token, bảo vệ Token khỏi bị đánh cắp.",
  },
  {
    id: 3,
    question: "HTTP Status Code nào được trả về khi người dùng chưa xác thực (Unauthorized)?",
    options: ["200", "400", "401", "404"],
    correct_answer: 2,
    explanation:
      "401 Unauthorized nghĩa là người dùng chưa đăng nhập hoặc Token không hợp lệ. Khác với 403 Forbidden là đã đăng nhập nhưng không có quyền truy cập.",
  },
];

function QuizContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rolePrefix = params?.role ? `/${params.role}` : "";

  const { session } = useAuth();
  const isLecturer = session?.role === "lecturer";

  const countParam = searchParams.get("count");
  const count = countParam ? parseInt(countParam) : 10;

  const activeQuiz = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      ...MOCK_QUIZ[i % MOCK_QUIZ.length],
      id: i + 1,
    }));
  }, [count]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(isLecturer); // Lecturers see answers immediately
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = activeQuiz[currentIndex];
  const progress = (currentIndex / activeQuiz.length) * 100;

  const handleSelect = (index: number) => {
    if (isAnswered) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === currentQuestion.correct_answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < activeQuiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 text-center space-y-8">
        <Center className="relative">
          <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full"></div>
          {isLecturer ? (
            <IconEye size={96} className="text-blue-600 relative z-10" />
          ) : (
            <IconTrophy size={96} className="text-yellow-500 relative z-10" />
          )}
        </Center>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {isLecturer ? "Xem lại bài tập" : "Hoàn thành bài tập!"}
          </h1>
          <Text size="lg" c="dimmed">
            {isLecturer ? (
              `Bạn đang xem nội dung của ${activeQuiz.length} câu hỏi.`
            ) : (
              <>
                Bạn đã trả lời đúng{" "}
                <span className="font-extrabold text-gray-900 text-2xl">
                  {score}/{activeQuiz.length}
                </span>{" "}
                câu hỏi.
              </>
            )}
          </Text>
        </div>
        <Group justify="center" gap="md" className="pt-8">
          <Button
            variant="outline"
            color="gray"
            size="lg"
            radius="md"
            onClick={() => router.push(`${rolePrefix}/practice`)}
          >
            Về danh sách
          </Button>
          {!isLecturer && (
            <Button
              size="lg"
              color="blue"
              radius="md"
              leftSection={<IconRefresh size={18} />}
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setIsAnswered(false);
                setSelectedAnswer(null);
                setIsFinished(false);
              }}
            >
              Làm lại
            </Button>
          )}
        </Group>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {/* Header and Progress */}
      <div className="mb-8 space-y-4">
        <Group justify="space-between" align="center" className="text-sm font-semibold">
          <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">Tiến trình bài tập</Text>
          <Text fw={700} color="blue">
            {currentIndex + 1} / {activeQuiz.length}
          </Text>
        </Group>
        <Progress value={progress} color="blue" size="md" radius="xl" />
      </div>

      {/* Main Question Card container */}
      <div>
        <Paper withBorder p="xl" radius="lg" className="bg-white mb-8 shadow-sm">
          <Text fw={900} className="text-2xl leading-tight mb-8 text-gray-900">
            {currentQuestion.question}
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = currentQuestion.correct_answer === idx;

              let stateStyles = "border-gray-200 hover:border-blue-500/40 hover:bg-blue-50/10 text-gray-900 bg-white";

              if (isAnswered) {
                if (isCorrect) {
                  stateStyles = "bg-emerald-50/20 border-emerald-500 text-emerald-800";
                } else if (isSelected) {
                  stateStyles = "bg-rose-50/20 border-rose-500 text-rose-800";
                } else {
                  stateStyles = "opacity-50 border-gray-100 bg-zinc-50/50 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isLecturer && handleSelect(idx)}
                  disabled={isAnswered && !isLecturer}
                  className={cn(
                    "relative flex items-center p-5 text-left w-full h-full rounded-2xl border-2 transition-all duration-200",
                    !isAnswered && !isLecturer && "cursor-pointer active:scale-[0.99]",
                    stateStyles,
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 font-bold text-sm transition-colors",
                      isAnswered && isCorrect
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isAnswered && isSelected && !isCorrect
                          ? "bg-rose-500 border-rose-500 text-white"
                          : "border-gray-300 text-gray-500",
                    )}
                  >
                    {isAnswered && isCorrect ? (
                      <IconCircleCheck size={18} />
                    ) : isAnswered && isSelected && !isCorrect ? (
                      <IconCircleX size={18} />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </div>
                  <span className="text-md font-semibold leading-snug">{option}</span>
                </button>
              );
            })}
          </div>
        </Paper>

        {/* Explanation Section */}
        {isAnswered && (
          <div className="space-y-6">
            <Paper
              withBorder
              p="lg"
              radius="lg"
              className={cn(
                selectedAnswer === currentQuestion.correct_answer
                  ? "bg-emerald-50/10 border-emerald-200"
                  : "bg-amber-50/10 border-amber-200",
              )}
            >
              <Group align="flex-start" gap="md" wrap="nowrap">
                <Center
                  className={cn(
                    "p-3 rounded-full mt-1 shrink-0",
                    selectedAnswer === currentQuestion.correct_answer
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700",
                  )}
                >
                  <IconBulb size={24} />
                </Center>
                <div>
                  <Text
                    fw={900}
                    size="lg"
                    className={cn(
                      "mb-1",
                      isLecturer
                        ? "text-blue-700"
                        : selectedAnswer === currentQuestion.correct_answer
                          ? "text-emerald-800"
                          : "text-amber-850",
                    )}
                  >
                    {isLecturer
                      ? "Nội dung giải thích:"
                      : selectedAnswer === currentQuestion.correct_answer
                        ? "Chính xác tuyệt đối!"
                        : "Chưa chính xác, hãy ôn lại kiến thức nhé!"}
                  </Text>
                  <Text size="sm" c="dimmed" fw={500} className="leading-relaxed">
                    {currentQuestion.explanation}
                  </Text>
                </div>
              </Group>
            </Paper>

            <Group justify="flex-end">
              <Button
                onClick={handleNext}
                color="blue"
                radius="md"
                size="lg"
                rightSection={<IconArrowRight size={18} />}
              >
                {currentIndex < activeQuiz.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
              </Button>
            </Group>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizGamificationPage() {
  return (
    <Suspense
      fallback={
        <Center className="p-12 h-[50vh]">
          <Stack gap="xs" align="center">
            <Loader size="lg" color="blue" />
            <Text size="sm" c="dimmed" fw={500}>Đang tải cấu hình bài tập...</Text>
          </Stack>
        </Center>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
