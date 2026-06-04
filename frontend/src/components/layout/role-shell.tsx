"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AdminLayout } from "@/components/layout/admin-layout";

export function RoleShell({ children }: { children: ReactNode }) {
  const params = useParams();
  const role = params?.role as string;

  if (role === "admin") {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <AppLayout>{children}</AppLayout>;
}
