"use client";

import { useParams } from "next/navigation";
import { StudentPracticeView } from "@/components/student/practice/student-practice-view";
import { TeacherPracticeView } from "@/components/lecturer/practice/practice-view";
import { useAuth } from "@/hooks/use-auth";

export default function PracticePage() {
  const { session } = useAuth();
  const params = useParams();
  const userRole = (params?.role as string) || session?.role || "student";

  return userRole === "student" ? <StudentPracticeView /> : <TeacherPracticeView />;
}
