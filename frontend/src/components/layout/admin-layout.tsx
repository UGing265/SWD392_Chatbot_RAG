"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconUsers,
  IconTerminal2,
  IconBook,
  IconShieldCheck,
  IconClipboardList,
  IconSelector,
  IconSettings,
  IconArrowUpCircle,
  IconDownload,
  IconDeviceDesktop,
  IconLanguage,
  IconHelp,
  IconChevronRight,
  IconLogout,
  IconBell,
  IconLayoutSidebar,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Menu, Avatar, Text, Group, Stack, Badge, UnstyledButton } from "@mantine/core";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "", label: "Bảng điều khiển", icon: IconLayoutDashboard, end: true },
  { to: "/users", label: "Quản lý tài khoản", icon: IconUsers },
  { to: "/assignment", label: "Phân công môn học", icon: IconTerminal2 },
  { to: "/curriculum", label: "Quản lý học kỳ", icon: IconBook },
  { to: "/moderation", label: "Kiểm duyệt tài liệu", icon: IconShieldCheck },
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
}: {
  to: string;
  label: string;
  icon: any;
  active: boolean;
}) {
  return (
    <Link
      href={to}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
        active
          ? "bg-zinc-200/50 text-gray-900"
          : "text-gray-600 hover:bg-zinc-100/60 hover:text-gray-900",
      )}
    >
      <Icon
        size={18}
        className={cn(
          active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900",
        )}
      />
      <span className="flex-1">{label}</span>
    </Link>
  );}

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { signOut, session } = useAuth();
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
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-blue-100">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-gray-200 bg-zinc-50 md:flex">
        {/* Brand */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3.5">
          <Link href={basePath} className="text-[18px] font-bold tracking-tight text-gray-900 px-1">
            StudyMate
          </Link>
          <UnstyledButton className="rounded-lg p-1.5 text-gray-400 hover:bg-zinc-150 hover:text-gray-900 transition-colors">
            <IconLayoutSidebar size={18} />
          </UnstyledButton>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {nav.map((item) => (
            <SidebarItem
              key={item.to}
              to={`${basePath}${item.to}`}
              label={item.label}
              icon={item.icon}
              active={isActive(item.to, item.end)}
            />
          ))}
        </nav>

        {/* Profile / Bottom actions */}
        <div className="mt-auto p-3 border-t border-gray-200">
          <Menu shadow="md" width={240} position="top-start" radius="md">
            <Menu.Target>
              <UnstyledButton className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-zinc-100 transition-colors">
                <Avatar color="dark" radius="xl" size="sm" className="font-semibold text-xs">
                  {initials}
                </Avatar>
                <div className="flex-1 min-w-0 leading-tight">
                  <Text size="sm" fw={550} className="truncate text-gray-900">
                    {displayName}
                  </Text>
                  <Text size="xs" className="text-gray-500 font-normal mt-0.5 capitalize">
                    {roleLabel}
                  </Text>
                </div>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Quản trị viên</Menu.Label>
              <div className="px-3 py-2 flex items-center gap-3">
                <Avatar color="dark" radius="xl" size="md" className="font-semibold text-sm">
                  {initials}
                </Avatar>
                <div className="flex flex-col min-w-0 leading-tight">
                  <Text size="sm" fw={700} className="truncate text-gray-900">
                    {displayName}
                  </Text>
                  <Text size="10px" fw={700} className="uppercase tracking-wide text-blue-600 mt-0.5">
                    {roleLabel}
                  </Text>
                  <Text size="xs" c="dimmed" className="truncate mt-0.5">
                    {session?.user?.email || "Email"}
                  </Text>
                </div>
              </div>
              <Menu.Divider />
              <Menu.Item leftSection={<IconSettings size={14} />}>
                Cài đặt
              </Menu.Item>
              <Menu.Item leftSection={<IconArrowUpCircle size={14} />}>
                Nâng cấp gói
              </Menu.Item>
              <Menu.Item leftSection={<IconDownload size={14} />}>
                Cài ứng dụng
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconDeviceDesktop size={14} />}>
                Giao diện
              </Menu.Item>
              <Menu.Item leftSection={<IconLanguage size={14} />}>
                Ngôn ngữ
              </Menu.Item>
              <Menu.Item leftSection={<IconHelp size={14} />}>
                Trợ giúp
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={() => signOut()}>
                Đăng xuất
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/70 px-6 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Text size="sm" fw={700} className="truncate text-gray-900 md:max-w-[500px]">
              {pageTitle}
            </Text>
          </div>

          <Group gap="sm">
            <UnstyledButton className="relative rounded-md p-2 text-gray-400 transition-colors hover:bg-zinc-100 hover:text-gray-600">
              <IconBell size={20} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
            </UnstyledButton>

            <Badge color="dark" variant="light" size="md">
              Admin workspace
            </Badge>
          </Group>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
