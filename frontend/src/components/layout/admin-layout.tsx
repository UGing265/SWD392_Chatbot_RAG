"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpCircle,
  Bell,
  BookOpen,
  ChevronRight,
  ChevronsUpDown,
  ClipboardList,
  Command,
  Download,
  HelpCircle,
  Languages,
  LayoutDashboard,
  LogOut,
  Monitor,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "", label: "Bảng điều khiển", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Quản lý tài khoản", icon: Users },
  { to: "/assignment", label: "Phân công môn học", icon: Command },
  { to: "/curriculum", label: "Quản lý học kỳ", icon: BookOpen },
  { to: "/moderation", label: "Kiểm duyệt tài liệu", icon: ShieldCheck },
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
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={to}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px]",
          active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
        )}
        strokeWidth={2}
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
    <div className="flex h-screen w-full overflow-hidden bg-background selection:bg-primary/20">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="px-5 pb-6 pt-6">
          <Link href={basePath} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
              <ClipboardList className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </div>
            <div className="text-[19px] font-bold tracking-tight text-foreground">StudyMate</div>
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

        <div className="mt-auto border-t border-border/50 p-3">
          <div className="flex w-full items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="mr-1 flex min-w-0 flex-1 items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-secondary/50">
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2e6d2b] text-[13px] font-semibold text-white">
                      {initials}
                    </div>
                    <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full border-2 border-background bg-[#0d8282]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium text-foreground">
                      {displayName}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-wide text-primary">
                      {roleLabel}
                    </div>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="mb-2 ml-3 w-[240px] rounded-xl"
                side="top"
                align="start"
              >
                <DropdownMenuLabel className="p-2 pb-3 font-normal">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2e6d2b] text-[15px] font-semibold text-white">
                      {initials}
                    </div>
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-[15px] font-medium">{displayName}</span>
                      <span className="mt-1 truncate text-[12px] font-semibold uppercase tracking-wide text-primary">
                        {roleLabel}
                      </span>
                      <span className="mt-0.5 truncate text-[13px] text-muted-foreground">
                        {session?.user?.email || "Email"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer py-2.5">
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Cài đặt</span>
                    <DropdownMenuShortcut>Ctrl ,</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2.5">
                    <ArrowUpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Nâng cấp gói</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2.5">
                    <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Cài ứng dụng</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex cursor-pointer justify-between py-2.5">
                    <div className="flex items-start">
                      <Monitor className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>Giao diện</span>
                        <span className="mt-1 text-[12px] leading-none text-muted-foreground">
                          Hệ thống
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex cursor-pointer justify-between py-2.5">
                    <div className="flex items-start">
                      <Languages className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>Ngôn ngữ</span>
                        <span className="mt-1 text-[12px] leading-none text-muted-foreground">
                          Tiếng Việt
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex cursor-pointer items-center justify-between py-2.5">
                    <div className="flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Trợ giúp</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer py-2.5" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/70 px-6 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="truncate text-[16px] font-semibold text-foreground md:max-w-[500px]">
              {pageTitle}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card/80 py-1.5 pl-1.5 pr-4 text-[13px] sm:flex">
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="pulse-ring absolute h-2 w-2 rounded-full bg-secondary" />
                <span className="relative h-2 w-2 rounded-full bg-secondary" />
              </span>
              <span className="whitespace-nowrap font-medium text-foreground">Admin workspace</span>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
