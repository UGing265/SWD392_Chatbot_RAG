"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter, useSearchParams } from "next/navigation";
import {
  IconSparkles,
  IconHistory,
  IconBook,
  IconFileText,
  IconUpload,
  IconPlus,
  IconClipboardList,
  IconMessage2,
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
import { Menu, Avatar, Text, Group, Stack, Badge, UnstyledButton } from "@mantine/core";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { createSession, sessionList } from "@/lib/sessions-store";

const nav = [
  { to: "/chat", label: "Chat", icon: IconSparkles, studentOnly: true },
  { to: "/sessions", label: "Lịch sử chat", icon: IconHistory, studentOnly: true },
  { to: "/documents/shared", label: "Tài liệu chung", icon: IconBook },
  { to: "/documents/my", label: "Tài liệu riêng", icon: IconFileText, lecturerOnly: true },
  { to: "/upload", label: "Upload Tài liệu", icon: IconUpload, lecturerOnly: true },
  { to: "/quiz/create", label: "Tạo Quiz", icon: IconPlus, lecturerOnly: true },
  { to: "/quiz/take", label: "Làm Quiz", icon: IconClipboardList, studentOnly: true },
];

function getRoleLabel(role?: string) {
  if (role === "admin") return "Admin";
  if (role === "lecturer" || role === "teacher") return "Lecturer";
  if (role === "student") return "Student";
  return "User";
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
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors ${
        active
          ? "bg-zinc-100 text-gray-900"
          : "text-gray-500 hover:bg-zinc-50 hover:text-gray-900"
      }`}
    >
      <Icon
        size={18}
        className={active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900"}
      />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const pathRole = pathname.split("/")[1] || "";
  const role = (params?.role as string) || pathRole;
  const basePath = role ? `/${role}` : "";
  const { signOut, session } = useAuth();
  const roleLabel = getRoleLabel(session?.role || role);
  const router = useRouter();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-blue-100">
      {/* Sidebar */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-gray-200 bg-zinc-50/50 md:flex">
        {/* Brand */}
        <div className="px-5 pt-6 pb-6">
          <Link href={`${basePath}/chat`} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <IconClipboardList size={18} />
            </div>
            <div className="text-[19px] font-bold tracking-tight text-gray-900">StudyMate</div>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {nav
            .filter((n) => {
              if (n.studentOnly && role !== "student") return false;
              if (n.lecturerOnly && role !== "lecturer" && role !== "teacher") return false;
              return true;
            })
            .map((n) => {
              const fullPath = n.to === "/" ? basePath : `${basePath}${n.to}`;
              return (
                <SidebarItem
                  key={n.to}
                  to={fullPath}
                  label={n.label}
                  icon={n.icon}
                  active={
                    pathname === fullPath ||
                    (fullPath !== basePath && pathname.startsWith(fullPath))
                  }
                />
              );
            })}
        </nav>

        {/* Recent Chats Section */}
        {role === "student" && (
          <div className="mt-6 px-4">
            <Text size="xs" fw={700} c="dimmed" mb="xs" className="uppercase tracking-widest px-2">
              Gần đây
            </Text>
            <div className="flex flex-col gap-0.5">
              {sessionList.slice(0, 5).map((session) => (
                <Link
                  key={session.id}
                  href={`${basePath}/chat?session=${session.id}`}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors",
                    searchParams?.get("session") === session.id
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-500 hover:bg-zinc-100 hover:text-gray-900",
                  )}
                >
                  <IconMessage2 size={14} className="shrink-0 opacity-70 group-hover:opacity-100" />
                  <span className="truncate flex-1">{session.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Profile / Bottom actions */}
        <div className="mt-auto p-3 border-t border-gray-200">
          <Group justify="space-between" wrap="nowrap">
            <Menu shadow="md" width={240} position="top-start" radius="md">
              <Menu.Target>
                <UnstyledButton className="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1.5 text-left hover:bg-zinc-100 transition-colors">
                  <Avatar color="blue" radius="xl" size="sm">
                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Text size="sm" fw={600} className="truncate text-gray-900 leading-tight">
                      {session?.user?.name || "Người dùng"}
                    </Text>
                    <Text size="10px" fw={700} className="uppercase tracking-wide text-blue-600 mt-0.5">
                      {roleLabel}
                    </Text>
                  </div>
                  <IconSelector size={16} className="text-gray-400 shrink-0" />
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Tài khoản</Menu.Label>
                <div className="px-3 py-2 flex items-center gap-3">
                  <Avatar color="blue" radius="xl" size="md">
                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <Text size="sm" fw={700} className="truncate text-gray-900">
                      {session?.user?.name || "Người dùng"}
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
                  Tất cả cài đặt
                </Menu.Item>
                <Menu.Item leftSection={<IconArrowUpCircle size={14} />}>
                  Nâng cấp gói
                </Menu.Item>
                <Menu.Item leftSection={<IconDownload size={14} />}>
                  Cài đặt app
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconDeviceDesktop size={14} />}>
                  Giao diện
                </Menu.Item>
                <Menu.Item leftSection={<IconLanguage size={14} />}>
                  Ngôn ngữ
                </Menu.Item>
                <Menu.Item leftSection={<IconHelp size={14} />}>
                  Hỗ trợ
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={() => signOut()}>
                  Đăng xuất
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <UnstyledButton className="p-2 shrink-0 rounded-md hover:bg-zinc-100 transition-colors text-gray-400 hover:text-gray-600">
              <IconBell size={20} />
            </UnstyledButton>
          </Group>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/70 px-6 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            {pathname.endsWith("/chat") && (
              <Text size="sm" fw={700} className="text-gray-900 truncate max-w-[300px] md:max-w-[500px]">
                {(() => {
                  const sessionId = searchParams?.get("session");
                  const currentSession = sessionId
                    ? sessionList.find((s) => s.id === sessionId)
                    : null;
                  return currentSession ? currentSession.title : "Phiên chat mới";
                })()}
              </Text>
            )}
          </div>

          <Group gap="sm">
            <Badge color="blue" variant="light" size="md">
              Gói miễn phí
            </Badge>
          </Group>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
      </div>
    </div>
  );
}
