"use client";

import {
  IconClipboardList,
  IconCircleCheck,
  IconChevronLeft,
  IconCalendar,
  IconBook,
  IconClock,
  IconAlertCircle,
  IconSearch,
  IconCheck,
  IconTrophy,
  IconX,
  IconFileText,
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
} from "@mantine/core";
import { useQuiz } from "@/hooks/student/use-quiz";

export function TakeQuizView() {
  const {
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
  } = useQuiz();

  // -----------------------------------------------------
  // VIEW 1: Select Subject OR Quiz List  // -----------------------------------------------------
  if (!selectedQuiz) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-[#0a0a0a] py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Group justify="space-between" align="center" className="mb-4 flex-wrap">
              <Group gap="sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600/20 text-teal-400 shadow-lg border border-teal-500/20">
                  <IconClipboardList size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-teal-400">Danh sách bài kiểm tra</h1>
                  <Text size="sm" className="text-white/70">
                    {selectedSubject ? `M�n h?c: ${selectedSubject.name}` : "Ch?n m�n h?c d? xem b�i ki?m tra"}
                  </Text>
                </div>
              </Group>

              <Group gap="sm">
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant={showHistory ? "filled" : "outline"}
                  color="teal"
                  radius="md"
                  leftSection={<IconClock size={16} />}
                >
                  {showHistory ? "Quay lại danh sách" : "Lịch sử làm bài"}
                </Button>

                {!showHistory && selectedSubject && (
                  <Button
                    onClick={() => {
                      setSelectedSubject(null);
                      setSearchQuery("");
                    }}
                    variant="outline"
                    color="gray"
                    radius="md"
                  >
                    Chọn lại
                  </Button>
                )}
              </Group>
            </Group>
          </div>

          {showHistory ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                <Paper withBorder p="md" radius="lg" className="bg-[#1f1f1f] border-white/10">
                  <Text size="xs" fw={700} className="uppercase tracking-wider text-white/70">Tổng số bài đã làm</Text>
                  <Text fw={900} size="xl" className="mt-1 text-teal-400">12</Text>
                </Paper>
                <Paper withBorder p="md" radius="lg" className="bg-[#1f1f1f] border-white/10">
                  <Text size="xs" fw={700} className="uppercase tracking-wider text-white/70">Điểm trung bình</Text>
                  <Text fw={900} size="xl" className="mt-1 text-teal-400">8.5 / 10</Text>
                </Paper>
                <Paper withBorder p="md" radius="lg" className="bg-[#1f1f1f] border-white/10">
                  <Text size="xs" fw={700} className="uppercase tracking-wider text-white/70">Thời gian học tập</Text>
                  <Text fw={900} size="xl" className="mt-1 text-teal-400">4h 30m</Text>
                </Paper>
              </div>

              <Paper withBorder radius="lg" className="overflow-hidden bg-[#1f1f1f] border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-xs font-bold text-white/70 uppercase tracking-wider">
                        <th className="p-5">Bài kiểm tra</th>
                        <th className="p-5">Môn học</th>
                        <th className="p-5">Điểm số</th>
                        <th className="p-5">Thời gian nộp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-sm text-white/70">
                      {historyMocks.map((history) => (
                        <tr key={history.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-5 font-semibold text-white/90">{history.quizTitle}</td>
                          <td className="p-5 text-white/60">{history.subject}</td>
                          <td className="p-5">
                            <Badge
                              color={history.score >= 8 ? "emerald" : history.score >= 5 ? "blue" : "red"}
                              variant="filled"
                              size="md"
                            >
                              {history.score} / {history.total}
                            </Badge>
                          </td>
                          <td className="p-5 text-white/70">
                            <Group gap="xs">
                              <IconCalendar size={14} />
                              <Text size="xs" className="text-white/70">{history.date}</Text>
                              <Text size="xs" className="text-white/20">•</Text>
                              <IconClock size={14} />
                              <Text size="xs" className="text-white/70">{history.time}</Text>
                            </Group>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Paper>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              {selectedSubject && (
                <div className="mb-6">
                  <TextInput
                    placeholder="Tìm kiếm tên bài kiểm tra..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    leftSection={<IconSearch size={18} className="text-white/70" />}
                    radius="md"
                    size="md"
                    styles={{
                      input: {
                        backgroundColor: "#1f1f1f",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                      },
                    }}
                  />
                </div>
              )}

              {!selectedSubject ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subjects
                    
                    .map((subject) => (
                      <Paper
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject)}
                        withBorder
                        p="md"
                        radius="lg"
                        className="cursor-pointer border-white/5 hover:border-teal-400 hover:shadow-md transition-all group bg-[#0d0d0d]"
                      >
                        <Group gap="md" wrap="nowrap">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                            <IconBook size={24} />
                          </div>
                          <div>
                            <Text fw={700} size="sm" className="text-white group-hover:text-teal-400 transition-colors">{subject.name}</Text>
                            <Text size="xs" className="text-white/90">Bấm để chọn môn học</Text>
                          </div>
                        </Group>
                      </Paper>
                    ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {quizzes
                    .filter(
                      (q) =>
                        q.subject_name === selectedSubject.name &&
                        q.title.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((quiz) => (
                      <Paper
                        key={quiz.id}
                        withBorder
                        p="xl"
                        radius="lg"
                        className="group cursor-pointer border-white/5 hover:shadow-xl hover:border-teal-500/45 hover:-translate-y-1 transition-all duration-300 bg-[#0d0d0d]"
                        onClick={() => setSelectedQuiz(quiz)}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-teal-400 mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                          <IconClipboardList size={24} />
                        </div>
                        <Text fw={700} size="lg" className="mb-2 text-white/90 line-clamp-1 group-hover:text-teal-400 transition-colors">
                          {quiz.title}
                        </Text>
                        <Text size="sm" className="text-white/70 mb-4 line-clamp-2">
                          {quiz.description}
                        </Text>
                        <Group justify="space-between" className="mt-auto pt-4 border-t border-white/5">
                          <Group gap="xs">
                            <IconFileText size={14} className="text-white/70" />
                            <Text size="xs" className="text-white/70">{quiz.questions.length} câu hỏi</Text>
                          </Group>
                          <Group gap="xs">
                            <IconClock size={14} className="text-white/70" />
                            <Text size="xs" className="text-white/70">{quiz.duration_minutes} phút</Text>
                          </Group>
                        </Group>
                      </Paper>
                    ))}

                  {quizzes.filter(
                    (q) =>
                      q.subject_name === selectedSubject.name).length === 0 && (
                    <Paper withBorder p="xl" radius="lg" className="col-span-full py-20 text-center bg-[#0d0d0d] border-white/10 shadow-sm">
                      <div className="mx-auto h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-5 border border-white/10 text-white/20">
                        <IconClipboardList size={32} />
                      </div>
                      <Text fw={700} size="lg" className="text-white/90">Chưa có bài kiểm tra nào</Text>
                      <Text size="sm" className="text-white/70 mt-2">
                        Giảng viên chưa tải lên bài kiểm tra cho môn học này.
                      </Text>
                    </Paper>
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
    <div className="flex-1 flex flex-col h-full bg-[#000000] overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full px-6 py-12 space-y-8 animate-in fade-in duration-300">
        <Button
          onClick={handleBackToList}
          variant="subtle"
          color="gray"
          leftSection={<IconChevronLeft size={16} />}
          radius="md"
        >
          Quay lại danh sách
        </Button>

        {submitted ? (
          <div className="max-w-3xl mx-auto">
            <Paper withBorder p="xl" radius="lg" className="bg-[#111111] border-white/10 shadow-sm">
              <div className="text-center mb-8">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-teal-600/20 text-teal-400 mb-4">
                  <IconTrophy size={40} />
                </div>
                <h1 className="text-3xl font-extrabold text-white/90 mb-2">Kết quả bài làm</h1>
                <Text className="text-white/70">Chúc mừng bạn đã hoàn thành bài kiểm tra!</Text>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-teal-600/20 to-emerald-600/20 p-6 rounded-2xl text-center border border-teal-500/20">
                  <Text size="xs" fw={700} className="uppercase tracking-wider text-teal-400 mb-1">Điểm số</Text>
                  <Text size="3rem" fw={900} className="text-white leading-none">
                    {score} <span className="text-xl font-normal text-white/70">/ {selectedQuiz.questions.length}</span>
                  </Text>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/10">
                  <Text size="xs" fw={700} className="uppercase tracking-wider text-white/70 mb-1">Tỷ lệ đúng</Text>
                  <Text size="3rem" fw={900} className="text-teal-400 leading-none">
                    {Math.round((score / selectedQuiz.questions.length) * 100)}%
                  </Text>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {selectedQuiz.questions.map((q, idx) => {
                  const isCorrectResult = answers[q.id] === q.correctOptionId;
                  return (
                    <div key={q.id} className={`p-4 rounded-xl border ${isCorrectResult ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                      <Group gap="sm">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white ${isCorrectResult ? "bg-emerald-500" : "bg-red-500"}`}>
                          {isCorrectResult ? <IconCheck size={14} /> : <IconX size={14} />}
                        </div>
                        <Text size="sm" fw={600} className="text-white/90">Câu {idx + 1}: {isCorrectResult ? "Chính xác" : "Chưa đúng"}</Text>
                      </Group>
                    </div>
                  );
                })}
              </div>
            </Paper>
          </div>
        ) : (
          <div className="space-y-8">
            <Paper withBorder p="xl" radius="lg" className="bg-[#111111] border-white/10 text-center">
              <Text fw={900} size="xl" className="text-white/90 mb-4">{selectedQuiz.title}</Text>
              <Group justify="center" gap="md">
                <Group gap="xs" className="bg-white/5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-400">
                  <IconBook size={14} />
                  {selectedQuiz.subject_name}
                </Group>
                <Group gap="xs" className="bg-white/5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70">
                  <IconClock size={14} />
                  {selectedQuiz.duration_minutes} phút
                </Group>
              </Group>
            </Paper>

            <Stack gap="md">
              {selectedQuiz.questions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined;
                return (
                  <Paper
                    key={q.id}
                    withBorder
                    p="xl"
                    radius="lg"
                    className="bg-[#111111] border-white/10 transition-colors"
                  >
                    <Text fw={700} size="md" className="text-white/90 leading-relaxed mb-4">
                      <span className="text-teal-400 mr-2">Câu {index + 1}:</span>
                      {q.text}
                    </Text>

                    <Stack gap="sm" mt="md">
                      {q.options.map((opt) => {
                        const isSelected = answers[q.id] === opt.id;
                        let optionClass = "border-white/5 hover:border-teal-500/50 hover:bg-white/5";
                        if (isSelected)
                          optionClass = "border-teal-500 bg-teal-500/10 text-teal-400 shadow-sm";

                        return (
                          <Group
                            key={opt.id}
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            gap="sm"
                            p="md"
                            className={`rounded-lg border-2 transition-all cursor-pointer ${optionClass}`}
                            wrap="nowrap"
                          >
                            <div
                              className={`h-5 w-5 rounded-full border-2 mr-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? "border-teal-500" : "border-white/20"
                              }`}
                            >
                              {isSelected && (
                                <div className="h-2.5 w-2.5 bg-teal-500 rounded-full" />
                              )}
                            </div>
                            <Text size="sm" className={`flex-1 ${isSelected ? "text-white" : "text-white/70"}`}>{opt.text}</Text>
                          </Group>
                        );
                      })}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>

            <div className="sticky bottom-6 z-10 mt-8">
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < selectedQuiz.questions.length}
                color="teal"
                radius="md"
                size="lg"
                className="w-full h-14 font-bold text-md shadow-md"
              >
                {Object.keys(answers).length < selectedQuiz.questions.length
                  ? `Vui lòng trả lời tất cả câu hỏi (${Object.keys(answers).length}/${selectedQuiz.questions.length})`
                  : "Nộp bài"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




