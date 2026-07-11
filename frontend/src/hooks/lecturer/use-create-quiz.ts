import { useState, useEffect } from "react";

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Subject {
  id: string;
  name: string;
}

export interface AcademicTerm {
  id: string;
  name: string;
}

export function useCreateQuiz() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState<string | null>(null);
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
      })
    );
  };

  const removeOption = (qId: string, oId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          return { ...q, options: q.options.filter((o) => o.id !== oId) };
        }
        return q;
      })
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
      })
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
      })
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

  return {
    title,
    setTitle,
    description,
    setDescription,
    subjectId,
    setSubjectId,
        questions,
    setQuestions,
    subjects,
    terms,
    saving,
    saved,
    setSaved,
    addQuestion,
    removeQuestion,
    updateQuestionText,
    addOption,
    removeOption,
    updateOptionText,
    setCorrectOption,
    handleSave,
  };
}
