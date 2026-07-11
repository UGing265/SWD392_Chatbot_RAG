import { useState, useEffect } from "react";

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject_name: string;
  duration_minutes: number;
  questions: Question[];
}

export const historyMocks = [
  {
    id: "h1",
    quizTitle: "Bài kiểm tra giữa kỳ 1",
    subject: "Lập trình Web",
    score: 9.5,
    total: 10,
    date: "10/05/2026",
    time: "14:30",
  },
  {
    id: "h2",
    quizTitle: "Trắc nghiệm SQL cơ bản",
    subject: "Cơ sở dữ liệu",
    score: 8.0,
    total: 10,
    date: "08/05/2026",
    time: "09:15",
  },
  {
    id: "h3",
    quizTitle: "Quiz 1: HTML & CSS",
    subject: "Lập trình Web",
    score: 10.0,
    total: 10,
    date: "01/05/2026",
    time: "10:00",
  },
];


export const subjects = [
  { id: "s1", name: "Lập trình Web" },
  { id: "s2", name: "Cơ sở dữ liệu" },
  { id: "s3", name: "Toán cao cấp" },
];

export function useQuiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
<{ id: string; name: string } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Mock quizzes
    setQuizzes([
      {
        id: "qz1",
        title: "Bài kiểm tra giữa kỳ 1",
        description: "Kiểm tra kiến thức Chương 1 và 2.",
        subject_name: "Lập trình Web",
        duration_minutes: 15,
        questions: [
          {
            id: "q1",
            text: "HTML là viết tắt của từ gì?",
            options: [
              { id: "o1", text: "Hyper Text Markup Language" },
              { id: "o2", text: "High Text Machine Language" },
              { id: "o3", text: "Hyper Text Multiple Language" },
            ],
            correctOptionId: "o1",
          },
          {
            id: "q2",
            text: "Thẻ nào dùng để tạo danh sách không thứ tự?",
            options: [
              { id: "o1", text: "<ol>" },
              { id: "o2", text: "<ul>" },
              { id: "o3", text: "<li>" },
            ],
            correctOptionId: "o2",
          },
        ],
      },
      {
        id: "qz2",
        title: "Trắc nghiệm SQL cơ bản",
        description: "Ôn tập các câu truy vấn cơ bản (SELECT, WHERE, JOIN)",
        subject_name: "Cơ sở dữ liệu",
        duration_minutes: 10,
        questions: [
          {
            id: "q1",
            text: "Câu lệnh SQL nào dùng để chọn tất cả cột từ bảng 'Users'?",
            options: [
              { id: "o1", text: "GET * FROM Users" },
              { id: "o2", text: "SELECT * FROM Users" },
              { id: "o3", text: "EXTRACT ALL FROM Users" },
            ],
            correctOptionId: "o2",
          },
        ],
      },
    ]);
  }, []);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    if (!selectedQuiz) return;
    let correctCount = 0;
    selectedQuiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionId) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const handleBackToList = () => {
    setSelectedQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const resetSelection = () => {
    setSelectedSubject(null);
    setSearchQuery("");
  };

  return {
    quizzes,
    selectedQuiz,
    setSelectedQuiz,
    answers,
    submitted,
    score,
    showHistory,
    setShowHistory,
    selectedSubject,
    setSelectedSubject,
    searchQuery,
    setSearchQuery,
    handleSelectOption,
    handleSubmit,
    handleBackToList,
    resetSelection,
    subjects,
    historyMocks,
  };
}

