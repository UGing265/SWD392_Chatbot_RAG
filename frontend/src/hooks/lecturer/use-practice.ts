import { useState, useEffect, useCallback, useRef } from "react";
import { quizApi, QuizSummary, QuizDetailResponse, GenerateQuizRequest } from "@/api/quiz";
import { ragApi } from "@/api/client";

export const chartData = [
  { week: "W1", performance: 65, goal: 70 },
  { week: "W2", performance: 62, goal: 70 },
  { week: "W3", performance: 78, goal: 70 },
  { week: "W4", performance: 85, goal: 70 },
  { week: "W5", performance: 88, goal: 70 },
];

export const mockStudentResults = [
  {
    id: "ST1",
    name: "Lê Văn A",
    score: 95,
    time: "12m",
    correct: 19,
    wrong: 1,
    date: "2024-06-01",
  },
  {
    id: "ST2",
    name: "Nguyễn Thị B",
    score: 80,
    time: "15m",
    correct: 16,
    wrong: 4,
    date: "2024-06-02",
  },
  {
    id: "ST3",
    name: "Trần Văn C",
    score: 45,
    time: "8m",
    correct: 9,
    wrong: 11,
    date: "2024-06-03",
  },
];

export interface Subject {
  id: string;
  code: string;
  name: string;
}

export interface DocumentInfo {
  id: string;
  title: string;
  subject_id: string;
}

export function usePractice() {
  const [activeTab, setActiveTab] = useState<string | null>("dashboard");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isViewQuizOpen, setIsViewQuizOpen] = useState(false);

  // Real data state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  
  // Generation state
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [trueFalseCount, setTrueFalseCount] = useState<number>(2);
  const [singleChoiceCount, setSingleChoiceCount] = useState<number>(6);
  const [multipleChoiceCount, setMultipleChoiceCount] = useState<number>(2);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  const [previewQuiz, setPreviewQuiz] = useState<QuizDetailResponse | null>(null);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch subjects & documents on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const lookupsRes = await ragApi.get("/documents/lookups");
        if (lookupsRes.data && lookupsRes.data.subjects) {
          setSubjects(lookupsRes.data.subjects);
          if (lookupsRes.data.subjects.length > 0) {
            setSelectedSubjectId(lookupsRes.data.subjects[0].id);
          }
        }
        
        const docsRes = await ragApi.get("/documents/my");
        if (docsRes.data && docsRes.data.documents) {
          setDocuments(docsRes.data.documents.map((d: any) => ({
            id: d.id,
            title: d.title || d.original_file_name || "Tài liệu",
            subject_id: d.subject_id,
          })));
        }
      } catch (err) {
        console.error("Failed to load initial lookups for practice module:", err);
      }
    };
    loadInitialData();
  }, []);

  // Fetch quizzes when subject changes
  const fetchQuizzes = useCallback(async () => {
    if (!selectedSubjectId) return;
    setLoadingQuizzes(true);
    try {
      const data = await quizApi.listQuizzesForLecturer(selectedSubjectId);
      setQuizzes(data);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    } finally {
      setLoadingQuizzes(false);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Filter documents matching selected subject
  const subjectDocuments = documents.filter((d) => d.subject_id === selectedSubjectId);

  // Clean polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleGenerateQuiz = async () => {
    if (!selectedSubjectId || selectedDocIds.length === 0) {
      setGenerationError("Vui lòng chọn môn học và ít nhất 1 tài liệu.");
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationError(null);
    
    try {
      const reqPayload: GenerateQuizRequest = {
        subject_id: selectedSubjectId,
        document_ids: selectedDocIds,
        total_questions: totalQuestions,
        true_false_count: trueFalseCount,
        single_choice_count: singleChoiceCount,
        multiple_choice_count: multipleChoiceCount,
      };
      
      const response = await quizApi.generateQuiz(reqPayload);
      const jobId = response.job_id;
      
      // Start polling
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      
      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await quizApi.getJobStatus(jobId);
          setGenerationProgress(status.Progress || 30);
          
          if (status.Status === "completed") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsGenerating(false);
            setGenerationProgress(100);
            
            if (status.ResultQuizID) {
              const quizDetail = await quizApi.getQuizDetail(status.ResultQuizID);
              setPreviewQuiz(quizDetail);
              setIsGenerateModalOpen(false);
              setIsViewQuizOpen(true);
              fetchQuizzes();
            }
          } else if (status.Status === "failed") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsGenerating(false);
            setGenerationError(status.ErrorMessage || "AI thất bại trong việc khởi tạo câu hỏi.");
          }
        } catch (err) {
          console.error("Job status polling error:", err);
        }
      }, 1500);
      
    } catch (err: any) {
      setIsGenerating(false);
      setGenerationError(err?.response?.data?.error || "Không thể yêu cầu tạo Quiz.");
    }
  };

  const handlePublishQuiz = async (quizId: string) => {
    try {
      await quizApi.publishQuiz(quizId);
      setIsViewQuizOpen(false);
      fetchQuizzes();
    } catch (err) {
      console.error("Failed to publish quiz:", err);
      alert("Phát hành Quiz thất bại.");
    }
  };

  const handlePreviewQuizClick = async (quizId: string) => {
    try {
      const quizDetail = await quizApi.getQuizDetail(quizId);
      setPreviewQuiz(quizDetail);
      setIsViewQuizOpen(true);
    } catch (err) {
      console.error("Failed to load preview details:", err);
    }
  };

  return {
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
    refreshQuizzes: fetchQuizzes,
  };
}
