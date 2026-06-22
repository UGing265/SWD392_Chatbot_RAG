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
  IconCrown,
  IconEdit,
  IconChevronDown,
  IconLayoutSidebar,
  IconLogout,
  IconBell,
} from "@tabler/icons-react";
import {
  Menu,
  Avatar,
  Text,
  Group,
  Stack,
  Badge,
  UnstyledButton,
  Collapse,
  ActionIcon,
} from "@mantine/core";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { createSession, sessionList } from "@/lib/sessions-store";

const nav = [
  { to: "/chat", label: "Chat mới", icon: IconEdit, studentOnly: true },
  { to: "/documents/shared", label: "Tài liệu chung", icon: IconBook },
  { to: "/documents/my", label: "Tài liệu riêng", icon: IconFileText, lecturerOnly: true },
  { to: "/upload", label: "Upload Tài liệu", icon: IconUpload, lecturerOnly: true },
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
        active ? "bg-white/10 !text-white" : "!text-white/80 hover:bg-white/5 hover:!text-white",
      )}
    >
      <Icon
        size={18}
        className={cn(active ? "!text-white" : "!text-white/60 group-hover:!text-white")}
      />
      <span
        className={cn("flex-1", active ? "!text-white" : "!text-white/80 group-hover:!text-white")}
      >
        {label}
      </span>
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
  const [historyOpened, setHistoryOpened] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#171717] selection:bg-blue-100">
      {/* Sidebar */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-white/10 bg-[#171717] md:flex">
        {/* Brand */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3.5">
          <Link
            href={`${basePath}/chat`}
            className="text-[18px] font-bold tracking-tight text-white px-1"
          >
            StudyMate
          </Link>
          <UnstyledButton className="rounded-lg p-1.5 text-white/90 hover:bg-white/5 hover:text-white transition-colors">
            <IconLayoutSidebar size={18} />
          </UnstyledButton>
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

        {/* Recent Chats Section / History */}
        {role === "student" && (
          <div className="mt-5 px-3">
            <UnstyledButton
              onClick={() => setHistoryOpened((o) => !o)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <IconChevronDown
                size={16}
                className={cn(
                  "text-white/60 transition-transform duration-200",
                  !historyOpened && "-rotate-90",
                )}
              />
              <Text
                c="white"
                className="flex-1 text-[13px] font-semibold !opacity-80 group-hover:!opacity-100 transition-opacity"
              >
                Lịch sử
              </Text>
            </UnstyledButton>

            <Collapse in={historyOpened}>
              <div className="flex flex-col gap-0.5 mt-1">
                {sessionList.slice(0, 8).map((session) => {
                  const isActive = searchParams?.get("session") === session.id;
                  return (
                    <Link
                      key={session.id}
                      href={`${basePath}/chat?session=${session.id}`}
                      className={cn(
                        "group block rounded-lg px-3 py-1.5 text-[13px] truncate transition-colors",
                        isActive
                          ? "bg-white/10 !text-white font-medium"
                          : "!text-white/85 hover:bg-white/5 hover:!text-white/90",
                      )}
                    >
                      {session.title}
                    </Link>
                  );
                })}
              </div>
            </Collapse>
          </div>
        )}

        {/* Profile / Bottom actions */}
        <div className="mt-auto px-3 py-4 flex flex-col gap-3">
          <UnstyledButton className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/20 hover:bg-white/5 transition-colors w-fit mx-auto">
            <IconCrown size={14} className="text-white/90" />
            <Text c="white" className="text-[12px] font-medium pr-1">
              Nâng cấp gói
            </Text>
          </UnstyledButton>

          <Menu shadow="md" position="top-start" radius="lg" offset={12}>
            <Menu.Target>
              <UnstyledButton className="flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors duration-150">
                <Avatar
                  color="blue"
                  variant="filled"
                  radius="xl"
                  size="sm"
                  className="font-semibold text-xs border border-white/10"
                >
                  {getInitials(session?.user?.name)}
                </Avatar>
                <div className="flex-1 min-w-0 leading-tight">
                  <Text size="sm" fw={550} c="white" className="truncate">
                    {session?.user?.name || "Người dùng"}
                  </Text>
                  <Text
                    size="xs"
                    c="dimmed"
                    className="!text-white/90 font-normal mt-0.5 capitalize"
                  >
                    {roleLabel}
                  </Text>
                </div>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown className="!bg-[#1f1f1f] !border-white/10 p-1">
              <Menu.Item
                component={Link}
                href={`/${session?.role || "student"}/change-password`}
                className="!p-0 hover:!bg-white/5 transition-colors duration-150"
              >
                <div className="px-3 py-3 flex items-center gap-3">
                  <Avatar
                    color="blue"
                    variant="filled"
                    radius="xl"
                    size="md"
                    className="font-semibold text-sm border border-white/10"
                  >
                    {getInitials(session?.user?.name)}
                  </Avatar>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <Text size="sm" fw={600} c="white" className="whitespace-nowrap !text-white">
                      {session?.user?.name || "Người dùng"}
                    </Text>
                    <Text size="xs" c="dimmed" className="whitespace-nowrap !text-white/90 mt-0.5">
                      {session?.user?.email || "Email"}
                    </Text>
                  </div>
                </div>
              </Menu.Item>
              <Menu.Divider className="!border-white/10" />
              <Menu.Item
                component={Link}
                href={`/${session?.role || "student"}/settings`}
                leftSection={<IconSettings size={16} className="!text-white/90" />}
                className="!text-white hover:!bg-white/5"
              >
                Tất cả cài đặt
              </Menu.Item>
              <Menu.Divider className="!border-white/10" />
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={() => signOut()}
                className="!text-red-400 hover:!bg-white/5"
              >
                Đăng xuất
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#171717] transition-all duration-300 relative">
        <header className="h-14 border-b border-white/5 bg-[#171717] sticky top-0 z-50">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Text c="white" fw={600} size="sm">
                {(() => {
                  const sessionId = searchParams?.get("session");
                  const currentSession = sessionId
                    ? sessionList.find((s) => s.id === sessionId)
                    : null;
                  return currentSession ? currentSession.title : "Phiên chat mới";
                })()}
              </Text>
            </div>

            <Group gap="sm">
              <Badge
                color="blue"
                variant="light"
                size="md"
                className="!text-blue-400 !bg-blue-400/10"
              >
                Gói miễn phí
              </Badge>
              <ActionIcon
                variant="subtle"
                color="zinc"
                radius="xl"
                size="lg"
                className="!text-white/70 hover:!bg-white/5"
              >
                <IconBell size={20} />
              </ActionIcon>
            </Group>
          </div>
        </header>

        <main className="flex-1 flex flex-col bg-[#171717] overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
