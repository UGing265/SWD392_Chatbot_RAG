"use client";

import { useState, useEffect, useMemo } from "react";
import {
  IconActivity,
  IconCircleCheck,
  IconTarget,
  IconClipboardList,
  IconBook,
  IconChevronRight,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  Paper,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  Progress,
} from "@mantine/core";
import { quizApi, SubjectWithQuiz, QuizSummary, SubmitAttemptResponse } from "@/api/quiz";

interface SubjectAttemptData {
  subject: SubjectWithQuiz;
  quizzes: QuizSummary[];
  attempts: SubmitAttemptResponse[];
}

export function StudentDashboard({ onNavigateToQuizzes }: { onNavigateToQuizzes: () => void }) {
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<SubjectAttemptData[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const subjectsRes = await quizApi.getSubjectsWithQuizzes();
        const subjects = subjectsRes.data || [];

        const allSubjectData: SubjectAttemptData[] = [];

        for (const subject of subjects) {
          try {
            const quizzes = await quizApi.listQuizzesForStudent(subject.id);
            const quizList = quizzes || [];

            let allAttempts: SubmitAttemptResponse[] = [];
            for (const quiz of quizList) {
              try {
                const historyRes = await quizApi.getAttemptHistory(quiz.ID);
                if (historyRes.data) {
                  allAttempts = [...allAttempts, ...historyRes.data];
                }
              } catch {
                // Skip quiz if history fetch fails
              }
            }

            allSubjectData.push({
              subject,
              quizzes: quizList,
              attempts: allAttempts,
            });
          } catch {
            // Skip subject if quizzes fetch fails
          }
        }

        setSubjectData(allSubjectData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Computed statistics
  const stats = useMemo(() => {
    const allAttempts = subjectData.flatMap((s) => s.attempts);
    const totalAttempts = allAttempts.length;
    const totalQuizzes = subjectData.reduce((acc, s) => acc + s.quizzes.length, 0);

    const avgScore = totalAttempts > 0
      ? allAttempts.reduce((acc, a) => acc + a.Score, 0) / totalAttempts
      : 0;

    const bestScore = totalAttempts > 0
      ? Math.max(...allAttempts.map((a) => a.Score))
      : 0;

    // Recent attempts (sorted by date, last 8)
    const recentAttempts = [...allAttempts]
      .sort((a, b) => new Date(b.CompletedAt || b.StartedAt).getTime() - new Date(a.CompletedAt || a.StartedAt).getTime())
      .slice(0, 8);

    return { totalAttempts, totalQuizzes, avgScore, bestScore, recentAttempts };
  }, [subjectData]);

  if (loading) {
    return (
      <Center className="py-20">
        <Stack gap="xs" align="center">
          <Loader size="md" color="indigo" />
          <Text size="xs" className="text-zinc-500 font-medium">Đang tải dữ liệu Dashboard...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Paper withBorder p="xl" radius="2xl" className="bg-white border-zinc-200/60 shadow-sm hover:border-zinc-300 transition-all duration-300">
          <Group gap="sm" align="center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/50">
              <IconClipboardList size={18} stroke={1.5} />
            </div>
            <div>
              <Text size="9px" fw={750} className="text-zinc-400 uppercase tracking-wider block mb-0.5">Tổng đề thi</Text>
              <span className="text-xl font-black text-zinc-900">{stats.totalQuizzes}</span>
            </div>
          </Group>
        </Paper>

        <Paper withBorder p="xl" radius="2xl" className="bg-white border-zinc-200/60 shadow-sm hover:border-zinc-300 transition-all duration-300">
          <Group gap="sm" align="center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50">
              <IconCircleCheck size={18} stroke={1.5} />
            </div>
            <div>
              <Text size="9px" fw={750} className="text-zinc-400 uppercase tracking-wider block mb-0.5">Lượt làm bài</Text>
              <span className="text-xl font-black text-zinc-900">{stats.totalAttempts}</span>
            </div>
          </Group>
        </Paper>

        <Paper withBorder p="xl" radius="2xl" className="bg-white border-zinc-200/60 shadow-sm hover:border-zinc-300 transition-all duration-300">
          <Group gap="sm" align="center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50">
              <IconTarget size={18} stroke={1.5} />
            </div>
            <div>
              <Text size="9px" fw={750} className="text-zinc-400 uppercase tracking-wider block mb-0.5">Điểm trung bình</Text>
              <span className="text-xl font-black text-zinc-900">{stats.avgScore.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-zinc-400">/100</span>
            </div>
          </Group>
        </Paper>

        <Paper withBorder p="xl" radius="2xl" className="bg-white border-zinc-200/60 shadow-sm hover:border-zinc-300 transition-all duration-300">
          <Group gap="sm" align="center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100/50">
              <IconTrendingUp size={18} stroke={1.5} />
            </div>
            <div>
              <Text size="9px" fw={750} className="text-zinc-400 uppercase tracking-wider block mb-0.5">Điểm cao nhất</Text>
              <span className="text-xl font-black text-zinc-900">{stats.bestScore.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-zinc-400">/100</span>
            </div>
          </Group>
        </Paper>
      </div>

      {/* Two Columns: Recent Attempts + Subjects */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Attempts Table */}
        <Paper withBorder p="xl" radius="2xl" className="bg-white border-zinc-200/60 shadow-sm lg:col-span-3">
          <Group gap="xs" mb="lg">
            <IconActivity size={16} className="text-indigo-600" />
            <Text fw={750} className="text-zinc-800 uppercase tracking-wider text-[11px] font-sans">
              Lịch sử làm bài gần đây
            </Text>
          </Group>

          {stats.recentAttempts.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto h-14 w-14 bg-zinc-50 rounded-full flex items-center justify-center mb-3 text-zinc-300 border border-zinc-100">
                <IconClipboardList size={24} />
              </div>
              <Text size="sm" fw={600} className="text-zinc-500">Chưa có lượt làm bài nào</Text>
              <Text size="xs" className="text-zinc-400 mt-1">
                Hãy bắt đầu làm bài Quiz ở tab &quot;Đề thi hệ thống&quot;.
              </Text>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-150 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    <th className="pb-3 pr-3">#</th>
                    <th className="pb-3 px-3">Điểm</th>
                    <th className="pb-3 px-3">Câu đúng</th>
                    <th className="pb-3 pl-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs font-medium">
                  {stats.recentAttempts.map((attempt, idx) => {
                    const dateObj = attempt.CompletedAt
                      ? new Date(attempt.CompletedAt)
                      : new Date(attempt.StartedAt);
                    const formattedDate =
                      dateObj.toLocaleDateString("vi-VN") +
                      " " +
                      dateObj.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    const scoreColor =
                      attempt.Score >= 80
                        ? "text-emerald-600"
                        : attempt.Score >= 50
                        ? "text-amber-600"
                        : "text-rose-600";

                    return (
                      <tr key={attempt.ID} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3 pr-3 font-mono text-zinc-400 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-extrabold text-sm ${scoreColor}`}>
                            {attempt.Score.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-bold">/100</span>
                        </td>
                        <td className="py-3 px-3 text-zinc-700 font-semibold">
                          {attempt.TotalCorrect} câu
                        </td>
                        <td className="py-3 pl-3 text-zinc-500 text-[11px]">
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Paper>

        {/* Subjects Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <Group gap="xs">
            <IconBook size={16} className="text-indigo-600" />
            <Text fw={750} className="text-zinc-800 uppercase tracking-wider text-[11px] font-sans">
              Tổng quan môn học
            </Text>
          </Group>

          {subjectData.length === 0 ? (
            <Paper withBorder p="xl" radius="2xl" className="bg-white border-zinc-200/60 shadow-sm text-center py-10">
              <Text size="sm" fw={600} className="text-zinc-500">Chưa có môn học nào</Text>
            </Paper>
          ) : (
            <Stack gap="sm">
              {subjectData.map((sd) => {
                const subjectAttempts = sd.attempts.length;
                const subjectAvg = subjectAttempts > 0
                  ? sd.attempts.reduce((acc, a) => acc + a.Score, 0) / subjectAttempts
                  : 0;
                const progressColor = subjectAvg >= 80 ? "teal" : subjectAvg >= 50 ? "yellow" : "red";

                return (
                  <Paper
                    key={sd.subject.id}
                    withBorder
                    p="lg"
                    radius="2xl"
                    className="bg-white border-zinc-200/60 shadow-sm hover:border-zinc-300 transition-all duration-300 cursor-pointer group"
                    onClick={onNavigateToQuizzes}
                  >
                    <Group justify="space-between" mb="xs">
                      <div>
                        <Text size="9px" fw={700} className="text-zinc-400 uppercase tracking-widest mb-0.5">
                          {sd.subject.code}
                        </Text>
                        <Text fw={750} size="sm" className="text-zinc-800 group-hover:text-indigo-600 transition-colors leading-snug">
                          {sd.subject.name}
                        </Text>
                      </div>
                      <IconChevronRight size={14} className="text-zinc-300 group-hover:text-indigo-600 transition-colors" />
                    </Group>

                    <div className="mt-3 space-y-2">
                      <Group justify="space-between">
                        <Text size="xs" fw={700} className="text-zinc-400 text-[9px] uppercase tracking-wider">
                          ĐTB: {subjectAvg.toFixed(1)}/100
                        </Text>
                        <Text size="xs" fw={700} className="text-zinc-500 text-[10px]">
                          {subjectAttempts} lượt • {sd.quizzes.length} đề
                        </Text>
                      </Group>
                      <Progress
                        value={subjectAvg}
                        color={progressColor}
                        size="xs"
                        radius="xl"
                        className="bg-zinc-100"
                      />
                    </div>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </div>
      </div>
    </div>
  );
}
