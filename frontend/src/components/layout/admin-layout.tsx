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
          ? "bg-zinc-100 text-gray-905"
          : "text-gray-500 hover:bg-zinc-50 hover:text-gray-905",
      )}
    >
      <Icon
        size={18}
        className={cn(
          active ? "text-gray-905" : "text-gray-400 group-hover:text-gray-905",
        )}
      />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

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
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-gray-200 bg-zinc-50/50 md:flex">
        <div className="px-5 pb-6 pt-6">
          <Link href={basePath} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <IconClipboardList size={18} />
            </div>
            <div className="text-[19px] font-bold tracking-tight text-gray-900">StudyMate</div>
          </Link>
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

        <div className="mt-auto border-t border-gray-200 p-3">
          <div className="flex w-full items-center justify-between">
            <Menu shadow="md" width={240} position="top-start" radius="md">
              <Menu.Target>
                <UnstyledButton className="mr-1 flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-zinc-100">
                  <Avatar color="dark" radius="xl" size="sm">
                    {initials}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Text size="sm" fw={600} className="truncate text-gray-900 leading-tight">
                      {displayName}
                    </Text>
                    <Text size="10px" fw={700} className="uppercase tracking-wide text-blue-600 mt-0.5">
                      {roleLabel}
                    </Text>
                  </div>
                  <IconSelector size={16} className="text-gray-400 shrink-0" />
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Quản trị viên</Menu.Label>
                <div className="px-3 py-2 flex items-center gap-3">
                  <Avatar color="dark" radius="xl" size="md">
                    {initials}
                  </Avatar>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <Text size="sm" fw={750} className="truncate text-gray-900">
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

            <Badge color="teal" variant="light" size="md">
              Admin workspace
            </Badge>
          </Group>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
