"use client";

import { useParams } from "next/navigation";
import { AdminSettingsView } from "@/components/features/admin-settings-view";
import { SettingsView } from "@/components/features/settings-view";

export default function Page() {
  const params = useParams();
  const role = params?.role as string;

  if (role === "admin") return <AdminSettingsView />;
  return <SettingsView />;
}
