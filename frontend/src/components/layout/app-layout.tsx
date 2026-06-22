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
        "group flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium transition-colors",
        active ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon
        size={18}
        className={cn(active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700")}
      />
      <span className="flex-1">
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
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-sky-100">
      {/* Sidebar */}
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-slate-200 bg-[#FAFAFA] md:flex">
        {/* Brand */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          <Link
            href={`${basePath}/chat`}
            className="text-[18px] font-bold tracking-tight text-slate-900 px-1"
          >
            StudyMate
          </Link>
          <UnstyledButton className="rounded-[6px] p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
            <IconLayoutSidebar size={18} />
          </UnstyledButton>
        </div>

        <nav className="flex flex-col gap-1 px-3 mt-2">
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
          <div className="mt-6 px-3">
            <UnstyledButton
              onClick={() => setHistoryOpened((o) => !o)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-[8px] hover:bg-slate-100 transition-colors group"
            >
              <IconChevronDown
                size={16}
                className={cn(
                  "text-slate-400 transition-transform duration-200",
                  !historyOpened && "-rotate-90",
                )}
              />
              <Text
                className="flex-1 text-[13px] font-semibold text-slate-500 group-hover:text-slate-700 transition-colors"
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
                        "group block rounded-[8px] px-3 py-2 text-[13px] truncate transition-colors",
                        isActive
                          ? "bg-slate-200 text-slate-900 font-medium"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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
          <UnstyledButton className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all w-fit mx-auto">
            <IconCrown size={15} className="text-yellow-600" />
            <Text className="text-[12px] font-semibold text-slate-700 pr-1">
              Nâng cấp gói
            </Text>
          </UnstyledButton>

          <Menu shadow="md" position="top-start" radius="lg" offset={12} withArrow>
            <Menu.Target>
              <UnstyledButton className="flex w-full items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-slate-200 transition-colors duration-150">
                <Avatar
                  color="blue"
                  variant="light"
                  radius="xl"
                  size="sm"
                  className="font-bold text-xs"
                >
                  {getInitials(session?.user?.name)}
                </Avatar>
                <div className="flex-1 min-w-0 leading-tight">
                  <Text size="sm" fw={600} className="truncate text-slate-900">
                    {session?.user?.name || "Người dùng"}
                  </Text>
                  <Text
                    size="xs"
                    className="text-slate-500 font-medium mt-0.5 capitalize"
                  >
                    {roleLabel}
                  </Text>
                </div>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown className="p-1 min-w-[200px]">
              <Menu.Item
                component={Link}
                href={`/${session?.role || "student"}/change-password`}
                className="hover:bg-slate-50 transition-colors duration-150"
              >
                <div className="px-1 py-1 flex items-center gap-3">
                  <Avatar
                    color="blue"
                    variant="light"
                    radius="xl"
                    size="md"
                    className="font-bold text-sm"
                  >
                    {getInitials(session?.user?.name)}
                  </Avatar>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <Text size="sm" fw={600} className="whitespace-nowrap text-slate-900">
                      {session?.user?.name || "Người dùng"}
                    </Text>
                    <Text size="xs" className="whitespace-nowrap text-slate-500 mt-0.5">
                      {session?.user?.email || "Email"}
                    </Text>
                  </div>
                </div>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                component={Link}
                href={`/${session?.role || "student"}/settings`}
                leftSection={<IconSettings size={16} className="text-slate-600" />}
                className="text-slate-700 hover:bg-slate-50"
              >
                Tất cả cài đặt
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white transition-all duration-300 relative">

        <main className="flex-1 flex flex-col bg-white overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
