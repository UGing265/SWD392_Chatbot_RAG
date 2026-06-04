"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ChevronRight, Target, Sparkles, BookOpen, Clock, 
  Activity, CheckCircle2, MoreHorizontal, ArrowRight, 
  Plus, Users, ClipboardList, HelpCircle, Eye, Trash2, Search
} from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const chartData = [
  { week: "W1", performance: 65, goal: 70 },
  { week: "W2", performance: 62, goal: 70 },
  { week: "W3", performance: 78, goal: 70 },
  { week: "W4", performance: 85, goal: 70 },
  { week: "W5", performance: 88, goal: 70 },
];

const mockStudentResults = [
  { id: "ST1", name: "Lê Văn A", score: 95, time: "12m", correct: 19, wrong: 1, date: "2024-06-01" },
  { id: "ST2", name: "Nguyễn Thị B", score: 80, time: "15m", correct: 16, wrong: 4, date: "2024-06-02" },
  { id: "ST3", name: "Trần Văn C", score: 45, time: "8m", correct: 9, wrong: 11, date: "2024-06-03" },
];

export function TeacherPracticeView() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isViewQuizOpen, setIsViewQuizOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Quiz Intelligence Lab</h1>
          <p className="mt-1 text-muted-foreground font-medium">
            Quản lý bài tập, theo dõi tiến độ sinh viên và tối ưu hóa câu hỏi bằng AI.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-border bg-white shadow-soft">
            <ClipboardList className="mr-2 h-4 w-4" /> Báo cáo học tập
          </Button>
          <Button onClick={() => setIsGenerateModalOpen(true)} className="rounded-xl bg-primary shadow-soft hover:shadow-pop transition-all">
            <Plus className="mr-2 h-4 w-4" /> Tạo Quiz mới
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 rounded-xl bg-muted/50 p-1 mb-8">
          <TabsTrigger value="dashboard" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-soft">Dashboard</TabsTrigger>
          <TabsTrigger value="results" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-soft">Kết quả sinh viên</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-8 outline-none">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Side: Stats & Active Modules */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft hover:shadow-md transition-shadow">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bài Quiz Đã Tạo</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">12</span>
                    <span className="text-xs font-bold text-emerald-600">+2 tuần này</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft hover:shadow-md transition-shadow">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sinh Viên Tham Gia</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">148</span>
                    <span className="text-xs font-bold text-emerald-600">85% active</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft hover:shadow-md transition-shadow">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Target className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hiệu Suất Lớp</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">74.2%</span>
                    <span className="text-xs font-bold text-indigo-600">Ổn định</span>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-bold text-foreground">Xu hướng kết quả của lớp</h3>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Điểm trung bình</div>
                    <div className="flex items-center gap-1.5"><div className="h-[2px] w-4 border-t-2 border-dashed border-gray-400" /> Mục tiêu lớp</div>
                  </div>
                </div>
                <div className="h-[260px] w-full">
                  <ChartContainer config={{ performance: { label: "Hiệu suất", color: "hsl(var(--primary))" } }} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} dy={10} />
                        <YAxis hide domain={[0, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="performance" stroke="#2563EB" strokeWidth={4} dot={{ r: 6, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        <Line type="monotone" dataKey="goal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 6" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              {/* Created Quizzes List */}
              <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" /> Bài Quiz đã tạo gần đây
                  </h3>
                  <button className="text-xs font-bold text-primary hover:underline">Xem lịch sử</button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { title: "Quiz Chương 4: Kinh tế chính trị", items: 20, students: 42, date: "2 giờ trước" },
                    { title: "Kiểm tra 15p: Triết học Mác-Lenin", items: 10, students: 50, date: "1 ngày trước" },
                  ].map((quiz, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border/50 bg-muted/5 hover:bg-white hover:shadow-md transition-all group cursor-pointer" onClick={() => setIsViewQuizOpen(true)}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{quiz.title}</div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-lg">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {quiz.items} câu</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {quiz.students} SV</span>
                        <span className="ml-auto text-primary/70">{quiz.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Quick Creator & Modules */}
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-br from-[#0b4870] to-[#12669e] p-6 text-white shadow-lg overflow-hidden relative group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                <div className="relative z-10">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="mb-2 text-xl font-black tracking-tight">AI Quiz Generator</h2>
                  <p className="mb-6 text-sm text-blue-100/90 leading-relaxed font-medium">
                    Tại sao phải soạn câu hỏi thủ công? Để AI trích xuất nội dung từ tài liệu bài giảng của bạn.
                  </p>
                  <Button onClick={() => setIsGenerateModalOpen(true)} className="w-full rounded-xl bg-white text-[#0b4870] hover:bg-white/90 font-bold h-11 shadow-soft hover:shadow-pop transform transition-all active:scale-95">
                    Thử nghiệm RAG AI <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">Học phần đang dạy</h3>
                  <button className="text-xs font-bold text-primary hover:underline">Xem tất cả</button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Kinh tế chính trị MLN', code: 'MLN111', students: 45, status: 'Active' },
                    { name: 'Triết học MLN', code: 'MLN101', students: 52, status: 'Completed' }
                  ].map((course, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                          {course.code.slice(0, 3)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{course.name}</div>
                          <div className="text-[11px] font-semibold text-muted-foreground">{course.students} sinh viên</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="outline-none space-y-6">
          <div className="rounded-2xl border border-border shadow-soft overflow-hidden bg-white">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <h3 className="font-bold text-sm">Danh sách sinh viên hoàn thành Quiz: <span className="text-primary tracking-tight font-black underline decoration-2 underline-offset-4">Chương 4 - MLN111</span></h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" placeholder="Tìm sinh viên..." className="h-8 pl-8 pr-4 text-xs font-medium rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary w-48" />
                </div>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/10 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Sinh viên</th>
                  <th className="px-6 py-3">Điểm số</th>
                  <th className="px-6 py-3">Thời gian làm</th>
                  <th className="px-6 py-3">Đúng / Sai</th>
                  <th className="px-6 py-3">Ngày nộp</th>
                  <th className="px-6 py-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockStudentResults.map((res) => (
                  <tr key={res.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4 font-bold text-foreground">{res.name}</td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-black",
                        res.score >= 80 ? "bg-emerald-50 text-emerald-700" : res.score >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                      )}>
                        {res.score}/100
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">{res.time}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className="text-emerald-600">{res.correct}✓</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-red-500">{res.wrong}✗</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-semibold text-muted-foreground">{res.date}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="h-7 w-7 rounded-lg p-0 hover:bg-primary/10 hover:text-primary transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Quiz Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">AI Quiz Generator (RAG)</DialogTitle>
            <DialogDescription className="font-medium">
              Sử dụng trí tuệ nhân tạo để trích xuất câu hỏi từ kho bài giảng.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6 border-y border-border/60 my-4">
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chọn Học phần & Tài liệu</label>
              <select className="flex h-11 w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10 transition-all">
                <option>MLN111 - Giáo trình Kinh tế Chính trị</option>
                <option>MLN101 - Tài liệu Triết học Mác-Lênin</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Số lượng câu hỏi</label>
                <div className="relative">
                  <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <select className="h-10 w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-semibold outline-none appearance-none">
                    <option>10 Câu</option>
                    <option>20 Câu</option>
                    <option>30 Câu</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Độ khó gợi ý</label>
                <select className="h-10 w-full rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-semibold outline-none appearance-none">
                  <option>Adaptive (AI)</option>
                  <option>Cơ bản</option>
                  <option>Nâng cao</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Smart Prompting Active</p>
                <p className="text-[10px] text-muted-foreground font-medium">Hệ thống sẽ ưu tiện các nội dung quan trọng đã được giảng viên đánh dấu.</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)} className="rounded-xl font-bold">Hủy bỏ</Button>
            <Button onClick={() => { setIsGenerateModalOpen(false); setIsViewQuizOpen(true); }} className="rounded-xl font-black shadow-pop">Bắt đầu khởi tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Quiz Preview Modal */}
      <Dialog open={isViewQuizOpen} onOpenChange={setIsViewQuizOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">Preview: Quiz MLN111 - Ch4</DialogTitle>
            <DialogDescription className="font-medium">
              Kiểm tra lại các câu hỏi AI vừa khởi tạo trước khi công khai cho sinh viên.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="p-5 rounded-2xl border border-border bg-muted/5 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary group-hover:w-1.5 transition-all" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">Câu hỏi {num}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 transition-colors"><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <p className="text-sm font-bold text-foreground leading-relaxed">
                  Tại sao hàng hóa có hai thuộc tính là giá trị sử dụng và giá trị? Nhân tố nào quyết định thuộc tính này?
                </p>
                <div className="space-y-2">
                  {['Do tính chất lưỡng tính của lao động sản xuất hàng hóa', 'Do nhu cầu tiêu dùng của con người', 'Do quá trình trao đổi bù trừ', 'Do chi phí sản xuất tăng cao'].map((opt, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold transition-all",
                      i === 0 ? "border-emerald-500/50 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20" : "border-border bg-white text-muted-foreground"
                    )}>
                      <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center shrink-0", i === 0 ? "bg-emerald-500 text-white border-transparent" : "border-border")}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="pt-4 border-t border-border mt-2">
            <Button variant="outline" onClick={() => setIsViewQuizOpen(false)} className="rounded-xl font-bold">Quay lại</Button>
            <Button onClick={() => setIsViewQuizOpen(false)} className="rounded-xl font-black shadow-pop">Công khai bài Quiz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Edit2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
}