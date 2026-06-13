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
    selectedTerm,
    setSelectedTerm,
    selectedSubject,
    setSelectedSubject,
    searchQuery,
    setSearchQuery,
    handleSelectOption,
    handleSubmit,
    handleBackToList,
    resetSelection,
    terms,
    subjects,
    historyMocks,
  } = useQuiz();


  // -----------------------------------------------------
  // VIEW 1: Select Term & Subject OR Quiz List
  // -----------------------------------------------------
  if (!selectedQuiz) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Group justify="space-between" align="center" className="mb-4 flex-wrap">
              <Group gap="sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
                  <IconClipboardList size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-teal-700">Danh sách bài kiểm tra</h1>
                  <Text size="sm" c="dimmed">
                    {selectedTerm && selectedSubject
                      ? `Kỳ học: ${selectedTerm.name} • Môn học: ${selectedSubject.name}`
                      : "Chọn kỳ học và môn học để xem bài kiểm tra"}
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

                {!showHistory && (selectedTerm || selectedSubject) && (
                  <Button
                    onClick={() => {
                      setSelectedTerm(null);
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
                <Paper withBorder p="md" radius="lg" className="bg-white">
                  <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">Tổng số bài đã làm</Text>
                  <Text fw={900} size="xl" color="teal" className="mt-1">12</Text>
                </Paper>
                <Paper withBorder p="md" radius="lg" className="bg-white">
                  <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">Điểm trung bình</Text>
                  <Text fw={900} size="xl" color="teal" className="mt-1">8.5 / 10</Text>
                </Paper>
                <Paper withBorder p="md" radius="lg" className="bg-white">
                  <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">Thời gian học tập</Text>
                  <Text fw={900} size="xl" color="teal" className="mt-1">4h 30m</Text>
                </Paper>
              </div>

              <Paper withBorder radius="lg" className="overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="p-5">Bài kiểm tra</th>
                        <th className="p-5">Môn học</th>
                        <th className="p-5">Điểm số</th>
                        <th className="p-5">Thời gian nộp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm text-gray-700">
                      {historyMocks.map((history) => (
                        <tr key={history.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-5 font-semibold text-gray-900">{history.quizTitle}</td>
                          <td className="p-5">{history.subject}</td>
                          <td className="p-5">
                            <Badge
                              color={history.score >= 8 ? "emerald" : history.score >= 5 ? "blue" : "red"}
                              variant="light"
                              size="md"
                            >
                              {history.score} / {history.total}
                            </Badge>
                          </td>
                          <td className="p-5 text-gray-500">
                            <Group gap="xs">
                              <IconCalendar size={14} />
                              <Text size="xs">{history.date}</Text>
                              <Text size="xs" c="dimmed">•</Text>
                              <IconClock size={14} />
                              <Text size="xs">{history.time}</Text>
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
              {selectedTerm && selectedSubject && (
                <div className="mb-6">
                  <TextInput
                    placeholder="Tìm kiếm tên bài kiểm tra..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    leftSection={<IconSearch size={18} className="text-gray-400" />}
                    radius="md"
                    size="md"
                  />
                </div>
              )}

              {!selectedTerm ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {terms.map((term) => (
                    <Paper
                      key={term.id}
                      onClick={() => setSelectedTerm(term)}
                      withBorder
                      p="md"
                      radius="lg"
                      className="cursor-pointer hover:border-teal-500/40 hover:shadow-md transition-all bg-white"
                    >
                      <Group gap="md" wrap="nowrap">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                          <IconCalendar size={24} />
                        </div>
                        <div>
                          <Text fw={700} size="sm" className="text-gray-900">{term.name}</Text>
                          <Text size="xs" c="dimmed">Bấm để chọn kỳ học</Text>
                        </div>
                      </Group>
                    </Paper>
                  ))}
                </div>
              ) : !selectedSubject ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subjects
                    .filter((s) => s.termId === selectedTerm.id)
                    .map((subject) => (
                      <Paper
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject)}
                        withBorder
                        p="md"
                        radius="lg"
                        className="cursor-pointer hover:border-teal-500/40 hover:shadow-md transition-all bg-white"
                      >
                        <Group gap="md" wrap="nowrap">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                            <IconBook size={24} />
                          </div>
                          <div>
                            <Text fw={700} size="sm" className="text-gray-900">{subject.name}</Text>
                            <Text size="xs" c="dimmed">Bấm để chọn môn học</Text>
                          </div>
                        </Group>
                      </Paper>
                    ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {quizzes
                    .filter(
                      (q) =>
                        q.subject_name === selectedSubject.name &&
                        q.academic_term_name === selectedTerm.name &&
                        q.title.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((quiz) => (
                      <Paper
                        key={quiz.id}
                        onClick={() => setSelectedQuiz(quiz)}
                        withBorder
                        p="lg"
                        radius="lg"
                        className="group cursor-pointer hover:shadow-lg hover:border-teal-500/30 transition-all flex flex-col h-full bg-white relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex-1 mt-2">
                          <Text fw={900} size="lg" className="text-gray-900 group-hover:text-teal-700 transition-colors mb-4">
                            {quiz.title}
                          </Text>
                          <Stack gap="xs" mb="md">
                            <Group gap="xs" className="bg-zinc-50 px-2 py-1 rounded w-fit">
                              <IconBook size={14} className="text-teal-600" />
                              <Text size="xs" fw={700} className="text-gray-700">{quiz.subject_name}</Text>
                            </Group>
                            <Group gap={6} className="text-gray-500">
                              <IconCalendar size={14} />
                              <Text size="xs">{quiz.academic_term_name}</Text>
                            </Group>
                            <Group gap={6} className="text-gray-500">
                              <IconClock size={14} className="text-orange-500" />
                              <Text size="xs">
                                Thời gian: <span className="font-bold text-gray-700">{quiz.duration_minutes} phút</span>
                              </Text>
                            </Group>
                          </Stack>
                          <Text size="xs" c="dimmed" className="line-clamp-2 mt-4 leading-relaxed">
                            {quiz.description}
                          </Text>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <Button
                            variant="light"
                            color="teal"
                            radius="md"
                            className="w-full group-hover:bg-teal-600 group-hover:text-white transition-all"
                            size="md"
                          >
                            Bắt đầu làm bài
                          </Button>
                        </div>
                      </Paper>
                    ))}

                  {quizzes.filter(
                    (q) =>
                      q.subject_name === selectedSubject.name &&
                      q.academic_term_name === selectedTerm.name,
                  ).length === 0 && (
                    <Paper withBorder p="xl" radius="lg" className="col-span-full py-20 text-center bg-white">
                      <div className="mx-auto h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-5 border border-zinc-100 text-gray-300">
                        <IconClipboardList size={32} />
                      </div>
                      <Text fw={700} size="lg" className="text-gray-800">Chưa có bài kiểm tra nào</Text>
                      <Text size="sm" c="dimmed" className="mt-2">
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
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50 py-10 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
        <Button
          onClick={handleBackToList}
          variant="subtle"
          color="gray"
          leftSection={<IconChevronLeft size={16} />}
          radius="md"
        >
          Quay lại danh sách
        </Button>

        <Paper withBorder p="xl" radius="lg" className="bg-white text-center">
          <Text fw={900} size="xl" className="text-gray-900 mb-4">{selectedQuiz.title}</Text>
          <Group justify="center" gap="md">
            <Group gap="xs" className="bg-zinc-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700">
              <IconBook size={14} className="text-teal-600" />
              {selectedQuiz.subject_name}
            </Group>
            <Group gap="xs" className="bg-zinc-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700">
              <IconClock size={14} className="text-orange-500" />
              {selectedQuiz.duration_minutes} phút
            </Group>
          </Group>
        </Paper>

        {submitted && (
          <Paper
            p="xl"
            radius="lg"
            className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white text-center shadow-md"
          >
            <Center className="h-16 w-16 bg-white/20 rounded-full mx-auto mb-4">
              <IconCircleCheck size={32} />
            </Center>
            <Text fw={900} size="lg" className="mb-2">Kết quả bài làm</Text>
            <Text size="sm" className="opacity-95 mb-4">Bạn đã hoàn thành bài kiểm tra!</Text>
            <div className="bg-white/20 rounded-2xl py-3 px-6 inline-block">
              <span className="text-4xl font-extrabold">{score}</span>
              <span className="text-xl opacity-80 mx-2">/</span>
              <span className="text-2xl font-bold">{selectedQuiz.questions.length}</span>
              <Text size="xs" className="mt-1 opacity-90">Câu trả lời đúng</Text>
            </div>
          </Paper>
        )}

        <Stack gap="md">
          {selectedQuiz.questions.map((q, index) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCorrect = submitted && answers[q.id] === q.correctOptionId;
            const isWrong = submitted && answers[q.id] !== q.correctOptionId;

            return (
              <Paper
                key={q.id}
                withBorder
                p="xl"
                radius="lg"
                className={`transition-colors bg-white ${
                  submitted
                    ? isCorrect
                      ? "border-green-300 bg-green-50/10"
                      : "border-red-200 bg-red-50/10"
                    : "border-gray-150"
                }`}
              >
                <Text fw={700} size="md" className="text-gray-900 leading-relaxed mb-4">
                  <span className="text-teal-600 mr-2">Câu {index + 1}:</span>
                  {q.text}
                </Text>

                <Stack gap="sm" mt="md">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.id;
                    const isCorrectOption = submitted && opt.id === q.correctOptionId;

                    let optionClass = "border-gray-200 hover:border-teal-300 hover:bg-teal-50/20";
                    if (isSelected && !submitted)
                      optionClass = "border-teal-500 bg-teal-50 text-teal-800 shadow-sm";
                    if (submitted) {
                      if (isCorrectOption)
                        optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold";
                      else if (isSelected && !isCorrectOption)
                        optionClass = "border-red-400 bg-red-50 text-red-800";
                      else optionClass = "border-gray-100 opacity-50";
                    }

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
                            isSelected ? "border-teal-500" : "border-gray-300"
                          } ${submitted && isCorrectOption ? "border-emerald-500 bg-emerald-500" : ""} ${submitted && isSelected && !isCorrectOption ? "border-red-500 bg-red-500" : ""}`}
                        >
                          {isSelected && !submitted && (
                            <div className="h-2.5 w-2.5 bg-teal-500 rounded-full" />
                          )}
                          {submitted && isCorrectOption && (
                            <IconCheck size={12} className="text-white" />
                          )}
                        </div>
                        <Text size="sm" className="flex-1">{opt.text}</Text>
                      </Group>
                    );
                  })}
                </Stack>

                {submitted && isWrong && (
                  <Paper withBorder p="sm" radius="md" className="bg-orange-50/50 border-orange-100 flex items-start gap-3 mt-4">
                    <IconAlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <Text fw={700} size="sm" className="text-orange-850">
                        Câu trả lời chưa chính xác!
                      </Text>
                      <Text size="sm" className="text-orange-700 mt-1">
                        Đáp án đúng là:{" "}
                        <span className="font-bold">
                          {q.options.find((o) => o.id === q.correctOptionId)?.text}
                        </span>
                      </Text>
                    </div>
                  </Paper>
                )}
              </Paper>
            );
          })}
        </Stack>

        {!submitted && (
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
        )}
      </div>
    </div>
  );
}
