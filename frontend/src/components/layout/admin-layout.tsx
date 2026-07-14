"use client";

import { usePathname } from "next/navigation";
import {
  IconBook,
  IconClipboardList,
  IconLayoutDashboard,
  IconShieldCheck,
  IconTerminal2,
  IconUsers,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Badge, Group, Text } from "@mantine/core";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "./sidebar";

const nav = [
  { to: "", label: "Bảng Điều Khiển", icon: IconLayoutDashboard, end: true },
  { to: "/users", label: "Quản Lý Tài Khoản", icon: IconUsers },
  { to: "/assignment", label: "Phân Công Môn Học", icon: IconTerminal2 },
  { to: "/curriculum", label: "Quản Lý Môn Học", icon: IconBook },
  { to: "/metadata", label: "Danh Mục Khác", icon: IconClipboardList },
  { to: "/moderation", label: "Báo Cáo Tài Liệu Xấu", icon: IconShieldCheck },
];

function getPageTitle(pathname: string) {
  const current = nav.find((item) => {
    const fullPath = `/admin${item.to}`;

    if (item.end) return pathname === fullPath || pathname === `${fullPath}/`;
    return pathname.startsWith(fullPath);
  });

  return current?.label || "Admin";
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { signOut, session } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const basePath = "/admin";
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-sky-100">
      <Sidebar
        basePath={basePath}
        navItems={nav}
        session={session}
        signOut={signOut}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        showCollapseButton={true}
      />

      <div className="relative flex min-w-0 flex-1 flex-col bg-white transition-all duration-300">
        <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 md:px-8 xl:px-10">
          <div className="flex w-full items-center justify-between gap-3">
            <Text size="sm" fw={700} className="truncate text-slate-900 md:max-w-[500px]">
              {pageTitle}
            </Text>

            <Group gap="sm">
              <Badge color="dark" variant="light" size="md" radius="lg">
                Admin workspace
              </Badge>
            </Group>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-zinc-50 font-sans">
          <div
            key={pathname}
            className="min-h-full animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
