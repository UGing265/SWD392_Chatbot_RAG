"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, Sparkles, Brain, CheckCircle2, Loader2, Target, Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StudentPracticeView } from "@/components/features/student-practice-view";
import { TeacherPracticeView } from "@/components/features/teacher-practice-view";
import { useAuth } from "@/hooks/use-auth";


export default function PracticePage() {
  const { session } = useAuth();
  const params = useParams();
  const userRole = (params?.role as string) || session?.role || "student";

  return userRole === "student" ? <StudentPracticeView /> : <TeacherPracticeView />;
}
