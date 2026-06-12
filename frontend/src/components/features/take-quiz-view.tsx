"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  CheckCircle2,
  ChevronLeft,
  Calendar,
  BookOpen,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject_name: string;
  academic_term_name: string;
  duration_minutes: number;
  questions: Question[];
}

export function TakeQuizView() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const historyMocks = [
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

  const [selectedTerm, setSelectedTerm] = useState<{ id: string; name: string } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null);

  // Mocks
  const terms = [
    { id: "t1", name: "HK1 2024-2025" },
    { id: "t2", name: "HK2 2024-2025" },
  ];

  const subjects = [
    { id: "s1", name: "Lập trình Web", termId: "t1" },
    { id: "s2", name: "Cơ sở dữ liệu", termId: "t1" },
    { id: "s3", name: "Toán cao cấp", termId: "t2" },
  ];

  useEffect(() => {
    // Mock quizzes
    setQuizzes([
      {
        id: "qz1",
        title: "Bài kiểm tra giữa kỳ 1",
        description: "Kiểm tra kiến thức Chương 1 và 2.",
        subject_name: "Lập trình Web",
        academic_term_name: "HK1 2024-2025",
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
        academic_term_name: "HK1 2024-2025",
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

  const [searchQuery, setSearchQuery] = useState("");

  // -----------------------------------------------------
  // VIEW 1: Select Term & Subject OR Quiz List
  // -----------------------------------------------------
  if (!selectedQuiz) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Minimalist Header */}
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d8282] shadow-lg">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#0d8282]">Danh sách bài kiểm tra</h1>
                  <p className="text-muted-foreground">
                    {selectedTerm && selectedSubject
                      ? `Kỳ học: ${selectedTerm.name} • Môn học: ${selectedSubject.name}`
                      : "Chọn kỳ học và môn học để xem bài kiểm tra"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant={showHistory ? "default" : "outline"}
                  className={`h-11 rounded-xl font-medium ${showHistory ? "bg-[#0d8282] hover:bg-[#0a6666] text-white" : "border-[#0d8282] text-[#0d8282] hover:bg-[#0d8282]/5"}`}
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {showHistory ? "Quay lại danh sách" : "Lịch sử làm bài"}
                </Button>

                {!showHistory && (selectedTerm || selectedSubject) && (
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-zinc-200 hover:bg-zinc-50 font-medium"
                    onClick={() => {
                      setSelectedTerm(null);
                      setSelectedSubject(null);
                      setSearchQuery("");
                    }}
                  >
                    Chọn lại
                  </Button>
                )}
              </div>
            </div>
          </div>

          {showHistory ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-zinc-500 mb-1">Tổng số bài đã làm</div>
                  <div className="text-2xl font-black text-[#0d8282]">12</div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-zinc-500 mb-1">Điểm trung bình</div>
                  <div className="text-2xl font-black text-[#0d8282]">8.5 / 10</div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-zinc-500 mb-1">Thời gian học tập</div>
                  <div className="text-2xl font-black text-[#0d8282]">4h 30m</div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50/80 border-b border-zinc-100">
                        <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Bài kiểm tra
                        </th>
                        <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Môn học
                        </th>
                        <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Điểm số
                        </th>
                        <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Thời gian nộp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {historyMocks.map((history) => (
                        <tr key={history.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-5 font-semibold text-zinc-800">{history.quizTitle}</td>
                          <td className="p-5 text-[14px] text-zinc-600">{history.subject}</td>
                          <td className="p-5">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[13px] font-bold ${history.score >= 8 ? "bg-green-100 text-green-700" : history.score >= 5 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                            >
                              {history.score} / {history.total}
                            </span>
                          </td>
                          <td className="p-5 text-[14px] text-zinc-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" /> {history.date}
                              <span className="mx-1">•</span>
                              <Clock className="h-3.5 w-3.5" /> {history.time}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              {selectedTerm && selectedSubject && (
                <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 delay-100 duration-500">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm tên bài kiểm tra..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="h-12 rounded-2xl border-gray-200 pl-12 shadow-sm focus:border-[#0d8282] focus:ring-[#0d8282]"
                    />
                  </div>
                </div>
              )}

              {!selectedTerm ? (
                <div className="grid gap-4 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  {terms.map((term) => (
                    <div
                      key={term.id}
                      onClick={() => setSelectedTerm(term)}
                      className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#0d8282] hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0d8282]/10 text-[#0d8282]">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{term.name}</h3>
                          <p className="text-sm text-gray-500">Bấm để chọn kỳ học</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !selectedSubject ? (
                <div className="grid gap-4 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  {subjects
                    .filter((s) => s.termId === selectedTerm.id)
                    .map((subject) => (
                      <div
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject)}
                        className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#0d8282] hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0d8282]/10 text-[#0d8282]">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{subject.name}</h3>
                            <p className="text-sm text-gray-500">Bấm để chọn môn học</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                  {quizzes
                    .filter(
                      (q) =>
                        q.subject_name === selectedSubject.name &&
                        q.academic_term_name === selectedTerm.name &&
                        q.title.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((quiz) => (
                      <div
                        key={quiz.id}
                        onClick={() => setSelectedQuiz(quiz)}
                        className="group relative bg-white rounded-[2rem] p-7 shadow-sm hover:shadow-xl hover:shadow-[#0d8282]/10 transition-all duration-300 border border-zinc-200/60 hover:border-[#0d8282]/30 cursor-pointer flex flex-col h-full hover:-translate-y-1.5 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#2e6d2b] to-[#0d8282] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="flex-1 mt-2">
                          <h3 className="text-xl font-bold text-zinc-900 group-hover:text-[#0d8282] transition-colors mb-5 leading-tight">
                            {quiz.title}
                          </h3>
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-600 bg-zinc-100/80 px-3 py-2 rounded-xl w-fit">
                              <BookOpen className="h-4 w-4 text-[#0d8282]" />
                              {quiz.subject_name}
                            </div>
                            <div className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-500 px-1">
                              <Calendar className="h-4 w-4 text-zinc-400" />
                              {quiz.academic_term_name}
                            </div>
                            <div className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-500 px-1">
                              <Clock className="h-4 w-4 text-orange-500" />
                              Thời gian:{" "}
                              <span className="font-bold text-zinc-700">
                                {quiz.duration_minutes} phút
                              </span>
                            </div>
                          </div>
                          <p className="text-[14px] text-zinc-500 line-clamp-2 leading-relaxed">
                            {quiz.description}
                          </p>
                        </div>
                        <div className="mt-7 pt-5 border-t border-zinc-100/80">
                          <Button className="w-full rounded-xl bg-[#0d8282]/10 text-[#0d8282] hover:bg-[#0d8282]/20 font-bold group-hover:bg-[#0d8282] group-hover:text-white transition-all duration-300 h-12 shadow-none group-hover:shadow-md">
                            Bắt đầu làm bài
                          </Button>
                        </div>
                      </div>
                    ))}

                  {quizzes.filter(
                    (q) =>
                      q.subject_name === selectedSubject.name &&
                      q.academic_term_name === selectedTerm.name,
                  ).length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                      <div className="mx-auto h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-5 border border-zinc-100">
                        <ClipboardList className="h-8 w-8 text-zinc-300" />
                      </div>
                      <p className="text-xl font-bold text-zinc-700">Chưa có bài kiểm tra nào</p>
                      <p className="text-[15px] font-medium text-zinc-400 mt-2">
                        Giảng viên chưa tải lên bài kiểm tra cho môn học này.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  // VIEW 2: Take Quiz & Results
  // -----------------------------------------------------
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-100 py-10 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
        <Button
          variant="ghost"
          onClick={handleBackToList}
          className="text-zinc-500 hover:text-teal-700 hover:bg-teal-50 pl-2 rounded-xl"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Quay lại danh sách
        </Button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-4">{selectedQuiz.title}</h1>
          <div className="flex items-center justify-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg">
              <BookOpen className="h-4 w-4 text-teal-600" /> {selectedQuiz.subject_name}
            </span>
            <span className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-lg">
              <Clock className="h-4 w-4 text-orange-400" /> {selectedQuiz.duration_minutes} phút
            </span>
          </div>
        </div>

        {submitted && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-green-200 text-center animate-in fade-in slide-in-from-top-4">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Kết quả bài làm</h2>
            <p className="text-lg opacity-90 mb-4">Bạn đã hoàn thành bài kiểm tra!</p>
            <div className="bg-white/20 rounded-2xl py-4 px-8 inline-block">
              <span className="text-4xl font-black">{score}</span>
              <span className="text-xl opacity-80 mx-2">/</span>
              <span className="text-2xl font-bold">{selectedQuiz.questions.length}</span>
              <div className="text-sm mt-1 opacity-90">Câu trả lời đúng</div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {selectedQuiz.questions.map((q, index) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCorrect = submitted && answers[q.id] === q.correctOptionId;
            const isWrong = submitted && answers[q.id] !== q.correctOptionId;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-3xl p-6 md:p-8 shadow-sm border transition-colors ${
                  submitted
                    ? isCorrect
                      ? "border-green-300 bg-green-50/50"
                      : "border-red-200 bg-red-50/50"
                    : "border-zinc-100"
                }`}
              >
                <Label className="text-lg font-semibold text-zinc-800 mb-4 block leading-relaxed">
                  <span className="text-teal-600 mr-2 font-bold">Câu {index + 1}:</span>
                  {q.text}
                </Label>

                <div className="space-y-3 mt-6">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.id;
                    const isCorrectOption = submitted && opt.id === q.correctOptionId;

                    let optionStyle = "border-zinc-100 hover:border-teal-300 hover:bg-teal-50/50";
                    if (isSelected && !submitted)
                      optionStyle = "border-teal-500 bg-teal-50 text-teal-800 shadow-sm";
                    if (submitted) {
                      if (isCorrectOption)
                        optionStyle =
                          "border-green-500 bg-green-100 text-green-800 font-medium shadow-sm";
                      else if (isSelected && !isCorrectOption)
                        optionStyle = "border-red-400 bg-red-100 text-red-800";
                      else optionStyle = "border-zinc-100 opacity-50";
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center ${optionStyle}`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "border-teal-500" : "border-zinc-300"
                          } ${submitted && isCorrectOption ? "border-green-500 bg-green-500" : ""} ${submitted && isSelected && !isCorrectOption ? "border-red-500 bg-red-500" : ""}`}
                        >
                          {isSelected && !submitted && (
                            <div className="h-2.5 w-2.5 bg-teal-500 rounded-full" />
                          )}
                          {submitted && isCorrectOption && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>
                        <span className="text-[15px]">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                {submitted && isWrong && (
                  <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-800">
                        Câu trả lời chưa chính xác!
                      </p>
                      <p className="text-sm text-orange-700 mt-1">
                        Đáp án đúng là:{" "}
                        <span className="font-bold">
                          {q.options.find((o) => o.id === q.correctOptionId)?.text}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!submitted && (
          <div className="sticky bottom-6 z-10 mt-8">
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < selectedQuiz.questions.length}
              className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg shadow-lg shadow-teal-200/50 transition-all"
            >
              {Object.keys(answers).length < selectedQuiz.questions.length
                ? `Vui lòng trả lời tất cả câu hỏi (${Object.keys(answers).length}/${selectedQuiz.questions.length})`
                : "Nộp bài"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
