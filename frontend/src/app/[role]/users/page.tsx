"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminUsersView } from "@/components/features/admin-users-view";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const role = params?.role as string;

  useEffect(() => {
    if (role && role !== "admin") {
      router.replace(`/${role}`);
    }
  }, [role, router]);

  if (role !== "admin") {
    return null;
  }

  return <AdminUsersView />;
}
