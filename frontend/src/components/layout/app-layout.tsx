"use client";



import Link from "next/link";

import { usePathname, useParams, useRouter } from "next/navigation";

import {
  Sparkles,
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
  ClipboardList,
  Bell,
  ChevronsUpDown,
  Download,
  ArrowUpCircle,
  Monitor,
  Languages,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

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

import type { ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";
import { createSession } from "@/lib/sessions-store";

const nav = [
  { to: "/documents/shared", label: "Khám phá", icon: BookOpen },
  { to: "/documents/my", label: "Tài liệu của tôi", icon: FileText, studentOnly: true },
  { to: "/sessions", label: "Lịch sử", icon: History, studentOnly: true },
  { to: "/upload", label: "Tải lên", icon: Upload, lecturerOnly: true },
  { to: "/practice", label: "Luyện tập", icon: Sparkles },
  { to: "/settings", label: "Cài đặt", icon: Settings },
];

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
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors ${active
        ? "bg-secondary text-foreground"
        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        }`}
    >
      <Icon
        className={`h-[18px] w-[18px] ${active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
        strokeWidth={2}
      />
      <span className="flex-1">{label}</span>
    </Link>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const pathRole = pathname.split("/")[1] || "";
  const role = (params?.role as string) || pathRole;
  const basePath = role ? `/${role}` : "";
  const { signOut, session } = useAuth();
  const router = useRouter();

  const handleNewSession = () => {
    const s = createSession();
    router.push(`${basePath}/chat?session=${s.id}`);
  };

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        {/* Brand */}
        <div className="px-5 pt-6 pb-6">
          <Link href={`${basePath}/chat`} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
              <ClipboardList className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </div>
            <div className="text-[19px] font-bold tracking-tight text-foreground">
              StudyMate
            </div>
          </Link>
        </div>

        {/* Global Search Button - Perplexity style */}
        <div className="px-3 mb-6">
          <button
            onClick={handleNewSession}
            className="flex w-full items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-[13px] text-muted-foreground transition-all hover:border-foreground/20 hover:bg-secondary/50"
          >
            <Plus className="h-4 w-4" />
            <span className="flex-1 text-left font-medium">Phiên mới</span>
          </button>
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
                  active={pathname === fullPath || (fullPath !== basePath && pathname.startsWith(fullPath))}
                />
              );
            })}
        </nav>

        {/* Profile / Bottom actions */}
        <div className="mt-auto p-3 border-t border-border/50">
          <div className="flex items-center justify-between w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-2 text-left hover:bg-secondary/50 transition-colors mr-1">
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2e6d2b] text-[13px] font-semibold text-white">
                      {session?.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-[#0d8282] border-2 border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-[14px] font-medium text-foreground">
                      {session?.user?.name || "Người dùng"}
                    </div>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[240px] ml-3 mb-2 rounded-xl" side="top" align="start">
                <DropdownMenuLabel className="p-2 font-normal pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e6d2b] text-[15px] font-semibold text-white shrink-0">
                      {session?.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="truncate text-[15px] font-medium">{session?.user?.name || "Người dùng"}</span>
                      <span className="truncate text-[13px] text-muted-foreground mt-0.5">{session?.user?.email || "Email"}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="py-2.5 cursor-pointer">
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>All settings</span>
                    <DropdownMenuShortcut>↑^,</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2.5 cursor-pointer">
                    <ArrowUpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Upgrade plan</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2.5 cursor-pointer">
                    <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Install apps</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="py-2.5 cursor-pointer flex justify-between">
                    <div className="flex items-start">
                      <Monitor className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>Appearance</span>
                        <span className="text-[12px] text-muted-foreground leading-none mt-1">System (Light)</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2.5 cursor-pointer flex justify-between">
                    <div className="flex items-start">
                      <Languages className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>Language</span>
                        <span className="text-[12px] text-muted-foreground leading-none mt-1">Default</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2.5 cursor-pointer flex justify-between items-center">
                    <div className="flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Help</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-2.5 cursor-pointer" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="p-2 shrink-0 rounded-md hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
            </button>
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
              <span className="whitespace-nowrap font-medium text-foreground">Gói miễn phí</span>
            </div>
          </div>

        </header>



        <main className="min-h-0 flex-1">{children}</main>

      </div>

    </div>

  );

}

