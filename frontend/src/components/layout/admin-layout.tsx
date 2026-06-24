"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBook,
  IconClipboardList,
  IconLayoutDashboard,
  IconLayoutSidebar,
  IconLogout,
  IconShieldCheck,
  IconTerminal2,
  IconUsers,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Avatar, Badge, Group, Menu, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type TablerIcon = typeof IconUsers;

const nav = [
  { to: "", label: "Bảng Điều Khiển", icon: IconLayoutDashboard, end: true },
  { to: "/users", label: "Quản Lý Tài Khoản", icon: IconUsers },
  { to: "/assignment", label: "Phân Công Môn Học", icon: IconTerminal2 },
  { to: "/curriculum", label: "Quản Lý Học Kỳ", icon: IconBook },
  { to: "/metadata", label: "Danh Mục Khác", icon: IconClipboardList },
  { to: "/moderation", label: "Báo Cáo Tài Liệu Xấu", icon: IconShieldCheck },
];

function getRoleLabel(role?: string) {
  if (role === "admin") return "Admin";
  if (role === "lecturer" || role === "teacher") return "Lecturer";
  if (role === "student") return "Student";
  return "User";
}

function getInitials(name?: string | null) {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getPageTitle(pathname: string) {
  const current = nav.find((item) => {
    const fullPath = `/admin${item.to}`;

    if (item.end) return pathname === fullPath || pathname === `${fullPath}/`;
    return pathname.startsWith(fullPath);
  });

  return current?.label || "Admin";
}

function SidebarItem({
  to,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  to: string;
  label: string;
  icon: TablerIcon;
  active: boolean;
  collapsed: boolean;
}) {
  const item = (
    <Link
      href={to}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "group flex items-center rounded-[8px] py-2.5 text-[14px] font-medium transition-colors duration-150",
        collapsed ? "justify-center px-2" : "gap-3 px-3",
        active
          ? "bg-slate-200 text-slate-900"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon
        size={18}
        className={cn(active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700")}
      />
      {!collapsed && <span className="flex-1">{label}</span>}
    </Link>
  );

  if (!collapsed) return item;

  return (
    <Tooltip label={label} position="right" withArrow>
      {item}
    </Tooltip>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { signOut, session } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const basePath = "/admin";
  const displayName = session?.user?.name || "Người dùng";
  const roleLabel = getRoleLabel(session?.role || "admin");
  const initials = getInitials(displayName);
  const pageTitle = getPageTitle(pathname);

  const isActive = (to: string, end?: boolean) => {
    const full = `${basePath}${to}`;

    if (end) return pathname === full || pathname === `${full}/`;
    return pathname.startsWith(full);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-sky-100">
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-slate-200 bg-[#FAFAFA] transition-[width] duration-300 md:flex",
          sidebarCollapsed ? "w-[76px]" : "w-[260px]",
        )}
      >
        <div
          className={cn(
            "flex items-center pb-4 pt-5",
            sidebarCollapsed ? "justify-center px-3" : "justify-between px-4",
          )}
        >
          {!sidebarCollapsed && (
            <Link
              href={basePath}
              className="px-1 text-[18px] font-bold tracking-tight text-slate-900"
            >
              StudyMate
            </Link>
          )}
          <Tooltip
            label={sidebarCollapsed ? "Mở sidebar" : "Đóng sidebar"}
            position="right"
            withArrow
          >
            <UnstyledButton
              aria-label={sidebarCollapsed ? "Mở sidebar" : "Đóng sidebar"}
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="rounded-[6px] p-1.5 text-slate-500 transition-colors duration-150 hover:bg-slate-200 hover:text-slate-900"
            >
              <IconLayoutSidebar size={18} />
            </UnstyledButton>
          </Tooltip>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          {nav.map((item) => (
            <SidebarItem
              key={item.to}
              to={`${basePath}${item.to}`}
              label={item.label}
              icon={item.icon}
              active={isActive(item.to, item.end)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 px-3 py-4">
          <Menu shadow="md" position="top-start" radius="lg" offset={12} withArrow>
            <Menu.Target>
              <UnstyledButton
                aria-label={sidebarCollapsed ? "Tài khoản Admin" : undefined}
                className={cn(
                  "flex w-full items-center rounded-[8px] transition-colors duration-150 hover:bg-slate-200",
                  sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                )}
              >
                <Avatar
                  color="blue"
                  variant="light"
                  radius="xl"
                  size="sm"
                  className="text-xs font-bold"
                >
                  {initials}
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1 leading-tight">
                    <Text size="sm" fw={600} className="truncate text-slate-900">
                      {displayName}
                    </Text>
                    <Text size="xs" className="mt-0.5 font-medium capitalize text-slate-500">
                      {roleLabel}
                    </Text>
                  </div>
                )}
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown className="min-w-[200px] p-1">
              <Menu.Item
                component={Link}
                href="/admin/change-password"
                className="transition-colors duration-150 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 px-1 py-1">
                  <Avatar
                    color="blue"
                    variant="light"
                    radius="xl"
                    size="md"
                    className="text-sm font-bold"
                  >
                    {initials}
                  </Avatar>
                  <div className="flex min-w-0 flex-col leading-tight">
                    <Text size="sm" fw={600} className="whitespace-nowrap text-slate-900">
                      {displayName}
                    </Text>
                    <Text size="xs" className="mt-0.5 whitespace-nowrap text-slate-500">
                      {session?.user?.email || "Email"}
                    </Text>
                  </div>
                </div>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={() => signOut()}
                className="text-red-600 hover:bg-red-50"
              >
                Đăng xuất
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </aside>

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
