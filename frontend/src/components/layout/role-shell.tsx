"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Loader, Center } from "@mantine/core";
import { AppLayout } from "@/components/layout/app-layout";
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
      <Center className="min-h-screen bg-zinc-50">
        <Loader size="lg" color="blue" />
      </Center>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}

