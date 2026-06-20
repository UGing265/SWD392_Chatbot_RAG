"use client";

import { useRouter } from "next/navigation";
import {
  IconChevronRight,
  IconTarget,
  IconSparkles,
  IconBook,
  IconClock,
  IconCircleCheck,
  IconArrowRight,
  IconActivity,
  IconChevronDown,
} from "@tabler/icons-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  Button,
  Paper,
  Text,
  Group,
  Stack,
  Badge,
  NativeSelect,
  Progress,
} from "@mantine/core";
import { usePractice } from "@/hooks/student/use-practice";

export function StudentPracticeView() {
  const router = useRouter();
  const {
    period,
    setPeriod,
    subject,
    setSubject,
    difficulty,
    setDifficulty,
    questionsCount,
    setQuestionsCount,
    handleGenerateQuiz,
    chartData,
  } = usePractice();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Quiz Intelligence Lab</h1>
        <Text size="sm" c="dimmed" className="mt-1 font-medium">
          Quản lý các phần tự học, tự động sinh câu hỏi trắc nghiệm bằng AI và theo dõi sát sao tiến trình học tập của bạn.
        </Text>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Active Modules & Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Modules */}
          <div>
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconBook size={18} className="text-blue-600" />
                <Text fw={700} className="text-gray-900">Lớp học hoạt động</Text>
              </Group>
              <Button variant="subtle" color="blue" size="xs" fw={700}>
                Xem tất cả
              </Button>
            </Group>

            <div className="grid gap-4 sm:grid-cols-2">
              <Paper withBorder p="md" radius="lg" className="bg-white hover:shadow-md transition-shadow">
                <Group justify="space-between" mb="md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">
                    &lt;&gt;
                  </div>
                  <Badge color="cyan" variant="light" size="xs">
                    Đang tiến hành
                  </Badge>
                </Group>
                <Text fw={700} size="sm" className="text-gray-900 mb-0.5">Kiến trúc phần mềm</Text>
                <Text size="xs" c="dimmed" className="mb-4">CS302 • GV. Jenkins</Text>

                <Group justify="space-between" mb="xs">
                  <Text size="xs" fw={600} c="dimmed">Mức độ thành thạo</Text>
                  <Text size="xs" fw={700} color="blue">78%</Text>
                </Group>
                <Progress value={78} color="blue" size="xs" radius="xl" className="mb-4" />

                <div className="flex items-end justify-between border-t border-gray-100 pt-4 mt-4">
                  <div>
                    <Text size="10px" c="dimmed" className="uppercase tracking-wider">Điểm Quiz gần nhất</Text>
                    <Text fw={900} size="md" className="text-gray-900">92/100</Text>
                  </div>
                  <Button
                    variant="subtle"
                    color="blue"
                    size="xs"
                    rightSection={<IconArrowRight size={14} />}
                    p={0}
                  >
                    Tiếp tục
                  </Button>
                </div>
              </Paper>

              <Paper withBorder p="md" radius="lg" className="bg-white hover:shadow-md transition-shadow">
                <Group justify="space-between" mb="md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-2 w-2 rounded-sm bg-current" />
                      <div className="h-2 w-2 rounded-sm bg-current" />
                      <div className="h-2 w-2 rounded-sm bg-current opacity-50" />
                      <div className="h-2 w-2 rounded-sm bg-current opacity-50" />
                    </div>
                  </div>
                  <Badge color="orange" variant="light" size="xs">
                    Cần ôn tập
                  </Badge>
                </Group>
                <Text fw={700} size="sm" className="text-gray-900 mb-0.5">Hệ điều hành</Text>
                <Text size="xs" c="dimmed" className="mb-4">CS315 • GV. Lin</Text>

                <Group justify="space-between" mb="xs">
                  <Text size="xs" fw={600} c="dimmed">Mức độ thành thạo</Text>
                  <Text size="xs" fw={700} color="gray">45%</Text>
                </Group>
                <Progress value={45} color="gray" size="xs" radius="xl" className="mb-4" />

                <div className="flex items-end justify-between border-t border-gray-100 pt-4 mt-4">
                  <div>
                    <Text size="10px" c="dimmed" className="uppercase tracking-wider">Bài Quiz tiếp theo</Text>
                    <Text fw={700} size="xs" className="text-gray-900">Ngày mai, 10 AM</Text>
                  </div>
                  <Button
                    variant="subtle"
                    color="blue"
                    size="xs"
                    rightSection={<IconChevronRight size={14} />}
                    p={0}
                  >
                    Chuẩn bị
                  </Button>
                </div>
              </Paper>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="space-y-4">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <IconActivity size={18} className="text-blue-600" />
                <Text fw={700} className="text-gray-900">Hiệu suất học tập</Text>
              </Group>
              <Group gap="xs">
                {(["Weekly", "Monthly"] as const).map((p) => (
                  <Button
                    key={p}
                    onClick={() => setPeriod(p)}
                    variant={period === p ? "light" : "subtle"}
                    color={period === p ? "blue" : "gray"}
                    size="xs"
                    radius="md"
                  >
                    {p === "Weekly" ? "Hàng tuần" : "Hàng tháng"}
                  </Button>
                ))}
              </Group>
            </Group>

            <div className="grid gap-4 sm:grid-cols-3">
              <Stack gap="sm" className="sm:col-span-1">
                <Paper withBorder p="md" radius="lg" className="bg-white">
                  <Group gap="sm" align="center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <IconCircleCheck size={20} />
                    </div>
                    <div>
                      <Text size="xs" c="dimmed" fw={600}>Hoàn thành Quiz</Text>
                      <Group align="baseline" gap="xs">
                        <span className="text-xl font-bold text-gray-900">24</span>
                        <Text size="xs" fw={700} color="emerald">+3 tuần này</Text>
                      </Group>
                    </div>
                  </Group>
                </Paper>

                <Paper withBorder p="md" radius="lg" className="bg-white">
                  <Group gap="sm" align="center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <IconTarget size={20} />
                    </div>
                    <div>
                      <Text size="xs" c="dimmed" fw={600}>Điểm trung bình</Text>
                      <Group align="baseline" gap="xs">
                        <span className="text-xl font-bold text-gray-900">86%</span>
                        <Text size="xs" fw={700} color="emerald">+2.4%</Text>
                      </Group>
                    </div>
                  </Group>
                </Paper>
              </Stack>

              <Paper withBorder p="md" radius="lg" className="bg-white sm:col-span-2">
                <Text size="xs" fw={700} c="dimmed" mb="md" className="uppercase tracking-wider">
                  Xu hướng điểm số với lớp học
                </Text>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="week"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        dy={10}
                      />
                      <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#2563EB"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#2563EB" }}
                        activeDot={{ r: 6 }}
                        name="Điểm của bạn"
                      />
                      <Line
                        type="monotone"
                        dataKey="cohort"
                        stroke="#9CA3AF"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Trung bình lớp"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <Group justify="center" gap="lg" mt="sm">
                  <Group gap={6} align="center">
                    <div className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
                    <Text size="xs" fw={600} c="dimmed">Điểm của bạn</Text>
                  </Group>
                  <Group gap={6} align="center">
                    <div className="h-[2px] w-4 border-t-2 border-dashed border-gray-400" />
                    <Text size="xs" fw={600} c="dimmed">Trung bình lớp</Text>
                  </Group>
                </Group>
              </Paper>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Quiz Generator */}
        <Paper
          p="lg"
          radius="lg"
          className="bg-gradient-to-br from-[#0b4870] to-[#12669e] text-white shadow-lg relative group overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
          <Stack gap="md" className="relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
              <IconSparkles size={20} className="text-white" />
            </div>
            <div>
              <Text fw={800} size="lg">AI Quiz Generator</Text>
              <Text size="xs" className="text-blue-100/90 leading-relaxed font-medium mt-1">
                Tự động sinh bài thi trắc nghiệm dựa trên tài liệu bài giảng đã chọn của môn học.
              </Text>
            </div>

            <Stack gap="md" mt="sm">
              <Stack gap={4}>
                <Text size="xs" fw={700} className="text-blue-200">Môn học / Chủ đề mục tiêu</Text>
                <NativeSelect
                  radius="md"
                  value={subject}
                  onChange={(e) => setSubject(e.currentTarget.value)}
                  styles={{
                    input: {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      fontWeight: 600,
                    },
                  }}
                >
                  <option value="software-engineering" className="bg-[#0b4870] text-white">
                    Kiến trúc phần mềm - Chương 4
                  </option>
                  <option value="operating-systems" className="bg-[#0b4870] text-white">
                    Hệ điều hành - Bộ nhớ
                  </option>
                </NativeSelect>
              </Stack>

              <div className="grid grid-cols-2 gap-3">
                <Stack gap={4}>
                  <Text size="xs" fw={700} className="text-blue-200">Độ khó</Text>
                  <NativeSelect
                    radius="md"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.currentTarget.value)}
                    styles={{
                      input: {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 600,
                      },
                    }}
                  >
                    <option value="adaptive" className="bg-[#0b4870] text-white">
                      Thích ứng
                    </option>
                    <option value="easy" className="bg-[#0b4870] text-white">
                      Dễ
                    </option>
                    <option value="hard" className="bg-[#0b4870] text-white">
                      Khó
                    </option>
                  </NativeSelect>
                </Stack>

                <Stack gap={4}>
                  <Text size="xs" fw={700} className="text-blue-200">Số câu hỏi</Text>
                  <NativeSelect
                    radius="md"
                    value={questionsCount}
                    onChange={(e) => setQuestionsCount(e.currentTarget.value)}
                    styles={{
                      input: {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 600,
                      },
                    }}
                  >
                    <option value="10" className="bg-[#0b4870] text-white">
                      10 Câu
                    </option>
                    <option value="20" className="bg-[#0b4870] text-white">
                      20 Câu
                    </option>
                  </NativeSelect>
                </Stack>
              </div>

              <Button
                variant="white"
                color="dark"
                radius="md"
                className="mt-4"
                leftSection={<IconSparkles size={16} />}
                onClick={handleGenerateQuiz}
              >
                Sinh Đề với AI
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </div>
    </div>
  );
}
