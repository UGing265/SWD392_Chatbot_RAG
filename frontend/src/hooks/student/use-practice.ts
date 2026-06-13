import { useState } from "react";

export const chartData = [
  { week: "W1", score: 62, cohort: 65 },
  { week: "W2", score: 68, cohort: 66 },
  { week: "W3", score: 75, cohort: 68 },
  { week: "W4", score: 92, cohort: 70 },
  { week: "W5", score: 94, cohort: 72 },
];

export function usePractice() {
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");
  const [subject, setSubject] = useState("software-engineering");
  const [difficulty, setDifficulty] = useState("adaptive");
  const [questionsCount, setQuestionsCount] = useState("10");

  const handleGenerateQuiz = () => {
    console.log("Generating quiz with options:", {
      subject,
      difficulty,
      questionsCount,
    });
  };

  return {
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
  };
}
