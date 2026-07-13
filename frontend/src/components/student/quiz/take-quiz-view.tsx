"use client";

import React, { useState, useEffect } from "react";
import {
  IconClipboardList,
  IconChevronLeft,
  IconChevronRight,
  IconBook,
  IconClock,
  IconTrophy,
  IconFileText,
  IconSparkles,
} from "@tabler/icons-react";
import {
  Button,
  Paper,
  Text,
  Group,
  Stack,
  Badge,
  TextInput,
  Center,
  Progress,
  Loader,
  Modal,
} from "@mantine/core";
import { useQuiz } from "@/hooks/student/use-quiz";
import { cn } from "@/lib/utils";

export function TakeQuizView() {
  const {
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
    historyList,
    loadingHistory,
    fetchAttemptHistory,
    searchQuery,
    setSearchQuery,
    handleSelectOption,
    handleSubmit,
    handleBackToList,
    resetSelection,
  } = useQuiz();

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeQuizForHistory, setActiveQuizForHistory] = useState<any>(null);

  const openHistory = (quiz: any) => {
    setActiveQuizForHistory(quiz);
    fetchAttemptHistory(quiz.ID);
    setIsHistoryModalOpen(true);
  };

  // Fetch history automatically when a quiz is submitted
  useEffect(() => {
    if (submitted && selectedQuiz) {
      fetchAttemptHistory(selectedQuiz.id);
    }
  }, [submitted, selectedQuiz]);

  // -----------------------------------------------------
  // VIEW 1: Dashboard and Quiz Lists
  // -----------------------------------------------------
  if (!selectedQuiz) {
    return (
      <div className="bg-transparent py-4">
        <div>
          {/* Header */}
          <div className="mb-8">
            <Group justify="space-between" align="center" className="flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 font-sans">
                  {selectedSubject 
                    ? `Danh sách đề thi: ${selectedSubject.name}` 
                    : "Chọn môn học để hiển thị đề kiểm tra"}
                </h2>
                <Text size="xs" className="text-zinc-500 mt-1 font-medium">
                  {selectedSubject 
                    ? `Các đề thi trắc nghiệm chính thức do giảng viên xuất bản.` 
                    : "Lựa chọn một trong các học phần đang hoạt động để xem danh sách Quiz."}
                </Text>
              </div>

              {selectedSubject && (
                <Button
                  onClick={resetSelection}
                  variant="subtle"
                  color="indigo"
                  size="xs"
                  radius="lg"
                  leftSection={<IconChevronLeft size={14} />}
                  className="!text-zinc-500 hover:!bg-zinc-100 font-bold"
                >
                  Chọn học phần khác
                </Button>
              )}
            </Group>
          </div>

          {/* Subject Selection Grid */}
          {!selectedSubject ? (
            loadingSubjects ? (
              <div className="py-20 text-center">
                <Loader size="md" color="indigo" />
              </div>
            ) : subjects.length === 0 ? (
              <Paper withBorder p="xl" radius="2xl" className="py-16 text-center bg-white border-zinc-200/60 shadow-sm">
                <div className="mx-auto h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 text-zinc-400 border border-zinc-100">
                  <IconBook size={28} />
                </div>
                <Text fw={750} size="md" className="text-zinc-800">Chưa có lớp học nào hoạt động</Text>
                <Text size="xs" className="text-zinc-500 mt-1">
                  Hệ thống chưa ghi nhận đề thi đã xuất bản nào của bạn.
                </Text>
              </Paper>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub)}
                    className="cursor-pointer border border-zinc-200/65 bg-white p-6 rounded-2xl shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/50 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <IconBook size={16} stroke={1.5} />
                      </div>
                      <span className="text-[9px] font-bold text-zinc-455 uppercase tracking-widest block mb-1">
                        {sub.code}
                      </span>
                      <Text fw={750} size="sm" className="text-zinc-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                        {sub.name}
                      </Text>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-[11px] font-bold text-zinc-455 group-hover:text-indigo-600 transition-colors">
                      <span>Vào ôn tập</span>
                      <IconChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Quiz Listing inside selected subject
            <>
              {/* Search Bar */}
              <div className="mb-6">
                <TextInput
                  placeholder="Tìm kiếm đề thi trắc nghiệm..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  radius="lg"
                  size="md"
                  styles={{
                    input: {
                      backgroundColor: "#fff",
                      borderColor: "#e4e4e7",
                      color: "#18181b",
                      fontSize: "13px",
                    },
                  }}
                />
              </div>

              {loadingQuizzes ? (
                <div className="py-20 text-center">
                  <Loader size="md" color="indigo" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {quizzes
                    .filter((q) => q.Title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((quiz) => (
                      <div
                        key={quiz.ID}
                        className="bg-white border border-zinc-200/65 rounded-2xl p-6 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                              <IconClipboardList size={18} />
                            </div>
                          </div>
                          <Text fw={755} size="md" className="text-zinc-800 group-hover:text-indigo-600 transition-colors leading-snug mb-1 line-clamp-2 font-sans">
                            {quiz.Title}
                          </Text>
                          <Text size="xs" className="text-zinc-450 line-clamp-2 leading-relaxed mb-4">
                            Đề kiểm tra trắc nghiệm chính thức của môn học do giảng viên biên soạn.
                          </Text>
                        </div>

                        <div className="mt-auto border-t border-zinc-100 pt-4 flex items-center justify-between gap-2">
                          <Group gap="xs">
                            <IconFileText size={14} className="text-zinc-400" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{quiz.TotalQuestions} câu</span>
                          </Group>
                          
                          <Group gap="xs">
                            <Button
                              onClick={() => openHistory(quiz)}
                              variant="light"
                              color="indigo"
                              size="xs"
                              radius="lg"
                              className="!font-bold"
                            >
                              Lịch sử
                            </Button>
                            <Button
                              onClick={() => handleStartQuiz(quiz)}
                              loading={loadingDetail}
                              color="indigo"
                              size="xs"
                              radius="lg"
                              className="!font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            >
                              Làm bài
                            </Button>
                          </Group>
                        </div>
                      </div>
                    ))}

                  {quizzes.filter((q) => q.Title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <Paper withBorder p="xl" radius="2xl" className="col-span-full py-16 text-center bg-white border-zinc-200/60 shadow-sm">
                      <div className="mx-auto h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 text-zinc-400 border border-zinc-100">
                        <IconClipboardList size={28} />
                      </div>
                      <Text fw={750} size="sm" className="text-zinc-800">Không tìm thấy bài Quiz nào</Text>
                      <Text size="xs" className="text-zinc-500 mt-1">
                        Hiện môn học này chưa có đề Quiz nào được xuất bản.
                      </Text>
                    </Paper>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Attempts History Modal */}
        <Modal
          opened={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          title={
            <Text fw={800} className="text-zinc-800 uppercase tracking-wider text-[11px] font-sans">
              Lịch sử làm bài: {activeQuizForHistory?.Title}
            </Text>
          }
          size="lg"
          radius="xl"
          styles={{
            content: { backgroundColor: "#fff", border: "1px solid #e4e4e7" },
            header: { backgroundColor: "#fff", borderBottom: "1px solid #f4f4f5" },
          }}
        >
          {loadingHistory ? (
            <div className="py-12 text-center">
              <Loader size="md" color="indigo" />
            </div>
          ) : historyList.length === 0 ? (
            <div className="py-12 text-center text-zinc-450 text-sm font-medium">
              Bạn chưa thực hiện lượt làm bài nào cho đề Quiz này.
            </div>
          ) : (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <th className="py-3 px-4">Lượt làm</th>
                    <th className="py-3 px-4">Điểm số</th>
                    <th className="py-3 px-4">Số câu đúng</th>
                    <th className="py-3 px-4">Ngày hoàn thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700 font-medium">
                  {historyList.map((attempt, idx) => {
                    const dateObj = attempt.CompletedAt ? new Date(attempt.CompletedAt) : new Date(attempt.StartedAt);
                    const formattedDate = dateObj.toLocaleDateString("vi-VN") + " - " + dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                    
                    return (
                      <tr key={attempt.ID} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-4 px-4 font-mono text-zinc-455">#{historyList.length - idx}</td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-black text-indigo-650">{attempt.Score.toFixed(1)}</span>
                          <span className="text-[10px] text-zinc-400 font-bold">/100</span>
                        </td>
                        <td className="py-4 px-4 font-bold text-zinc-800">
                          {attempt.TotalCorrect} câu
                        </td>
                        <td className="py-4 px-4 text-zinc-500">
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // -----------------------------------------------------
  // VIEW 2: Quiz taking & Submission results (Light theme)
  // -----------------------------------------------------
  return (
    <div className="w-full bg-transparent">
      <div className="max-w-3xl mx-auto w-full px-6 py-6 space-y-8 animate-in fade-in duration-300">
        <Button
          onClick={handleBackToList}
          variant="subtle"
          color="gray"
          leftSection={<IconChevronLeft size={16} />}
          radius="lg"
          className="!text-zinc-500 hover:!bg-zinc-100 self-start font-bold"
        >
          Quay lại danh sách
        </Button>

        {submitted ? (
          <div className="max-w-xl mx-auto space-y-8">
            <Paper withBorder p="xl" radius="2xl" className="bg-white border-zinc-200 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-650" />
              
              <div className="text-center mb-8 pt-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100/50">
                  <IconTrophy size={32} />
                </div>
                <h1 className="text-2xl font-extrabold text-zinc-900 mb-1 font-sans">Kết quả bài thi</h1>
                <Text size="xs" className="text-zinc-500 font-medium">Chúc mừng bạn đã hoàn thành bài thi trắc nghiệm!</Text>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-indigo-50/50 p-6 rounded-2xl text-center border border-indigo-100/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">Điểm số quy đổi</span>
                  <Text size="2.5rem" fw={900} className="text-zinc-900 leading-none">
                    {submitResult ? submitResult.Score.toFixed(1) : "0.0"}
                    <span className="text-[10px] font-bold text-zinc-400 block mt-1">thang điểm 100</span>
                  </Text>
                </div>
                <div className="bg-zinc-50 p-6 rounded-2xl text-center border border-zinc-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Số câu đúng</span>
                  <Text size="2.5rem" fw={900} className="text-indigo-650 leading-none">
                    {score}
                    <span className="text-[10px] font-bold text-zinc-400 block mt-1">/ {selectedQuiz.questions.length} câu</span>
                  </Text>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3">
                <IconSparkles size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <Text fw={750} size="sm" className="text-zinc-800">
                    {submitResult && submitResult.Score >= 80 
                      ? "Kết quả xuất sắc!" 
                      : submitResult && submitResult.Score >= 50 
                      ? "Kết quả khá tốt!" 
                      : "Hãy tiếp tục cố gắng nhé!"}
                  </Text>
                  <Text size="xs" className="text-zinc-500 mt-1 leading-relaxed font-medium">
                    Hệ thống RAG đã chấm điểm và lưu kết quả của bạn thành công.
                  </Text>
                </div>
              </div>

              <Button
                onClick={handleBackToList}
                color="indigo"
                radius="lg"
                size="md"
                className="w-full mt-8 font-bold"
              >
                Hoàn tất & Quay lại
              </Button>
            </Paper>

            {/* Display attempt history under the result card */}
            <div className="space-y-3">
              <Text fw={750} size="xs" className="text-zinc-700 uppercase tracking-wider text-[11px] font-sans">
                Lịch sử làm bài trước đây
              </Text>
              
              <Paper withBorder p="xl" radius="2xl" className="bg-white border-zinc-200/60 shadow-sm">
                {loadingHistory ? (
                  <Center className="py-6">
                    <Loader size="sm" color="indigo" />
                  </Center>
                ) : historyList.length === 0 ? (
                  <Text size="xs" className="text-zinc-400">
                    Chưa có lượt làm bài nào được ghi lại.
                  </Text>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-150 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          <th className="pb-2 pr-4">Lượt</th>
                          <th className="pb-2 px-4">Điểm số</th>
                          <th className="pb-2 px-4">Số câu đúng</th>
                          <th className="pb-2 pl-4">Thời gian hoàn thành</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700 font-semibold">
                        {historyList.map((attempt, idx) => {
                          const dateObj = attempt.CompletedAt ? new Date(attempt.CompletedAt) : new Date(attempt.StartedAt);
                          const formattedDate = dateObj.toLocaleDateString("vi-VN") + " " + dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                          return (
                            <tr key={attempt.ID} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="py-3 pr-4 font-mono text-zinc-450">#{historyList.length - idx}</td>
                              <td className="py-3 px-4 text-indigo-650 font-extrabold">{attempt.Score.toFixed(1)}/100</td>
                              <td className="py-3 px-4">{attempt.TotalCorrect} câu</td>
                              <td className="py-3 pl-4 text-zinc-500 font-medium text-[11px]">{formattedDate}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Paper>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quiz Info Bar */}
            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
              <h2 className="font-extrabold text-lg text-zinc-900 mb-3">{selectedQuiz.title}</h2>
              <Group gap="xs">
                <Badge color="indigo" variant="light" size="sm" radius="lg">
                  {selectedQuiz.subject_name}
                </Badge>
                <Badge color="dark" variant="outline" size="sm" radius="lg" className="!border-zinc-200 !text-zinc-500">
                  {selectedQuiz.questions.length} câu hỏi
                </Badge>
              </Group>
            </div>

            {/* Questions List */}
            <Stack gap="md">
              {selectedQuiz.questions.map((q, index) => {
                const selectedOptionId = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm"
                  >
                    <Text fw={755} size="md" className="text-zinc-850 leading-relaxed mb-5">
                      <span className="text-indigo-600 mr-2">Câu {index + 1}:</span>
                      {q.text}
                    </Text>

                    <Stack gap="sm">
                      {q.options.map((opt) => {
                        const isSelected = selectedOptionId === opt.id;
                        
                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            className={cn(
                              "flex items-center p-4 rounded-xl border transition-all cursor-pointer select-none",
                              isSelected 
                                ? "bg-indigo-50/50 border-indigo-500/60 text-indigo-650" 
                                : "bg-zinc-50/30 border-zinc-150 text-zinc-700 hover:border-zinc-300"
                            )}
                          >
                            <div
                              className={cn(
                                "h-5 w-5 rounded-full border mr-3 flex items-center justify-center shrink-0 transition-colors",
                                isSelected ? "border-indigo-500 bg-indigo-500" : "border-zinc-300 bg-white"
                              )}
                            >
                              {isSelected && (
                                <div className="h-1.5 w-1.5 bg-white rounded-full" />
                              )}
                            </div>
                            <span className="text-sm font-semibold leading-relaxed">{opt.text}</span>
                          </div>
                        );
                      })}
                    </Stack>
                  </div>
                );
              })}
            </Stack>

            {/* Action Bar */}
            <div className="mt-8 pt-4 pb-12">
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < selectedQuiz.questions.length}
                color="indigo"
                radius="lg"
                size="md"
                className="w-full h-12 font-extrabold text-sm"
              >
                {Object.keys(answers).length < selectedQuiz.questions.length
                  ? `Vui lòng hoàn thành tất cả câu hỏi (${Object.keys(answers).length}/${selectedQuiz.questions.length})`
                  : "Nộp bài thi"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
