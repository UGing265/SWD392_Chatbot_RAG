import { useState, useEffect } from "react";
import { quizApi, SubjectWithQuiz, QuizSummary, QuizDetailResponse, StartAttemptResponse, SubmitAttemptResponse } from "@/api/quiz";
import { notifications } from "@mantine/notifications";

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  questionType: string;
  options: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject_name: string;
  duration_minutes: number;
  questions: Question[];
}

export function useQuiz() {
  const [subjects, setSubjects] = useState<SubjectWithQuiz[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithQuiz | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<StartAttemptResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitAttemptResponse | null>(null);
  const [score, setScore] = useState(0);
  
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");

  // Load subjects with quizzes on mount
  useEffect(() => {
    async function fetchSubjects() {
      setLoadingSubjects(true);
      try {
        const res = await quizApi.getSubjectsWithQuizzes();
        setSubjects(res.data || []);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();

    // Restore active attempt from localStorage if present
    if (typeof window !== "undefined") {
      const savedSubject = localStorage.getItem("active_quiz_subject");
      if (savedSubject) {
        try {
          setSelectedSubject(JSON.parse(savedSubject));
        } catch (e) {}
      }

      const savedAttempt = localStorage.getItem("active_quiz_attempt");
      const savedDetail = localStorage.getItem("active_quiz_detail");
      const savedAnswers = localStorage.getItem("active_quiz_answers");

      if (savedAttempt && savedDetail) {
        try {
          setActiveAttempt(JSON.parse(savedAttempt));
          setSelectedQuiz(JSON.parse(savedDetail));
          if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
          }
        } catch (e) {
          localStorage.removeItem("active_quiz_attempt");
          localStorage.removeItem("active_quiz_detail");
          localStorage.removeItem("active_quiz_answers");
        }
      }
    }
  }, []);

  // Fetch quizzes when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setQuizzes([]);
      return;
    }
    async function fetchQuizzes() {
      setLoadingQuizzes(true);
      try {
        const res = await quizApi.listQuizzesForStudent(selectedSubject!.id);
        setQuizzes(res || []);
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
      } finally {
        setLoadingQuizzes(false);
      }
    }
    fetchQuizzes();
  }, [selectedSubject]);

  // Fetch attempt history
  const fetchAttemptHistory = async (quizId: string) => {
    setLoadingHistory(true);
    try {
      const res = await quizApi.getAttemptHistory(quizId);
      setHistoryList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch attempt history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartQuiz = async (quizSummary: QuizSummary) => {
    setLoadingDetail(true);
    try {
      // 1. Start attempt
      const attempt = await quizApi.startAttempt(quizSummary.ID);
      setActiveAttempt(attempt);

      // 2. Fetch quiz details
      const detail = await quizApi.getQuizDetail(quizSummary.ID);
      
      const mappedQuiz: Quiz = {
        id: detail.quiz.ID,
        title: detail.quiz.Title,
        description: "Bài trắc nghiệm tự động sinh từ tài liệu học tập.",
        subject_name: selectedSubject?.name || "Môn học",
        duration_minutes: 15, // Default duration
        questions: detail.questions.map((q) => ({
          id: q.ID,
          text: q.Content,
          questionType: q.QuestionType,
          options: q.Options.map((opt) => ({
            id: opt.ID,
            text: opt.Content,
          })),
        })),
      };

      setSelectedQuiz(mappedQuiz);
      setAnswers({});
      setSubmitted(false);
      setScore(0);
      setSubmitResult(null);

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("active_quiz_attempt", JSON.stringify(attempt));
        localStorage.setItem("active_quiz_detail", JSON.stringify(mappedQuiz));
        localStorage.setItem("active_quiz_answers", JSON.stringify({}));
        if (selectedSubject) {
          localStorage.setItem("active_quiz_subject", JSON.stringify(selectedSubject));
        }
      }
    } catch (err: any) {
      console.error("Failed to start quiz attempt:", err);
      notifications.show({
        title: "Lỗi hệ thống",
        message: err.response?.data?.message || "Không thể bắt đầu làm bài. Vui lòng thử lại sau.",
        color: "red",
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submitted || !selectedQuiz) return;
    
    const q = selectedQuiz.questions.find((question) => question.id === questionId);
    if (!q) return;

    console.log("Selected question:", questionId, "type:", q.questionType, "option:", optionId);

    setAnswers((prev) => {
      const currentSelections = prev[questionId] || [];
      let newAnswers;
      if (q.questionType === "multiple_choice") {
        if (currentSelections.includes(optionId)) {
          newAnswers = {
            ...prev,
            [questionId]: currentSelections.filter((id) => id !== optionId),
          };
        } else {
          newAnswers = {
            ...prev,
            [questionId]: [...currentSelections, optionId],
          };
        }
      } else {
        newAnswers = {
          ...prev,
          [questionId]: [optionId],
        };
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("active_quiz_answers", JSON.stringify(newAnswers));
      }
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (!selectedQuiz || !activeAttempt) return;
    
    // Construct answers array matching the API
    const formattedAnswers = Object.entries(answers).map(([qId, optIds]) => ({
      question_id: qId,
      selected_option_ids: optIds,
    }));

    try {
      const result = await quizApi.submitAttempt({
        attempt_id: activeAttempt.ID,
        answers: formattedAnswers,
      });
      setSubmitResult(result);
      setScore(result.TotalCorrect);
      setSubmitted(true);

      // Clear active quiz cache on submit
      if (typeof window !== "undefined") {
        localStorage.removeItem("active_quiz_attempt");
        localStorage.removeItem("active_quiz_detail");
        localStorage.removeItem("active_quiz_answers");
      }
      
      // Update history if active
      fetchAttemptHistory(selectedQuiz.id);
    } catch (err: any) {
      console.error("Failed to submit quiz attempt:", err);
      notifications.show({
        title: "Lỗi nộp bài",
        message: err.response?.data?.message || "Đã xảy ra lỗi khi nộp bài thi.",
        color: "red",
      });
    }
  };

  const handleBackToList = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("active_quiz_attempt");
      localStorage.removeItem("active_quiz_detail");
      localStorage.removeItem("active_quiz_answers");
    }

    setSelectedQuiz(null);
    setActiveAttempt(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setSubmitResult(null);

    // Refresh the page to reload history and dashboard scores
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const resetSelection = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("active_quiz_subject");
      localStorage.removeItem("active_quiz_attempt");
      localStorage.removeItem("active_quiz_detail");
      localStorage.removeItem("active_quiz_answers");
    }
    setSelectedSubject(null);
    setSearchQuery("");
  };

  return {
    subjects,
    quizzes,
    loadingSubjects,
    loadingQuizzes,
    loadingDetail,
    selectedSubject,
    setSelectedSubject,
    selectedQuiz,
    handleStartQuiz,
    answers,
    submitted,
    score,
    submitResult,
    showHistory,
    setShowHistory,
    historyList,
    loadingHistory,
    fetchAttemptHistory,
    searchQuery,
    setSearchQuery,
    handleSelectOption,
    handleSubmit,
    handleBackToList,
    resetSelection,
  };
}
