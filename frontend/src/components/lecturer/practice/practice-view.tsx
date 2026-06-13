"use client";

import { useState, useEffect } from "react";
import {
  IconChevronRight,
  IconTarget,
  IconSparkles,
  IconBook,
  IconClock,
  IconCircleCheck,
  IconArrowRight,
  IconPlus,
  IconUsers,
  IconClipboardText,
  IconHelp,
  IconEye,
  IconTrash,
  IconSearch,
  IconEdit,
} from "@tabler/icons-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  Button,
  Modal,
  Tabs,
  Paper,
  Text,
  Group,
  Stack,
  Badge,
  ActionIcon,
  TextInput,
  NativeSelect,
} from "@mantine/core";

import { usePractice } from "@/hooks/lecturer/use-practice";

export function TeacherPracticeView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    activeTab,
    setActiveTab,
    isGenerateModalOpen,
    setIsGenerateModalOpen,
    isViewQuizOpen,
    setIsViewQuizOpen,
    chartData,
    mockStudentResults,
  } = usePractice();

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Quiz Intelligence Lab
          </h1>
          <Text size="sm" c="dimmed" className="mt-1 font-medium">
            Quản lý bài tập, theo dõi tiến độ sinh viên và tối ưu hóa câu hỏi bằng AI.
          </Text>
        </div>
        <Group gap="sm">
          <Button
            variant="outline"
            color="gray"
            radius="md"
            leftSection={<IconClipboardText size={16} />}
          >
            Báo cáo học tập
          </Button>
          <Button
            onClick={() => setIsGenerateModalOpen(true)}
            color="blue"
            radius="md"
            leftSection={<IconPlus size={16} />}
          >
            Tạo Quiz mới
          </Button>
        </Group>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
        <Tabs.List className="mb-6">
          <Tabs.Tab value="dashboard">Dashboard</Tabs.Tab>
          <Tabs.Tab value="results">Kết quả sinh viên</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard" className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Side: Stats & Active Modules */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Paper withBorder p="md" radius="lg" className="bg-white hover:shadow-md transition-shadow">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <IconClipboardText size={20} />
                  </div>
                  <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                    Bài Quiz Đã Tạo
                  </Text>
                  <Group align="baseline" gap="xs" mt="xs">
                    <span className="text-2xl font-extrabold text-gray-900">12</span>
                    <Text size="xs" fw={700} color="emerald">
                      +2 tuần này
                    </Text>
                  </Group>
                </Paper>

                <Paper withBorder p="md" radius="lg" className="bg-white hover:shadow-md transition-shadow">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <IconUsers size={20} />
                  </div>
                  <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                    Sinh Viên Tham Gia
                  </Text>
                  <Group align="baseline" gap="xs" mt="xs">
                    <span className="text-2xl font-extrabold text-gray-900">148</span>
                    <Text size="xs" fw={700} color="emerald">
                      85% hoạt động
                    </Text>
                  </Group>
                </Paper>

                <Paper withBorder p="md" radius="lg" className="bg-white hover:shadow-md transition-shadow">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <IconTarget size={20} />
                  </div>
                  <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                    Hiệu Suất Lớp
                  </Text>
                  <Group align="baseline" gap="xs" mt="xs">
                    <span className="text-2xl font-extrabold text-gray-900">74.2%</span>
                    <Text size="xs" fw={700} color="indigo">
                      Ổn định
                    </Text>
                  </Group>
                </Paper>
              </div>

              {/* Performance Chart */}
              <Paper withBorder p="md" radius="lg" className="bg-white">
                <Group justify="space-between" mb="lg">
                  <Text fw={700} className="text-gray-900">Xu hướng kết quả của lớp</Text>
                  <Group gap="md">
                    <Group gap={6} align="center">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      <Text size="xs" fw={600} c="dimmed">Điểm trung bình</Text>
                    </Group>
                    <Group gap={6} align="center">
                      <div className="h-[2px] w-4 border-t-2 border-dashed border-gray-400" />
                      <Text size="xs" fw={600} c="dimmed">Mục tiêu lớp</Text>
                    </Group>
                  </Group>
                </Group>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="week"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="performance"
                        stroke="#2563EB"
                        strokeWidth={4}
                        dot={{ r: 6, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="goal"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="6 6"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Paper>

              {/* Created Quizzes List */}
              <Paper withBorder p="md" radius="lg" className="bg-white">
                <Group justify="space-between" mb="md">
                  <Group gap="xs">
                    <IconHelp size={18} className="text-blue-500" />
                    <Text fw={700} className="text-gray-900">Bài Quiz đã tạo gần đây</Text>
                  </Group>
                  <Button variant="subtle" color="blue" size="xs" fw={700}>
                    Xem lịch sử
                  </Button>
                </Group>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Quiz Chương 4: Kinh tế chính trị",
                      items: 20,
                      students: 42,
                      date: "2 giờ trước",
                    },
                    {
                      title: "Kiểm tra 15p: Triết học Mác-Lenin",
                      items: 10,
                      students: 50,
                      date: "1 ngày trước",
                    },
                  ].map((quiz, idx) => (
                    <Paper
                      key={idx}
                      onClick={() => setIsViewQuizOpen(true)}
                      withBorder
                      p="md"
                      radius="lg"
                      className="cursor-pointer hover:shadow-md transition-all hover:border-blue-500/30 group bg-white"
                    >
                      <Group justify="space-between" align="start" mb="xs" wrap="nowrap">
                        <Text fw={700} size="sm" className="text-gray-800 group-hover:text-blue-600 transition-colors">
                          {quiz.title}
                        </Text>
                        <ActionIcon variant="subtle" color="gray" size="sm">
                          <IconEye size={16} />
                        </ActionIcon>
                      </Group>
                      <Group justify="space-between" className="text-xs text-gray-500" mt="sm">
                        <Group gap="xs">
                          <Group gap={4} align="center">
                            <IconBook size={12} />
                            <Text size="xs">{quiz.items} câu</Text>
                          </Group>
                          <Group gap={4} align="center">
                            <IconUsers size={12} />
                            <Text size="xs">{quiz.students} SV</Text>
                          </Group>
                        </Group>
                        <Text size="xs" color="blue">{quiz.date}</Text>
                      </Group>
                    </Paper>
                  ))}
                </div>
              </Paper>
            </div>

            {/* Right Side: Quick Creator & Modules */}
            <Stack gap="md">
              <Paper
                p="md"
                radius="lg"
                className="bg-gradient-to-br from-[#0b4870] to-[#12669e] text-white shadow-lg overflow-hidden relative group"
              >
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                <Stack gap="md" className="relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                    <IconSparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <Text fw={800} size="lg">AI Quiz Generator</Text>
                    <Text size="xs" className="text-blue-100/90 leading-relaxed font-medium mt-1">
                      Tại sao phải soạn câu hỏi thủ công? Để AI trích xuất nội dung từ tài liệu bài giảng của bạn.
                    </Text>
                  </div>
                  <Button
                    onClick={() => setIsGenerateModalOpen(true)}
                    variant="white"
                    color="dark"
                    radius="md"
                    rightSection={<IconArrowRight size={16} />}
                  >
                    Thử nghiệm RAG AI
                  </Button>
                </Stack>
              </Paper>

              <Paper withBorder p="md" radius="lg" className="bg-white">
                <Group justify="space-between" mb="sm">
                  <Text fw={700} size="sm" className="text-gray-900">Học phần đang dạy</Text>
                  <Button variant="subtle" color="blue" size="xs" fw={700}>
                    Xem tất cả
                  </Button>
                </Group>
                <Stack gap="xs">
                  {[
                    {
                      name: "Kinh tế chính trị MLN",
                      code: "MLN111",
                      students: 45,
                      status: "Active",
                    },
                    { name: "Triết học MLN", code: "MLN101", students: 52, status: "Completed" },
                  ].map((course, idx) => (
                    <Group
                      key={idx}
                      justify="space-between"
                      p="xs"
                      className="rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                    >
                      <Group gap="sm">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {course.code.slice(0, 3)}
                        </div>
                        <div>
                          <Text fw={700} size="sm" className="text-gray-800">{course.name}</Text>
                          <Text size="xs" c="dimmed">
                            {course.students} sinh viên
                          </Text>
                        </div>
                      </Group>
                      <IconChevronRight size={16} className="text-gray-400" />
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="results" className="space-y-6">
          <Paper withBorder radius="lg" className="overflow-hidden bg-white">
            <Group justify="space-between" p="md" className="border-b border-gray-100 bg-zinc-50/50">
              <Text fw={700} size="sm" className="text-gray-800">
                Danh sách sinh viên hoàn thành Quiz:{" "}
                <span className="text-blue-600 font-extrabold underline decoration-2 underline-offset-4">
                  Chương 4 - MLN111
                </span>
              </Text>
              <TextInput
                placeholder="Tìm sinh viên..."
                leftSection={<IconSearch size={14} className="text-gray-400" />}
                size="xs"
                radius="md"
              />
            </Group>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Sinh viên</th>
                    <th className="px-6 py-3">Điểm số</th>
                    <th className="px-6 py-3">Thời gian làm</th>
                    <th className="px-6 py-3">Đúng / Sai</th>
                    <th className="px-6 py-3">Ngày nộp</th>
                    <th className="px-6 py-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockStudentResults.map((res) => (
                    <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-900">{res.name}</td>
                      <td className="px-6 py-4">
                        <Badge
                          color={res.score >= 80 ? "emerald" : res.score >= 50 ? "orange" : "red"}
                          variant="light"
                          size="md"
                        >
                          {res.score}/100
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-semibold">{res.time}</td>
                      <td className="px-6 py-4">
                        <Group gap="xs">
                          <Text size="xs" fw={700} color="emerald">{res.correct}✓</Text>
                          <Text size="xs" fw={500} c="dimmed">/</Text>
                          <Text size="xs" fw={700} color="red">{res.wrong}✗</Text>
                        </Group>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                        {res.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionIcon variant="subtle" color="gray" size="sm">
                          <IconEye size={16} />
                        </ActionIcon>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Generate Quiz Modal */}
      <Modal
        opened={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="AI Quiz Generator (RAG)"
        radius="lg"
        centered
      >
        <Stack gap="md">
          <Text size="xs" c="dimmed" fw={500}>
            Sử dụng trí tuệ nhân tạo để trích xuất câu hỏi từ kho bài giảng.
          </Text>

          <Stack gap={4}>
            <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
              Chọn Học phần & Tài liệu
            </Text>
            <NativeSelect radius="md">
              <option>MLN111 - Giáo trình Kinh tế Chính trị</option>
              <option>MLN101 - Tài liệu Triết học Mác-Lênin</option>
            </NativeSelect>
          </Stack>

          <div className="grid grid-cols-2 gap-4">
            <Stack gap={4}>
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                Số lượng câu hỏi
              </Text>
              <NativeSelect radius="md">
                <option>10 Câu</option>
                <option>20 Câu</option>
                <option>30 Câu</option>
              </NativeSelect>
            </Stack>
            <Stack gap={4}>
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                Độ khó gợi ý
              </Text>
              <NativeSelect radius="md">
                <option>Adaptive (AI)</option>
                <option>Cơ bản</option>
                <option>Nâng cao</option>
              </NativeSelect>
            </Stack>
          </div>

          <Paper withBorder p="sm" radius="md" className="bg-blue-50/30 border-blue-100 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <IconSparkles size={20} />
            </div>
            <div>
              <Text size="xs" fw={700} className="text-gray-900">Smart Prompting Hoạt động</Text>
              <Text size="10px" c="dimmed" fw={500}>
                Hệ thống sẽ ưu tiên các nội dung quan trọng đã được giảng viên đánh dấu.
              </Text>
            </div>
          </Paper>

          <Group justify="flex-end" mt="lg">
            <Button variant="outline" color="gray" onClick={() => setIsGenerateModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              onClick={() => {
                setIsGenerateModalOpen(false);
                setIsViewQuizOpen(true);
              }}
              color="blue"
            >
              Bắt đầu khởi tạo
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Quiz Preview Modal */}
      <Modal
        opened={isViewQuizOpen}
        onClose={() => setIsViewQuizOpen(false)}
        title="Preview: Quiz MLN111 - Ch4"
        size="lg"
        radius="lg"
        centered
      >
        <Stack gap="md">
          <Text size="xs" c="dimmed" fw={500}>
            Kiểm tra lại các câu hỏi AI vừa khởi tạo trước khi công khai cho sinh viên.
          </Text>

          <Stack gap="md" className="max-h-[60vh] overflow-y-auto pr-1">
            {[1, 2, 3].map((num) => (
              <Paper
                key={num}
                withBorder
                p="md"
                radius="lg"
                className="relative overflow-hidden group bg-zinc-50/50"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-600" />
                <Group justify="space-between" align="center" mb="xs">
                  <Text size="xs" fw={900} className="uppercase text-blue-600 tracking-wider">
                    Câu hỏi {num}
                  </Text>
                  <Group gap={4}>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" size="sm">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Text fw={700} size="sm" className="text-gray-800 leading-relaxed mb-4">
                  Tại sao hàng hóa có hai thuộc tính là giá trị sử dụng và giá trị? Nhân tố nào quyết định thuộc tính này?
                </Text>

                <Stack gap="xs">
                  {[
                    "Do tính chất lưỡng tính của lao động sản xuất hàng hóa",
                    "Do nhu cầu tiêu dùng của con người",
                    "Do quá trình trao đổi bù trừ",
                    "Do chi phí sản xuất tăng cao",
                  ].map((opt, i) => (
                    <Group
                      key={i}
                      gap="sm"
                      p="xs"
                      className={`rounded-lg border text-xs font-semibold ${
                        i === 0
                          ? "border-emerald-500 bg-emerald-50/20 text-emerald-700"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          i === 0 ? "bg-emerald-600 text-white border-transparent" : "border-gray-300 text-gray-500"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <Text size="xs" fw={600}>{opt}</Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Group justify="flex-end" mt="lg">
            <Button variant="outline" color="gray" onClick={() => setIsViewQuizOpen(false)}>
              Quay lại
            </Button>
            <Button onClick={() => setIsViewQuizOpen(false)} color="blue">
              Công khai bài Quiz
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
