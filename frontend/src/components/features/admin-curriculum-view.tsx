"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  Trash2, 
  ChevronDown, 
  Upload, 
  MoreVertical,
  Layers,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const mockCurriculum = [
  {
    id: "sem-1",
    name: "Kỳ tiếng Anh dự bị",
    subjects: [
      {
        id: "sub-1-1",
        name: "English Foundation 1",
        documents: ["Syllabus_ENG1.pdf", "Grammar_Rules.docx"]
      }
    ]
  },
  {
    id: "sem-2",
    name: "Kỳ 1",
    subjects: [
      {
        id: "sub-2-1",
        name: "Introduction to Computing",
        documents: ["Week1_Introduction.pdf"]
      },
      {
        id: "sub-2-2",
        name: "C Programming",
        documents: []
      }
    ]
  }
];

export function AdminCurriculumView() {
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("studymate_curriculum");
    if (saved) {
      try {
        setCurriculum(JSON.parse(saved));
      } catch (e) {
        setCurriculum(mockCurriculum);
      }
    } else {
      setCurriculum(mockCurriculum);
    }
  }, []);

  // Save to localStorage whenever curriculum changes
  useEffect(() => {
    if (curriculum.length > 0) {
      localStorage.setItem("studymate_curriculum", JSON.stringify(curriculum));
    }
  }, [curriculum]);

  const addSemester = () => {
    const newSem = {
      id: `sem-${Date.now()}`,
      name: `Học kỳ mới ${curriculum.length + 1}`,
      subjects: []
    };
    setCurriculum([...curriculum, newSem]);
  };

  const startEditing = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditingValue(currentValue);
  };

  const saveEdit = (id: string, type: 'semester' | 'subject') => {
    if (!editingValue.trim()) return;

    if (type === 'semester') {
      setCurriculum(curriculum.map(sem => 
        sem.id === id ? { ...sem, name: editingValue } : sem
      ));
    } else {
      setCurriculum(curriculum.map(sem => ({
        ...sem,
        subjects: sem.subjects.map((sub: any) => 
          sub.id === id ? { ...sub, name: editingValue } : sub
        )
      })));
    }
    setEditingId(null);
  };

  const addSubject = (semesterId: string) => {
    const newSubject = {
      id: `sub-${Date.now()}`,
      name: "Môn học mới",
      documents: []
    };
    setCurriculum(curriculum.map(sem => 
      sem.id === semesterId 
        ? { ...sem, subjects: [...sem.subjects, newSubject] }
        : sem
    ));
  };

  const addDocument = (semesterId: string, subjectId: string) => {
    const docName = "New_Document.pdf";
    setCurriculum(curriculum.map(sem => 
      sem.id === semesterId 
        ? {
            ...sem,
            subjects: sem.subjects.map((sub: any) => 
              sub.id === subjectId 
                ? { ...sub, documents: [...sub.documents, docName] }
                : sub
            )
          }
        : sem
    ));
  };

  const removeSemester = (id: string) => {
    setCurriculum(curriculum.filter(sem => sem.id !== id));
  };

  const removeSubject = (semesterId: string, subjectId: string) => {
    setCurriculum(curriculum.map(sem => 
      sem.id === semesterId 
        ? { ...sem, subjects: sem.subjects.filter((sub: any) => sub.id !== subjectId) }
        : sem
    ));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý học kỳ & Chương trình học
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Thiết lập cấu trúc học tập và quản lý tài liệu theo từng học kỳ (Tự động lưu)
          </p>
        </div>
        <Button 
          onClick={addSemester}
          className="rounded-2xl bg-primary px-6 py-2 shadow-soft hover:bg-primary/90 transition-all font-semibold text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm học kỳ mới
        </Button>
      </div>

      <div className="space-y-4">
        {curriculum.map((semester) => (
          <div key={semester.id} className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-soft transition-all hover:shadow-pop">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={semester.id} className="border-none">
                <div className="flex items-center pr-6">
                  <div className="flex-1">
                    {editingId === semester.id ? (
                      <div className="flex items-center gap-4 px-6 py-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Layers className="h-5 w-5" />
                        </div>
                        <input
                          autoFocus
                          className="flex-1 bg-transparent border-b border-primary text-lg font-semibold text-foreground focus:outline-none"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => saveEdit(semester.id, 'semester')}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(semester.id, 'semester')}
                        />
                      </div>
                    ) : (
                      <AccordionTrigger className="w-full px-6 py-5 hover:no-underline group">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Layers className="h-5 w-5" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <h2 className="text-lg font-semibold text-foreground truncate">{semester.name}</h2>
                            <p className="text-xs text-muted-foreground">{semester.subjects.length} môn học</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                    )}
                  </div>
                  
                  {!editingId && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => startEditing(semester.id, semester.name)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        title="Sửa tên học kỳ"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => removeSemester(semester.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        title="Xóa học kỳ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Danh sách môn học</h3>
                      <button 
                        onClick={() => addSubject(semester.id)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        + Thêm môn học
                      </button>
                    </div>
                    
                    {semester.subjects.length > 0 ? (
                      semester.subjects.map((subject: any) => (
                        <div key={subject.id} className="rounded-2xl border border-border/40 bg-muted/20 p-5">
                          <div className="mb-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground shadow-sm ring-1 ring-border/20">
                                <BookOpen className="h-4 w-4" />
                              </div>
                              {editingId === subject.id ? (
                                <input
                                  autoFocus
                                  className="w-full bg-transparent border-b border-primary font-semibold text-foreground focus:outline-none px-1"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onBlur={() => saveEdit(subject.id, 'subject')}
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(subject.id, 'subject')}
                                />
                              ) : (
                                <h4 className="font-semibold text-foreground truncate">{subject.name}</h4>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                               <button 
                                 onClick={() => addDocument(semester.id, subject.id)}
                                 className="flex items-center gap-1.5 rounded-lg bg-white border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-all"
                               >
                                  <Upload className="h-3.5 w-3.5" />
                                  Tải lên
                               </button>
                               <button 
                                 onClick={() => startEditing(subject.id, subject.name)}
                                 className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                                 title="Sửa tên môn học"
                               >
                                  <Pencil className="h-4 w-4" />
                               </button>
                               <button 
                                 onClick={() => removeSubject(semester.id, subject.id)}
                                 className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                 title="Xóa môn học"
                               >
                                  <Trash2 className="h-4 w-4" />
                               </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {subject.documents.length > 0 ? (
                              subject.documents.map((doc: string, idx: number) => (
                                <div key={idx} className="flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-border/20 shadow-sm transition-all hover:ring-primary/20">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-4 w-4 text-primary shrink-0" />
                                    <span className="truncate text-xs font-medium text-foreground">{doc}</span>
                                  </div>
                                  <button className="text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full py-4 text-center">
                                <p className="text-xs text-muted-foreground italic">Chưa có tài liệu nào trong môn học này</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center ring-1 ring-border/20 rounded-2xl bg-muted/10">
                        <p className="text-sm text-muted-foreground">Chưa có môn học nào được tạo</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
