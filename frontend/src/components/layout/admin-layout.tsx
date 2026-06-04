"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Upload,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  LayoutGrid,
  Crown,
  Command,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

const nav = [
  { to: "", label: "Bảng điều khiển", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Quản lý tài khoản", icon: Users },
  { to: "/assignment", label: "Phân công môn học", icon: Command },
  { to: "/curriculum", label: "Quản lý học kỳ", icon: BookOpen },
  { to: "/moderation", label: "Kiểm duyệt tài liệu", icon: ShieldCheck },
];

function SidebarItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={to}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${active
        ? "bg-card text-foreground shadow-soft"
        : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
        }`}
    >
      {active && (
        <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon
        className={`h-[17px] w-[17px] ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
        strokeWidth={1.75}
      />
      <span>{label}</span>
    </Link>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const basePath = "/admin";

  const isActive = (to: string, end?: boolean) => {
    const full = `${basePath}${to}`;
    if (end) return pathname === full || pathname === `${full}/`;
    return pathname.startsWith(full);
  };

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar/70 backdrop-blur md:flex">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground shadow-soft">
                <Crown className="h-4 w-4" strokeWidth={2} />
              </div>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-secondary" />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight text-foreground">
                StudyMate <span className="font-normal text-primary-deep">Admin</span>
              </div>
              <div className="text-[10px] tabular-nums uppercase tracking-wider text-muted-foreground">
                v0.4 · RAG
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 pb-3">
          <button className="group flex w-full items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-card">
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Tìm mọi thứ…</span>
            <kbd className="inline-flex items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 tabular-nums text-[10px]">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 px-3">
          {nav.map((n) => (
            <SidebarItem
              key={n.to}
              to={`${basePath}${n.to}`}
              label={n.label}
              icon={n.icon}
              active={isActive(n.to, n.end)}
            />
          ))}
        </nav>


        <div className="mt-auto p-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
                MA
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground underline-offset-4 group-hover:underline">Minh An</div>
                <div className="truncate text-[10px] text-muted-foreground uppercase tracking-wider">Admin</div>
              </div>
              <button
                onClick={() => signOut()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/70 px-4 backdrop-blur-md md:px-6">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative hidden max-w-sm flex-1 lg:max-w-md sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={
                  pathname === '/admin' || pathname === '/admin/'
                    ? "Search analytics..."
                    : pathname.includes('documents')
                      ? "Global search for documents..."
                      : "Global search..."
                }
                className="h-9 w-full rounded-full border border-border bg-muted/30 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {(pathname === '/admin' || pathname === '/admin/') && (
              <div className="ml-4 hidden h-14 items-center gap-6 lg:flex">
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>

            {(pathname === '/admin' || pathname === '/admin/') ? (
              <button className="hidden h-9 items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 sm:flex">
                New Session
              </button>
            ) : (
              <button className="hidden h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:flex">
                <LayoutGrid className="h-4 w-4" />
              </button>
            )}

          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
