"use client";

import { useParams } from "next/navigation";
import { AdminDashboardView } from "@/components/features/admin-dashboard-view";
import { DocumentsView as TeacherDocumentsView } from "@/components/features/teacher-documents-view";
import { StudentDocumentsView } from "@/components/features/student-documents-view";

export default function Page() {
  const params = useParams();
  const role = params?.role as string;

  if (role === "admin") {
    return <AdminDashboardView />;
  }

  if (role === "teacher") {
    return <TeacherDocumentsView />;
  }

  return <StudentDocumentsView />;
}
