"use client";


import {
  IconPlus,
  IconDeviceFloppy,
  IconTrash,
  IconCircleCheck,
  IconCheck,
  IconBook,
  IconCalendar,
  IconHelp,
} from "@tabler/icons-react";
import {
  Button,
  TextInput,
  Textarea,
  Select,
  Paper,
  Text,
  Group,
  Stack,
  ActionIcon,
  Center,
} from "@mantine/core";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface Subject {
  id: string;
  name: string;
}

interface AcademicTerm {
  id: string;
  name: string;
}

import { useCreateQuiz } from "@/hooks/lecturer/use-create-quiz";

export function CreateQuizView() {
  const {
    title,
    setTitle,
    description,
    setDescription,
    subjectId,
    setSubjectId,
    termId,
    setTermId,
    questions,
    subjects,
    terms,
    saving,
    saved,
    addQuestion,
    removeQuestion,
    updateQuestionText,
    addOption,
    removeOption,
    updateOptionText,
    setCorrectOption,
    handleSave,
  } = useCreateQuiz();


  if (saved) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6 bg-zinc-50">
        <Stack align="center" gap="md">
          <Center className="h-24 w-24 rounded-full bg-blue-600 shadow-lg shadow-blue-100">
            <IconCheck size={48} className="text-white" />
          </Center>
          <Text size="xl" fw={900} className="text-gray-900 text-center">
            Tạo Quiz thành công!
          </Text>
          <Text size="sm" c="dimmed" className="text-center">
            Bài kiểm tra đã được lưu vào hệ thống
          </Text>
        </Stack>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <Paper withBorder p="xl" radius="lg" className="bg-white">
          <Group gap="md" mb="xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
              <IconHelp size={28} />
            </div>
            <div>
              <Text fw={900} size="xl" className="text-gray-900">
                Tạo Quiz mới
              </Text>
              <Text size="sm" c="dimmed">Tạo bài kiểm tra thủ công cho sinh viên</Text>
            </div>
          </Group>

          <Stack gap="md">
            <TextInput
              label={<Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">Tiêu đề Quiz</Text>}
              placeholder="VD: Bài kiểm tra giữa kỳ 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              radius="md"
              size="md"
            />

            <Textarea
              label={<Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">Mô tả</Text>}
              placeholder="Nhập mô tả hoặc hướng dẫn làm bài..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={3}
              radius="md"
            />

            <div className="grid gap-6 md:grid-cols-2">
              <Select
                label={
                  <Group gap={4} align="center">
                    <IconCalendar size={14} className="text-blue-500" />
                    <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">Kỳ học</Text>
                  </Group>
                }
                placeholder="Chọn kỳ học"
                value={termId}
                onChange={setTermId}
                data={terms.map((t) => ({ value: t.id, label: t.name }))}
                radius="md"
              />

              <Select
                label={
                  <Group gap={4} align="center">
                    <IconBook size={14} className="text-blue-500" />
                    <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">Môn học</Text>
                  </Group>
                }
                placeholder="Chọn môn học"
                value={subjectId}
                onChange={setSubjectId}
                data={subjects.map((s) => ({ value: s.id, label: s.name }))}
                radius="md"
              />
            </div>
          </Stack>
        </Paper>

        {/* Questions Section */}
        <Stack gap="md">
          {questions.map((q, qIndex) => (
            <Paper key={q.id} withBorder p="xl" radius="lg" className="bg-white">
              <Group justify="space-between" align="flex-end" mb="md" wrap="nowrap">
                <div className="flex-1">
                  <Text fw={900} size="md" className="text-gray-900 mb-2">
                    Câu hỏi {qIndex + 1}
                  </Text>
                  <TextInput
                    placeholder="Nhập nội dung câu hỏi..."
                    value={q.text}
                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                    radius="md"
                    size="sm"
                  />
                </div>
                {questions.length > 1 && (
                  <ActionIcon
                    onClick={() => removeQuestion(q.id)}
                    color="red"
                    variant="subtle"
                    size="lg"
                    radius="md"
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                )}
              </Group>

              <Stack gap="sm" className="pl-0 md:pl-6 mt-4">
                {q.options.map((opt, oIndex) => (
                  <Group key={opt.id} gap="sm" align="center" wrap="nowrap">
                    <ActionIcon
                      onClick={() => setCorrectOption(q.id, opt.id)}
                      color={opt.isCorrect ? "emerald" : "gray"}
                      variant={opt.isCorrect ? "filled" : "outline"}
                      radius="xl"
                      size="sm"
                    >
                      {opt.isCorrect && <IconCheck size={14} />}
                    </ActionIcon>
                    <TextInput
                      placeholder={`Lựa chọn ${oIndex + 1}`}
                      value={opt.text}
                      onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
                      radius="md"
                      className="flex-1"
                      styles={{
                        input: opt.isCorrect
                          ? { borderColor: "var(--mantine-color-emerald-3)", backgroundColor: "var(--mantine-color-emerald-0)" }
                          : {},
                      }}
                    />
                    {q.options.length > 2 && (
                      <ActionIcon
                        onClick={() => removeOption(q.id, opt.id)}
                        color="red"
                        variant="subtle"
                        size="md"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                ))}

                <Button
                  variant="subtle"
                  color="blue"
                  onClick={() => addOption(q.id)}
                  leftSection={<IconPlus size={14} />}
                  className="w-fit"
                  size="xs"
                >
                  Thêm lựa chọn
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>

        {/* Actions bar */}
        <Paper
          withBorder
          p="md"
          radius="lg"
          className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white sticky bottom-6 z-10 shadow-md"
        >
          <Button
            variant="outline"
            color="blue"
            onClick={addQuestion}
            leftSection={<IconPlus size={16} />}
            radius="md"
          >
            Thêm câu hỏi mới
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving || !title || !termId || !subjectId}
            color="blue"
            leftSection={<IconDeviceFloppy size={16} />}
            radius="md"
          >
            {saving ? "Đang lưu..." : "Lưu Quiz"}
          </Button>
        </Paper>
      </div>
    </div>
  );
}
