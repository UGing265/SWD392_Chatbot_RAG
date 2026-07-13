"use client";

import { usePathname, useParams, useSearchParams } from "next/navigation";
import {
  IconBook,
  IconFileText,
  IconUpload,
  IconEdit,
  IconChevronDown,
  IconActivity,
  IconMessage,
  IconHistory,
} from "@tabler/icons-react";
import { Collapse, Text, UnstyledButton } from "@mantine/core";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { sessionList } from "@/lib/sessions-store";
import { Sidebar } from "./sidebar";
import Link from "next/link";

const nav = [
  { to: "/chat", label: "Chat Mới", icon: IconEdit, studentOnly: true },
  { to: "/documents/shared", label: "Tài Liệu Chung", icon: IconBook },
  { to: "/documents/my", label: "Tài Liệu Riêng", icon: IconFileText, lecturerOnly: true },
  { to: "/upload", label: "Upload Tài Liệu", icon: IconUpload, lecturerOnly: true },
  { to: "/progress", label: "Tiến trình", icon: IconActivity, lecturerOnly: true },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const pathRole = pathname.split("/")[1] || "";
  const role = (params?.role as string) || pathRole;
  const basePath = role ? `/${role}` : "";
  const { signOut, session } = useAuth();
  const [historyOpened, setHistoryOpened] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const filteredNav = nav.filter((n) => {
    if (n.studentOnly && role !== "student") return false;
    if (n.lecturerOnly && role !== "lecturer" && role !== "teacher") return false;
    return true;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-sky-100">
      <Sidebar 
        session={session} 
        signOut={signOut} 
        basePath={basePath}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        showCollapseButton={true}
      >
        {role === "student" && (
          <div className="mt-4">
            <UnstyledButton
              onClick={() => setHistoryOpened((o) => !o)}
              className={cn("w-full flex items-center group mb-1", sidebarCollapsed ? "justify-center px-0" : "justify-between px-2")}
            >
              {!sidebarCollapsed ? (
                <>
                  <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                    Lịch sử
                  </h3>
                  <IconChevronDown
                    size={14}
                    className={cn(
                      "text-zinc-400 transition-transform duration-200",
                      !historyOpened && "-rotate-90",
                    )}
                  />
                </>
              ) : (
                <IconHistory size={16} className="text-zinc-400" />
              )}
            </UnstyledButton>

            {!sidebarCollapsed && (
              <Collapse in={historyOpened}>
                <div className="flex flex-col gap-0.5 mt-1">
                  {sessionList.slice(0, 8).map((sessionItem) => {
                    const isActive = searchParams?.get("session") === sessionItem.id;
                    return (
                      <Link
                        key={sessionItem.id}
                        href={`${basePath}/chat?session=${sessionItem.id}`}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 h-8 rounded-md transition-colors text-[13px]",
                          isActive
                            ? "bg-zinc-100/80 text-zinc-900 font-medium"
                            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
                        )}
                      >
                        <IconMessage
                          size={16}
                          stroke={isActive ? 2 : 1.6}
                          className={cn("shrink-0", isActive ? "text-zinc-900" : "text-zinc-400")}
                        />
                        <span className="truncate">{sessionItem.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </Collapse>
            )}
          </div>
        )}
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-white transition-all duration-300 relative">
        <main className="flex-1 flex flex-col bg-white overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
