"use client";

import { useParams, redirect } from "next/navigation";
import { AdminDashboardView } from "@/components/admin/dashboard/admin-dashboard-view";
import { DocumentsView as LecturerDocumentsView } from "@/components/features/teacher-documents-view";

export default function Page() {
  const params = useParams();
  const role = params?.role as string;

  if (role === "admin") {
    return <AdminDashboardView />;
  }

  if (role === "lecturer") {
    return <LecturerDocumentsView />;
  }

  // Redirect student to the new chat landing page
  redirect(`/${role}/chat`);
}
