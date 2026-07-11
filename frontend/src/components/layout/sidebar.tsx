"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutSidebar,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";
import { Avatar, Menu, Text, Tooltip, UnstyledButton } from "@mantine/core";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function getRoleLabel(role?: string) {
  if (role === "admin") return "Admin";
  if (role === "lecturer" || role === "teacher") return "Lecturer";
  if (role === "student") return "Student";
  return "User";
}

export function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export interface NavItem {
  to: string;
  label: string;
  icon: any; // TablerIcon
  end?: boolean;
}

interface SidebarProps {
  basePath: string;
  navItems: NavItem[];
  session: any;
  signOut: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  showCollapseButton?: boolean;
  children?: ReactNode; // For extra sections like Recent Chats
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
  icon: any;
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

export function Sidebar({
  basePath,
  navItems,
  session,
  signOut,
  collapsed = false,
  onToggleCollapse,
  showCollapseButton = false,
  children,
}: SidebarProps) {
  const pathname = usePathname();
  const displayName = session?.user?.name || "Người dùng";
  const roleLabel = getRoleLabel(session?.role);
  const initials = getInitials(displayName);

  const isActive = (to: string, end?: boolean) => {
    const full = to === "/" ? basePath : `${basePath}${to}`;
    if (end) return pathname === full || pathname === `${full}/`;
    return pathname === full || (full !== basePath && pathname.startsWith(full));
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-slate-200 bg-[#FAFAFA] transition-[width] duration-300 md:flex",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      <div
        className={cn(
          "flex items-center pb-4 pt-5",
          collapsed ? "justify-center px-3" : "justify-between px-4",
        )}
      >
        {!collapsed && (
          <Link
            href={basePath === "" ? "/chat" : basePath}
            className="px-1 text-[18px] font-bold tracking-tight text-slate-900"
          >
            StudyMate
          </Link>
        )}
        {showCollapseButton && onToggleCollapse && (
          <Tooltip
            label={collapsed ? "Mở sidebar" : "Đóng sidebar"}
            position="right"
            withArrow
          >
            <UnstyledButton
              aria-label={collapsed ? "Mở sidebar" : "Đóng sidebar"}
              onClick={onToggleCollapse}
              className="rounded-[6px] p-1.5 text-slate-500 transition-colors duration-150 hover:bg-slate-200 hover:text-slate-900"
            >
              <IconLayoutSidebar size={18} />
            </UnstyledButton>
          </Tooltip>
        )}
        {!showCollapseButton && (
          <UnstyledButton className="rounded-[6px] p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
            <IconLayoutSidebar size={18} />
          </UnstyledButton>
        )}
      </div>

      <nav className="mt-2 flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to === "/" ? basePath : `${basePath}${item.to}`}
            label={item.label}
            icon={item.icon}
            active={isActive(item.to, item.end)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {children}

      <div className="mt-auto flex flex-col gap-3 px-3 py-4">
        <Menu shadow="md" position="top-start" radius="lg" offset={12} withArrow>
          <Menu.Target>
            <UnstyledButton
              aria-label={collapsed ? "Tài khoản" : undefined}
              className={cn(
                "flex w-full items-center rounded-[8px] transition-colors duration-150 hover:bg-slate-200",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
              )}
            >
              <Avatar color="blue" variant="light" radius="xl" size="sm" className="text-xs font-bold">
                {initials}
              </Avatar>
              {!collapsed && (
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
              href={`${basePath === "" ? `/${session?.role || "student"}` : basePath}/change-password`}
              className="transition-colors duration-150 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 px-1 py-1">
                <Avatar color="blue" variant="light" radius="xl" size="md" className="text-sm font-bold">
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
            {!collapsed && session?.role !== "admin" && (
              <>
                <Menu.Item
                  component={Link}
                  href={`/${session?.role || "student"}/settings`}
                  leftSection={<IconSettings size={16} className="text-slate-600" />}
                  className="text-slate-700 hover:bg-slate-50"
                >
                  Tất cả cài đặt
                </Menu.Item>
                <Menu.Divider />
              </>
            )}
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
  );
}
