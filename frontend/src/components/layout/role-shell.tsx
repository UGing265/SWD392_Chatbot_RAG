"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useAuth } from "@/hooks/use-auth";

export function RoleShell({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const role = params?.role as string;
  const actualRole = session?.role;

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      router.replace("/login");
      return;
    }

    if (actualRole && role !== actualRole) {
      router.replace(`/${actualRole}`);
    }
  }, [actualRole, isLoading, role, router, session]);

  if (isLoading || !session || !actualRole || role !== actualRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role === "admin") {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <AppLayout>{children}</AppLayout>;
}
