"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Save,
  Trash2,
  CheckCircle2,
  Circle,
  Check,
  BookOpen,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function CreateQuizView() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [termId, setTermId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      text: "",
      options: [
        { id: "o1", text: "", isCorrect: true },
        { id: "o2", text: "", isCorrect: false },
      ],
    },
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Mock data for dropdowns
    setSubjects([
      { id: "s1", name: "Lập trình Web" },
      { id: "s2", name: "Cơ sở dữ liệu" },
      { id: "s3", name: "Toán cao cấp" },
    ]);
    setTerms([
      { id: "t1", name: "HK1 2024-2025" },
      { id: "t2", name: "HK2 2024-2025" },
    ]);
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q${Date.now()}`,
        text: "",
        options: [
          { id: `o${Date.now()}-1`, text: "", isCorrect: true },
          { id: `o${Date.now()}-2`, text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (qId: string) => {
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const updateQuestionText = (qId: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === qId ? { ...q, text } : q)));
  };

  const addOption = (qId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: [...q.options, { id: `o${Date.now()}`, text: "", isCorrect: false }],
          };
        }
        return q;
      }),
    );
  };

  const removeOption = (qId: string, oId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return { ...q, options: q.options.filter((o) => o.id !== oId) };
        }
        return q;
      }),
    );
  };

  const updateOptionText = (qId: string, oId: string, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.map((o) => (o.id === oId ? { ...o, text } : o)),
          };
        }
        return q;
      }),
    );
  };

  const setCorrectOption = (qId: string, oId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            options: q.options.map((o) => ({ ...o, isCorrect: o.id === oId })),
          };
        }
        return q;
      }),
    );
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  if (saved) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6 bg-zinc-100">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-200">
            <Check className="h-12 w-12 text-white" />
          </div>
          <h2 className="mb-3 text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Tạo Quiz thành công!
          </h2>
          <p className="text-muted-foreground text-lg">Bài kiểm tra đã được lưu vào hệ thống</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-100 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100/50 border border-indigo-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg">
              <HelpCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Tạo Quiz mới
              </h1>
              <p className="text-muted-foreground">Tạo bài kiểm tra thủ công cho sinh viên</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-2">
              <Label className="text-base font-semibold text-gray-700">Tiêu đề Quiz</Label>
              <Input
                placeholder="VD: Bài kiểm tra giữa kỳ 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 text-base rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-base font-semibold text-gray-700">Mô tả</Label>
              <Textarea
                placeholder="Nhập mô tả hoặc hướng dẫn làm bài..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Kỳ học
                </Label>
                <Select value={termId} onValueChange={setTermId}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Chọn kỳ học" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Môn học
                </Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div
              key={q.id}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-100/50 border border-indigo-50 animate-in fade-in duration-300"
            >
              <div className="flex justify-between items-start mb-6 gap-4">
                <div className="flex-1">
                  <Label className="text-lg font-bold text-gray-800 mb-3 block">
                    Câu hỏi {qIndex + 1}
                  </Label>
                  <Input
                    placeholder="Nhập nội dung câu hỏi..."
                    value={q.text}
                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                    className="h-12 text-base rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 font-medium"
                  />
                </div>
                {questions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(q.id)}
                    className="mt-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="space-y-3 pl-2 md:pl-6">
                {q.options.map((opt, oIndex) => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <button
                      onClick={() => setCorrectOption(q.id, opt.id)}
                      className={`flex shrink-0 h-6 w-6 items-center justify-center rounded-full transition-colors ${
                        opt.isCorrect
                          ? "bg-green-500 text-white"
                          : "border-2 border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {opt.isCorrect && <Check className="h-4 w-4" />}
                    </button>
                    <Input
                      placeholder={`Lựa chọn ${oIndex + 1}`}
                      value={opt.text}
                      onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
                      className={`h-11 rounded-xl transition-colors ${opt.isCorrect ? "border-green-200 bg-green-50/50" : "border-gray-200"}`}
                    />
                    {q.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(q.id, opt.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  variant="ghost"
                  onClick={() => addOption(q.id)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl font-medium"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Thêm lựa chọn
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-lg border border-indigo-50 sticky bottom-6 z-10">
          <Button
            variant="outline"
            onClick={addQuestion}
            className="w-full sm:w-auto h-12 rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Thêm câu hỏi mới
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving || !title || !termId || !subjectId}
            className="w-full sm:w-auto h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold shadow-md"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? "Đang lưu..." : "Lưu Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}
