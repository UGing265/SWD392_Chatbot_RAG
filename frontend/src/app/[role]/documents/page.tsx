"use client";

import { useParams } from "next/navigation";
import { AdminDocumentsView } from "@/components/admin/documents/admin-documents-view";
import { StudentDocumentsView } from "@/components/features/student-documents-view";
import { DocumentsView } from "@/components/features/teacher-documents-view";

export default function Page() {
  const params = useParams();
  const urlRole = params?.role as string;

  if (urlRole === "admin") return <AdminDocumentsView />;
  if (urlRole === "lecturer") return <DocumentsView />;
  return <StudentDocumentsView />;
}
