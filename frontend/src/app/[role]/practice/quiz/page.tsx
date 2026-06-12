"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  RotateCcw,
  Loader2,
  Eye,
} from "lucide-react";
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
      <div className="w-full max-w-3xl mx-auto py-12 animate-fade-in-up text-center space-y-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full"></div>
          {isLecturer ? (
            <Eye className="w-32 h-32 text-primary mx-auto relative z-10 animate-fade-in-up" />
          ) : (
            <Trophy className="w-32 h-32 text-warning mx-auto relative z-10 animate-fade-in-up" />
          )}
        </div>
        <div>
          <h1 className="text-4xl font-extrabold gradient-text mb-4">
            {isLecturer ? "Xem lại bài tập" : "Hoàn thành bài tập!"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isLecturer ? (
              `Bạn đang xem nội dung của ${activeQuiz.length} câu hỏi.`
            ) : (
              <>
                Bạn đã trả lời đúng{" "}
                <span className="font-bold text-foreground text-2xl">
                  {score}/{activeQuiz.length}
                </span>{" "}
                câu hỏi.
              </>
            )}
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-8">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl h-14 px-8 text-base shadow-sm"
            onClick={() => router.push(`${rolePrefix}/practice`)}
          >
            Về danh sách
          </Button>
          {!isLecturer && (
            <Button
              size="lg"
              className="rounded-xl h-14 px-8 text-base shadow-soft hover:shadow-pop transition-all group"
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setIsAnswered(false);
                setSelectedAnswer(null);
                setIsFinished(false);
              }}
            >
              <RotateCcw className="w-5 h-5 mr-2 group-hover:-rotate-180 transition-transform duration-500" />{" "}
              Làm lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Header and Progress */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-muted-foreground uppercase tracking-wider">Tiến trình học tập</span>
          <span className="text-primary">
            {currentIndex + 1} / {activeQuiz.length}
          </span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Main Question Card container */}
      <div className="animate-fade-in-up">
        <div className="relative bg-white/70 backdrop-blur-xl border border-border/60 rounded-3xl p-8 mb-8 shadow-pop">
          <h2 className="text-3xl font-bold leading-tight mb-8">{currentQuestion.question}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = currentQuestion.correct_answer === idx;

              let stateStyles = "hover:bg-primary/5 hover:border-primary/30 text-foreground";

              if (isAnswered) {
                if (isCorrect) {
                  stateStyles =
                    "bg-emerald-500/10 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500/50";
                } else if (isSelected) {
                  stateStyles =
                    "bg-rose-500/10 border-rose-500 text-rose-700 ring-1 ring-rose-500/50";
                } else {
                  stateStyles =
                    "opacity-50 grayscale border-border/50 bg-muted/40 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isLecturer && handleSelect(idx)}
                  disabled={isAnswered && !isLecturer}
                  className={cn(
                    "relative flex items-center p-5 text-left w-full h-full rounded-2xl border-2 transition-all duration-300",
                    !isAnswered && !isLecturer && "cursor-pointer active:scale-[0.98]",
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
                          : "border-muted-foreground/30 text-muted-foreground",
                    )}
                  >
                    {isAnswered && isCorrect ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isAnswered && isSelected && !isCorrect ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </div>
                  <span className="text-lg font-medium leading-snug">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation Section */}
        {isAnswered && (
          <div className="animate-fade-in-up space-y-6">
            <div
              className={cn(
                "p-6 rounded-2xl border",
                selectedAnswer === currentQuestion.correct_answer
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-warning/10 border-warning/20",
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "p-3 rounded-full mt-1",
                    selectedAnswer === currentQuestion.correct_answer
                      ? "bg-emerald-500/20 text-emerald-600"
                      : "bg-warning/20 text-warning-foreground",
                  )}
                >
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h3
                    className={cn(
                      "text-xl font-bold mb-2",
                      isLecturer
                        ? "text-primary"
                        : selectedAnswer === currentQuestion.correct_answer
                          ? "text-emerald-700"
                          : "text-warning-foreground",
                    )}
                  >
                    {isLecturer
                      ? "Nội dung giải thích:"
                      : selectedAnswer === currentQuestion.correct_answer
                        ? "Chính xác tuyệt đối!"
                        : "Sai rồi, hãy cố gắng học hỏi từ lỗi sai nhé!"}
                  </h3>
                  <p className="text-base text-muted-foreground font-medium leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-bold rounded-xl shadow-soft group transition-all"
                onClick={handleNext}
              >
                {currentIndex < activeQuiz.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
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
        <div className="p-12 text-center h-[50vh] flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Đang tải cấu hình bài tập...</p>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
