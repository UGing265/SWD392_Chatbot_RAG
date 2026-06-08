"use client";



import Link from "next/link";

import { usePathname, useParams, useRouter } from "next/navigation";

import {

  MessageSquareText,

  FileText,

  History,

  Settings,

  Plus,

  Upload,

  Command,

  BookMarked,

  Search,

  ChevronDown,

  BookOpen,

  LogIn,

  LogOut,

} from "lucide-react";

import type { ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";




const nav = [
  { to: "/chat", label: "Trò chuyện AI", icon: MessageSquareText, badge: undefined, studentOnly: true },
  { to: "/upload", label: "Tải lên", icon: Upload, badge: undefined, lecturerOnly: true },
  { to: "/documents/my", label: "Tài liệu của tôi", icon: FileText, badge: "12", lecturerOnly: true },
  { to: "/documents/shared", label: "Tài liệu", icon: FileText, badge: undefined },
  { to: "/practice", label: "Luyện Tập", icon: BookOpen, badge: "Mới" },
  { to: "/sessions", label: "Phiên hội thoại", icon: History, badge: "6", studentOnly: true },
  { to: "/settings", label: "Cài đặt", icon: Settings },
];



function SidebarItem({

  to,

  label,

  icon: Icon,

  active,

  badge,

}: {

  to: string;

  label: string;

  icon: typeof MessageSquareText;

  active: boolean;

  badge?: string;

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

      <span className="flex-1">{label}</span>

      {badge && (

        <span

          className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums font-medium ${active ? "bg-primary-soft text-primary-deep" : "bg-muted text-muted-foreground"

            }`}

        >

          {badge}

        </span>

      )}

    </Link>

  );

}



export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  // Extract role from pathname as fallback
  const pathRole = pathname.split("/")[1] || "";
  const role = (params?.role as string) || pathRole;
  const basePath = role ? `/${role}` : "";
  const { signOut, session } = useAuth();



  return (

    <div className="flex min-h-screen w-full">

      {/* Sidebar */}

      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar/70 backdrop-blur md:flex">

        {/* Brand */}

        <div className="px-5 pt-5 pb-4">

          <div className="flex items-center gap-2.5">

            <div className="relative">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground shadow-soft">

                <BookMarked className="h-4 w-4" strokeWidth={2} />

              </div>

              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-secondary" />

            </div>

            <div className="leading-tight">

              <div className="text-[15px] font-semibold tracking-tight text-foreground">

                Study<span className="font-normal text-primary-deep">Mate</span>

              </div>

              <div className="text-[10px] tabular-nums uppercase tracking-wider text-muted-foreground">

                v0.4 · RAG

              </div>

            </div>

          </div>

        </div>



        {/* Search trigger */}

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
                  badge={n.badge}
                  active={pathname.startsWith(fullPath)}
                />
              );
            })}
        </nav>



        {/* Profile card */}
        <div className="mt-auto p-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft group">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xs font-semibold text-primary-foreground">
                {role === "lecturer" || role === "teacher" ? "GV" : "SV"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground underline-offset-4 group-hover:underline">
                  {session?.user?.name || (role === "lecturer" || role === "teacher" ? "Giảng Viên" : "Sinh Viên")}
                </div>
                <div className="truncate text-[10px] text-muted-foreground uppercase tracking-wider">
                  {role === "lecturer" || role === "teacher" ? "Lecturer" : "Student"}
                </div>
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



      {/* Main */}

      <div className="flex min-w-0 flex-1 flex-col">

        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-md md:px-6">

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card/80 py-1 pl-1 pr-3 text-xs sm:flex">
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="pulse-ring absolute h-2 w-2 rounded-full bg-secondary" />
                <span className="relative h-2 w-2 rounded-full bg-secondary" />
              </span>
              <span className="whitespace-nowrap font-medium text-foreground">Sẵn sàng</span>
            </div>
          </div>

        </header>



        <main className="min-h-0 flex-1">{children}</main>

      </div>

    </div>

  );

}

