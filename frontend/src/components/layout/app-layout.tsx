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
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { chatApi, type ChatSession } from "@/api/chat";
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
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const activeSessionId = searchParams?.get("session");
  const userId = session?.user?.id;

  // Fetch real sessions dynamically from API
  useEffect(() => {
    if (userId) {
      chatApi.listSessions()
        .then((data) => {
          setSessions(data);
        })
        .catch((err) => {
          console.error("Error fetching sidebar sessions:", err);
        });
    }
  }, [userId, activeSessionId]);

  const showHistory = role === "student" || role === "lecturer";

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
        {showHistory && (
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
                <div className="flex flex-col gap-0.5 mt-1 max-h-[250px] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {sessions.length === 0 ? (
                    <Text size="xs" c="dimmed" className="px-2.5 py-1">Chưa có phiên chat</Text>
                  ) : (
                    sessions.slice(0, 15).map((sessionItem) => {
                      const isActive = activeSessionId === sessionItem.id;
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
                          <span className="truncate flex-1">{sessionItem.title}</span>
                        </Link>
                      );
                    })
                  )}
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
