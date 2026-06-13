"use client";

import { useParams } from "next/navigation";
import { AdminSettingsView } from "@/components/admin/settings/admin-settings-view";
import { SettingsView } from "@/components/common/settings/settings-view";

export default function Page() {
  const params = useParams();
  const role = params?.role as string;

  if (role === "admin") return <AdminSettingsView />;
  return <SettingsView />;
}
