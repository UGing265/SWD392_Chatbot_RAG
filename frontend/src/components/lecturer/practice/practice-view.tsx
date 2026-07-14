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
  IconFileText,
  IconRefresh,
  IconListCheck,
} from "@tabler/icons-react";
import { Line, LineChart, AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
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
  Checkbox,
  Loader,
} from "@mantine/core";

import { usePractice } from "@/hooks/lecturer/use-practice";
import { cn } from "@/lib/utils";

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
    
    // Subjects & docs
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    subjectDocuments,
    selectedDocIds,
    setSelectedDocIds,
    quizzes,
    loadingQuizzes,
    
    // Form config
    totalQuestions,
    setTotalQuestions,
    trueFalseCount,
    setTrueFalseCount,
    singleChoiceCount,
    setSingleChoiceCount,
    multipleChoiceCount,
    setMultipleChoiceCount,
    
    // Generation states
    isGenerating,
    generationProgress,
    generationError,
    previewQuiz,
    
    // Actions
    handleGenerateQuiz,
    handlePublishQuiz,
    handlePreviewQuizClick,
    refreshQuizzes,
  } = usePractice();

  if (!mounted) return null;

  return (
    <div className="flex-1 bg-zinc-50 relative font-sans w-full min-h-screen">
      {/* Sticky elegant header in lecturer style */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full mb-8">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <IconTarget size={20} stroke={1.5} className="text-zinc-900" />
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
              Tạo & Quản lý Quiz
            </h1>
          </div>
          <Group gap="sm">
            <Button
              onClick={() => setIsGenerateModalOpen(true)}
              color="dark"
              radius="lg"
              leftSection={<IconPlus size={16} />}
              className="!h-9 !text-[12px] !px-4 !font-semibold !rounded-lg bg-zinc-900 text-white hover:bg-zinc-800"
            >
              Tạo Quiz mới (AI)
            </Button>
          </Group>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 space-y-8">
        <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="lg">
          <Tabs.List className="mb-6">
            <Tabs.Tab value="dashboard" className="!font-semibold !text-xs uppercase tracking-wider">Dashboard</Tabs.Tab>
            <Tabs.Tab value="results" className="!font-semibold !text-xs uppercase tracking-wider">Kết quả sinh viên</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dashboard" className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Side: Stats & Active Modules */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Card 1: Quiz Created */}
                  <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:-translate-y-0.5 hover:border-zinc-350 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 group">
                    <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200/50">
                      <IconClipboardText size={16} stroke={1.5} />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Bài Quiz Đã Tạo
                    </span>
                    <div className="flex items-baseline justify-between w-full mt-2">
                      <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">{quizzes?.length || 0}</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        Ổn định
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Student Count */}
                  <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:-translate-y-0.5 hover:border-zinc-350 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 group">
                    <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50/50 text-blue-600 border border-blue-100/30">
                      <IconUsers size={16} stroke={1.5} />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Sinh Viên Lớp
                    </span>
                    <div className="flex items-baseline justify-between w-full mt-2">
                      <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">148</span>
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded uppercase tracking-wider">
                        85% hoạt động
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Class Performance */}
                  <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:-translate-y-0.5 hover:border-zinc-350 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 group">
                    <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50/50 text-emerald-600 border border-emerald-100/30">
                      <IconTarget size={16} stroke={1.5} />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Hiệu Suất Lớp
                    </span>
                    <div className="flex items-baseline justify-between w-full mt-2">
                      <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                        74.2<span className="text-[14px] text-zinc-400 font-semibold">%</span>
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        Ổn định
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
                  <div className="flex justify-between items-center w-full mb-6">
                    <h3 className="font-sans font-bold text-[14px] text-zinc-800 uppercase tracking-wider">Xu hướng kết quả của lớp</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-600" />
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Điểm trung bình</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-[1.5px] w-4 border-t-2 border-dashed border-zinc-350" />
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Mục tiêu lớp</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.08}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.00}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis
                          dataKey="week"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 700, fontFamily: "monospace" }}
                          dy={10}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#18181b",
                            borderColor: "#27272a",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: "bold",
                            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="performance"
                          stroke="#4f46e5"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#chartGrad)"
                          dot={{ r: 4, fill: "#4f46e5", stroke: "#fff", strokeWidth: 1.5 }}
                          activeDot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="goal"
                          stroke="#a1a1aa"
                          strokeWidth={1.5}
                          strokeDasharray="6 6"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Created Quizzes List */}
                <Paper withBorder p="md" radius="lg" className="bg-white border-zinc-200/80 shadow-sm">
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <IconHelp size={18} className="text-zinc-500" />
                      <Text fw={700} className="text-zinc-900 font-sans">Bài Quiz trong môn học</Text>
                    </Group>
                    <Group gap="xs">
                      <NativeSelect
                        size="xs"
                        radius="md"
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.currentTarget.value)}
                        className="!w-44"
                      >
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.code}</option>
                        ))}
                      </NativeSelect>
                      <ActionIcon variant="subtle" color="gray" onClick={refreshQuizzes} loading={loadingQuizzes}>
                        <IconRefresh size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {loadingQuizzes ? (
                      <div className="col-span-full py-12 text-center"><Loader size="md" color="dark" /></div>
                    ) : !quizzes || quizzes.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-sm text-zinc-400 font-medium">
                        Không tìm thấy bài Quiz nào cho môn học này.
                      </div>
                    ) : (
                      quizzes?.map((quiz) => {
                        const isPublished = quiz.Status === "published";
                        return (
                          <div
                            key={quiz.ID}
                            onClick={() => handlePreviewQuizClick(quiz.ID)}
                            className="relative flex flex-col items-start justify-between cursor-pointer bg-white border border-zinc-200/60 rounded-2xl p-5 hover:border-zinc-450 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 group shadow-[0_2px_12px_rgba(0,0,0,0.015)]"
                          >
                            {/* Top row */}
                            <div className="flex justify-between items-center w-full mb-3">
                              <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-650">
                                <IconListCheck size={16} stroke={1.5} />
                              </div>
                              <span className={`inline-flex items-center gap-1.5 font-semibold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider ${
                                isPublished
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100/60"
                                  : "bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                              }`}>
                                <div className={`rounded-full w-1 h-1 ${
                                  isPublished ? "bg-emerald-500" : "bg-zinc-400"
                                }`} />
                                {isPublished ? "Public" : "Draft"}
                              </span>
                            </div>

                            {/* Title */}
                            <div className="mb-4 w-full">
                              <h4 className="text-[13px] font-bold text-zinc-800 font-sans leading-snug line-clamp-2 group-hover:text-zinc-950 transition-colors mb-2">
                                {quiz.Title || "Trắc nghiệm RAG"}
                              </h4>
                              <div className="flex items-center gap-1.5 text-zinc-400">
                                <IconBook size={12} stroke={1.5} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{quiz.TotalQuestions} câu hỏi</span>
                              </div>
                            </div>

                            {/* Bottom row */}
                            <div className="flex justify-between items-center w-full pt-3 border-t border-zinc-100">
                              <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400">
                                {new Date(quiz.CreatedAt).toLocaleDateString("vi-VN")}
                              </span>
                              <div className="flex items-center gap-2">
                                {!isPublished && (
                                  <Button
                                    size="xs"
                                    color="emerald"
                                    variant="light"
                                    radius="md"
                                    className="!h-7 !text-[9px] !px-2.5 !font-bold uppercase tracking-wider"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePublishQuiz(quiz.ID);
                                    }}
                                  >
                                    Phát hành
                                  </Button>
                                )}
                                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-50 border border-zinc-200 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                  <IconEye size={14} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Paper>
              </div>

              {/* Right Side: Quick Creator & Modules */}
              <Stack gap="md">
                <div
                  className="p-6 rounded-2xl bg-zinc-900 text-white shadow-lg overflow-hidden relative group w-full"
                >
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                  <Stack gap="md" className="relative z-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner w-10 h-10">
                      <IconSparkles size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-[16px] text-white">AI Quiz Generator</h3>
                      <p className="text-[12px] text-zinc-300 leading-relaxed font-medium mt-1">
                        Sử dụng RAG AI để tự động tạo câu hỏi trắc nghiệm trực tiếp từ tài liệu đã chọn.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsGenerateModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-white text-zinc-950 font-bold rounded-xl h-9 text-xs transition-colors hover:bg-zinc-100 shadow-sm cursor-pointer"
                    >
                      Thử nghiệm RAG AI <IconArrowRight size={14} />
                    </button>
                  </Stack>
                </div>

                <Paper withBorder p="md" radius="lg" className="bg-white border-zinc-200 shadow-sm">
                  <Group justify="space-between" mb="md">
                    <Text fw={700} size="sm" className="text-zinc-900 font-sans uppercase tracking-wider text-[11px] text-zinc-500">Danh sách học phần</Text>
                  </Group>
                  <Stack gap="sm">
                    {subjects.map((course) => {
                      const isSelected = selectedSubjectId === course.id;
                      return (
                        <div
                          key={course.id}
                          onClick={() => setSelectedSubjectId(course.id)}
                          className={`relative flex flex-col items-start justify-between cursor-pointer bg-white border rounded-2xl p-5 hover:border-zinc-450 hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 group ${
                            isSelected
                              ? "border-zinc-900 ring-[0.5px] ring-zinc-900 bg-zinc-50/40"
                              : "border-zinc-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.015)]"
                          }`}
                        >
                          {/* Top row */}
                          <div className="flex justify-between items-center w-full mb-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center text-zinc-650">
                              <IconBook size={16} stroke={1.5} />
                            </div>
                            <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100/80 px-2 py-0.5 rounded uppercase tracking-wider">
                              Bộ tài liệu
                            </span>
                          </div>

                          {/* Code & Title */}
                          <div className="mb-4">
                            <span className="font-mono font-bold text-[10px] tracking-wider text-zinc-400 block mb-0.5">
                              {course.code}
                            </span>
                            <h3 className="text-[13px] font-bold text-zinc-800 font-sans leading-snug line-clamp-2 group-hover:text-zinc-950 transition-colors">
                              {course.name}
                            </h3>
                          </div>

                          {/* Bottom Row */}
                          <div className="flex justify-between items-center w-full pt-3 border-t border-zinc-100">
                            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                              Môn học đang dạy
                            </span>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-zinc-900 text-white"
                                : "bg-zinc-50 border border-zinc-200 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white"
                            }`}>
                              <IconChevronRight size={14} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </Stack>
                </Paper>
              </Stack>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="results" className="space-y-6">
            <Paper withBorder radius="lg" className="overflow-hidden bg-white border-zinc-200 shadow-sm">
              <Group justify="space-between" p="md" className="border-b border-zinc-100 bg-zinc-50/50">
                <Text fw={700} size="sm" className="text-zinc-800">
                  Danh sách sinh viên hoàn thành Quiz
                </Text>
                <TextInput
                  placeholder="Tìm sinh viên..."
                  leftSection={<IconSearch size={14} className="text-gray-400" />}
                  size="xs"
                  radius="lg"
                />
              </Group>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" style={{ minWidth: 800 }}>
                  <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <tr>
                      <th className="px-6 py-3 whitespace-nowrap">Sinh viên</th>
                      <th className="px-6 py-3 whitespace-nowrap">Điểm số</th>
                      <th className="px-6 py-3 whitespace-nowrap">Thời gian làm</th>
                      <th className="px-6 py-3 whitespace-nowrap">Đúng / Sai</th>
                      <th className="px-6 py-3 whitespace-nowrap">Ngày nộp</th>
                      <th className="px-6 py-3 text-right whitespace-nowrap">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {mockStudentResults.map((res) => (
                      <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-zinc-900 whitespace-nowrap">{res.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-1 rounded-md whitespace-nowrap ${
                            res.score >= 80 ? "bg-emerald-50 text-emerald-600" :
                            res.score >= 50 ? "bg-amber-50 text-amber-600" :
                            "bg-red-50 text-red-600"
                          }`}>
                            <div className={`rounded-full w-1.5 h-1.5 ${
                              res.score >= 80 ? "bg-emerald-500" :
                              res.score >= 50 ? "bg-amber-500" :
                              "bg-red-500"
                            }`} />
                            {res.score}/100
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 font-semibold whitespace-nowrap">{res.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Group gap="xs">
                            <Text size="xs" fw={700} color="emerald">{res.correct}✓</Text>
                            <Text size="xs" fw={500} c="dimmed">/</Text>
                            <Text size="xs" fw={700} color="red">{res.wrong}✗</Text>
                          </Group>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-zinc-500 whitespace-nowrap">
                          {res.date}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
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
      </div>

      {/* Generate Quiz Modal */}
      <Modal
        opened={isGenerateModalOpen}
        onClose={() => !isGenerating && setIsGenerateModalOpen(false)}
        title={
          <Group gap="xs">
            <IconSparkles size={18} className="text-zinc-900" />
            <Text fw={700} className="text-zinc-900 font-sans text-sm uppercase tracking-wider">AI Quiz Generator (RAG)</Text>
          </Group>
        }
        radius="2xl"
        centered
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
        styles={{
          header: { borderBottom: '1px solid #f4f4f5', paddingBottom: '12px' },
          content: { boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)' }
        }}
      >
        <Stack gap="md" pt="xs">
          <Text size="xs" c="dimmed" fw={500} className="leading-relaxed">
            Hệ thống sử dụng mô hình Gemini để đọc, phân tích và trích xuất câu hỏi trắc nghiệm tự động dựa trên tài liệu tham khảo được chọn bên dưới.
          </Text>

          <Stack gap={4}>
            <Text className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Chọn Môn Học
            </Text>
            <NativeSelect
              radius="lg"
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.currentTarget.value);
                setSelectedDocIds([]);
              }}
              disabled={isGenerating}
              classNames={{
                input: "!bg-zinc-50/50 !border-zinc-200 !h-9 !text-[13px] !font-medium !rounded-xl"
              }}
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
              ))}
            </NativeSelect>
          </Stack>

          <Stack gap={4}>
            <Text className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Chọn Tài Liệu Tham Khảo (RAG)
            </Text>
            {subjectDocuments.length === 0 ? (
              <div className="p-3 border border-red-100 bg-red-50/30 rounded-xl">
                <Text size="xs" c="red" className="font-semibold">Môn học này chưa có tài liệu nào. Hãy tải lên tài liệu trước.</Text>
              </div>
            ) : (
              <Stack gap="xs" style={{ maxHeight: 150, overflowY: 'auto' }} className="border border-zinc-200/80 rounded-xl p-3 bg-zinc-50/20">
                {subjectDocuments.map((doc) => (
                  <Checkbox
                    key={doc.id}
                    label={doc.title}
                    checked={selectedDocIds.includes(doc.id)}
                    onChange={(event) => {
                      if (event.currentTarget.checked) {
                        setSelectedDocIds([...selectedDocIds, doc.id]);
                      } else {
                        setSelectedDocIds(selectedDocIds.filter(id => id !== doc.id));
                      }
                    }}
                    disabled={isGenerating}
                    styles={{
                      label: { fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' },
                      inner: { cursor: 'pointer' }
                    }}
                  />
                ))}
              </Stack>
            )}
          </Stack>

          <div className="grid grid-cols-2 gap-4">
            <Stack gap={4}>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Tổng Số Câu Hỏi
              </Text>
              <TextInput
                type="number"
                radius="lg"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                disabled={isGenerating}
                classNames={{
                  input: "!bg-zinc-50/50 !border-zinc-200 !h-9 !text-[13px] !font-medium !rounded-xl !pl-3"
                }}
              />
            </Stack>
            <Stack gap={4}>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Độ Khó (AI)
              </Text>
              <NativeSelect
                radius="lg" 
                disabled={isGenerating}
                classNames={{
                  input: "!bg-zinc-50/50 !border-zinc-200 !h-9 !text-[13px] !font-medium !rounded-xl"
                }}
              >
                <option>Tự động (Adaptive)</option>
              </NativeSelect>
            </Stack>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stack gap={2}>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Đúng/Sai</Text>
              <TextInput
                type="number"
                radius="md"
                size="xs"
                value={trueFalseCount}
                onChange={(e) => setTrueFalseCount(Number(e.target.value))}
                disabled={isGenerating}
                classNames={{
                  input: "!bg-zinc-50/50 !border-zinc-200 !h-8 !text-[12px] !font-medium !rounded-lg !text-center"
                }}
              />
            </Stack>
            <Stack gap={2}>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">1 Đáp án</Text>
              <TextInput
                type="number"
                radius="md"
                size="xs"
                value={singleChoiceCount}
                onChange={(e) => setSingleChoiceCount(Number(e.target.value))}
                disabled={isGenerating}
                classNames={{
                  input: "!bg-zinc-50/50 !border-zinc-200 !h-8 !text-[12px] !font-medium !rounded-lg !text-center"
                }}
              />
            </Stack>
            <Stack gap={2}>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nhiều đáp án</Text>
              <TextInput
                type="number"
                radius="md"
                size="xs"
                value={multipleChoiceCount}
                onChange={(e) => setMultipleChoiceCount(Number(e.target.value))}
                disabled={isGenerating}
                classNames={{
                  input: "!bg-zinc-50/50 !border-zinc-200 !h-8 !text-[12px] !font-medium !rounded-lg !text-center"
                }}
              />
            </Stack>
          </div>

          {isGenerating && (
            <Stack gap="xs" mt="sm">
              <Group justify="space-between" className="text-xs font-semibold text-zinc-700">
                <Text size="xs">Đang sinh câu hỏi bằng AI...</Text>
                <Text size="xs">{generationProgress}%</Text>
              </Group>
              <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200">
                <div className="bg-zinc-900 h-full transition-all duration-300" style={{ width: `${generationProgress}%` }} />
              </div>
            </Stack>
          )}

          {generationError && (
            <Text size="xs" c="red" fw={600} mt="sm">{generationError}</Text>
          )}

          <Group justify="flex-end" mt="lg" className="border-t border-zinc-100 pt-4">
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={isGenerating}
              className="px-4 h-9 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 border border-zinc-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleGenerateQuiz}
              disabled={subjectDocuments.length === 0 || selectedDocIds.length === 0 || isGenerating}
              className="px-4 h-9 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? "Đang xử lý..." : "Bắt đầu khởi tạo"}
            </button>
          </Group>
        </Stack>
      </Modal>


    </div>
  );
}
