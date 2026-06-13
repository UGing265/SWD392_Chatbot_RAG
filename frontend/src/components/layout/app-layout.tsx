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
  IconLayoutSidebar,
  IconEdit,
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

function getInitials(name?: string | null) {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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
          : "text-gray-600 hover:bg-zinc-100/60 hover:text-gray-900"
      )}
    >
      <Icon
        size={18}
        className={cn(
          active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900"
        )}
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
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-gray-200 bg-zinc-50 md:flex">
        {/* Brand */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3.5">
          <Link href={`${basePath}/chat`} className="text-[18px] font-bold tracking-tight text-gray-900 px-1">
            StudyMate
          </Link>
          <UnstyledButton className="rounded-lg p-1.5 text-gray-400 hover:bg-zinc-150 hover:text-gray-900 transition-colors">
            <IconLayoutSidebar size={18} />
          </UnstyledButton>
        </div>

        {/* New Chat Button for Student */}
        {role === "student" && (
          <div className="px-3 mb-2">
            <Link
              href={`${basePath}/chat`}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors w-full",
                pathname === `${basePath}/chat` && !searchParams?.get("session")
                  ? "bg-zinc-200/50 text-gray-900"
                  : "text-gray-600 hover:bg-zinc-100/60 hover:text-gray-900"
              )}
            >
              <IconEdit
                size={18}
                className={cn(
                  pathname === `${basePath}/chat` && !searchParams?.get("session")
                    ? "text-gray-900"
                    : "text-gray-400 group-hover:text-gray-900"
                )}
              />
              <span className="flex-1">Chat mới</span>
            </Link>
          </div>
        )}

        <nav className="flex flex-col gap-1 px-3">
          {nav
            .filter((n) => {
              if (n.studentOnly && role !== "student") return false;
              if (n.lecturerOnly && role !== "lecturer" && role !== "teacher") return false;
              if (n.to === "/chat" && role === "student") return false;
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
          <div className="mt-5 px-3">
            <Text size="xs" fw={600} className="text-gray-500 px-3 py-1 font-semibold uppercase tracking-wider text-[11px]">
              Gần đây
            </Text>
            <div className="flex flex-col gap-0.5 mt-1">
              {sessionList.slice(0, 5).map((session) => {
                const isActive = searchParams?.get("session") === session.id;
                return (
                  <Link
                    key={session.id}
                    href={`${basePath}/chat?session=${session.id}`}
                    className={cn(
                      "group block rounded-lg px-3 py-1.5 text-[13.5px] truncate transition-colors",
                      isActive
                        ? "bg-zinc-200/50 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-zinc-100/60 hover:text-gray-900",
                    )}
                  >
                    {session.title}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Profile / Bottom actions */}
        <div className="mt-auto p-3 border-t border-gray-200">
          <Menu shadow="md" width={240} position="top-start" radius="md">
            <Menu.Target>
              <UnstyledButton className="flex w-full items-center gap-3.5 rounded-xl p-3 text-left hover:!bg-zinc-100 active:scale-[0.98] transition-all duration-150 border border-transparent hover:border-gray-200/50">
                <Avatar color="dark" radius="xl" size="md" className="font-bold text-sm">
                  {getInitials(session?.user?.name)}
                </Avatar>
                <div className="flex-1 min-w-0 leading-tight">
                  <Text size="sm" fw={600} className="truncate text-gray-900">
                    {session?.user?.name || "Người dùng"}
                  </Text>
                  <Text size="xs" className="text-gray-500 font-normal mt-0.5 capitalize">
                    {roleLabel}
                  </Text>
                </div>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Tài khoản</Menu.Label>
              <div className="px-3 py-2 flex items-center gap-3">
                <Avatar color="dark" radius="xl" size="md" className="font-semibold text-sm">
                  {getInitials(session?.user?.name)}
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
            <UnstyledButton className="relative rounded-md p-2 text-gray-400 transition-colors hover:bg-zinc-100 hover:text-gray-600">
              <IconBell size={20} />
            </UnstyledButton>
          </Group>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
      </div>
    </div>
  );
}
