"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Target, Sparkles, BookOpen, Clock, Activity, CheckCircle2, MoreHorizontal, ArrowRight } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { week: "W1", score: 62, cohort: 65 },
  { week: "W2", score: 68, cohort: 66 },
  { week: "W3", score: 75, cohort: 68 },
  { week: "W4", score: 92, cohort: 70 },
  { week: "W5", score: 94, cohort: 72 },
];

export function StudentPracticeView() {
  const router = useRouter();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Quiz Intelligence Lab</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your active learning modules, generate dynamic practice quizzes, and track your academic performance metrics.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Active Modules & Performance */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Modules */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <BookOpen className="h-4 w-4 text-primary" /> Active Modules
              </h2>
              <button className="text-sm font-medium text-primary hover:underline">
                View All
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <span className="text-lg font-bold">&lt;&gt;</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    In Progress
                  </div>
                </div>
                <h3 className="mb-1 text-base font-bold text-foreground">Software Engineering</h3>
                <p className="mb-4 text-sm text-muted-foreground">CS302 • Prof. Jenkins</p>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Course Mastery</span>
                  <span className="font-bold text-blue-600">78%</span>
                </div>
                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: "78%" }} />
                </div>
                <div className="flex items-end justify-between border-t border-border/60 pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Last Quiz Score</p>
                    <p className="text-lg font-bold text-foreground">92/100</p>
                  </div>
                  <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Resume <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-2 w-2 rounded-sm bg-current" />
                      <div className="h-2 w-2 rounded-sm bg-current" />
                      <div className="h-2 w-2 rounded-sm bg-current opacity-50" />
                      <div className="h-2 w-2 rounded-sm bg-current opacity-50" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Needs Review
                  </div>
                </div>
                <h3 className="mb-1 text-base font-bold text-foreground">Operating Systems</h3>
                <p className="mb-4 text-sm text-muted-foreground">CS315 • Prof. Lin</p>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Course Mastery</span>
                  <span className="font-bold text-slate-600">45%</span>
                </div>
                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-slate-300" style={{ width: "45%" }} />
                </div>
                <div className="flex items-end justify-between border-t border-border/60 pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Next Quiz</p>
                    <p className="text-sm font-bold text-foreground">Tomorrow, 10 AM</p>
                  </div>
                  <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Prep <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Activity className="h-4 w-4 text-primary" /> Academic Performance
              </h2>
              <div className="flex rounded-lg border border-border p-1">
                {(["Weekly", "Monthly"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold ${period === p ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-4 sm:col-span-1">
                <div className="flex flex-col justify-center rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Quizzes Completed</p>
                      <div className="mt-0.5 flex items-end gap-2">
                        <span className="text-2xl font-bold text-foreground">24</span>
                        <span className="text-xs font-medium text-emerald-600">+3 this week</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Average Score</p>
                      <div className="mt-0.5 flex items-end gap-2">
                        <span className="text-2xl font-bold text-foreground">86%</span>
                        <span className="text-xs font-medium text-emerald-600">+2.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft sm:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground">Score Trend vs Cohort</h3>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-[200px] w-full">
                  <ChartContainer
                    config={{
                      score: { label: "Your Score", color: "hsl(var(--primary))" },
                      cohort: { label: "Cohort Average", color: "hsl(var(--muted-foreground))" },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} dy={10} />
                        <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: "#2563EB" }} activeDot={{ r: 6 }} name="Your Score" />
                        <Line type="monotone" dataKey="cohort" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Cohort Average" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-sm bg-blue-600" /> Your Score
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-[2px] w-4 border-t-2 border-dashed border-gray-400" /> Cohort Average
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Quiz Generator */}
        <div className="lg:col-span-1 rounded-3xl bg-[#0b4870] p-6 text-white shadow-lg">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="mb-2 text-xl font-bold tracking-tight">Quick Quiz Generator</h2>
          <p className="mb-8 text-sm text-blue-100/80 leading-relaxed">
            Instantly generate a tailored quiz based on your recent study materials or specific knowledge gaps.
          </p>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-blue-200">
                Target Subject / Topic
              </label>
              <div className="relative">
                <select className="h-10 w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20">
                  <option value="software-engineering" className="bg-[#0b4870] text-white">Software Engineering - Ch 4</option>
                  <option value="operating-systems" className="bg-[#0b4870] text-white">Operating Systems - Memory</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-blue-200">
                  Difficulty
                </label>
                <div className="relative">
                  <select className="h-10 w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20">
                    <option value="adaptive" className="bg-[#0b4870] text-white">Adaptive</option>
                    <option value="easy" className="bg-[#0b4870] text-white">Easy</option>
                    <option value="hard" className="bg-[#0b4870] text-white">Hard</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-blue-200">
                  Questions
                </label>
                <div className="relative">
                  <select className="h-10 w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20">
                    <option value="10" className="bg-[#0b4870] text-white">10 Questions</option>
                    <option value="20" className="bg-[#0b4870] text-white">20 Questions</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0b4870] shadow-md transition-transform hover:scale-[1.02]">
              <Sparkles className="h-4 w-4" /> Generate via RAG AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
