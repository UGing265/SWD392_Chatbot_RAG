import { RoleShell } from "@/components/layout/role-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleShell>{children}</RoleShell>;
}
