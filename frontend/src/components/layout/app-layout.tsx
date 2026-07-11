"use client";

import { usePathname, useParams, useSearchParams } from "next/navigation";
import {
  IconBook,
  IconFileText,
  IconUpload,
  IconEdit,
  IconChevronDown,
} from "@tabler/icons-react";
import { Collapse, Text, UnstyledButton } from "@mantine/core";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { sessionList } from "@/lib/sessions-store";
import { Sidebar, type NavItem } from "./sidebar";
import Link from "next/link";

const nav = [
  { to: "/chat", label: "Chat Mới", icon: IconEdit, studentOnly: true },
  { to: "/documents/shared", label: "Tài Liệu Chung", icon: IconBook },
  { to: "/documents/my", label: "Tài Liệu Riêng", icon: IconFileText, lecturerOnly: true },
  { to: "/upload", label: "Upload Tài Liệu", icon: IconUpload, lecturerOnly: true },
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

  const filteredNav = nav.filter((n) => {
    if (n.studentOnly && role !== "student") return false;
    if (n.lecturerOnly && role !== "lecturer" && role !== "teacher") return false;
    return true;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-sky-100">
      <Sidebar
        basePath={basePath}
        navItems={filteredNav}
        session={session}
        signOut={signOut}
        showCollapseButton={false}
      >
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
              <Text className="flex-1 text-[13px] font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                Lịch sử
              </Text>
            </UnstyledButton>

            <Collapse in={historyOpened}>
              <div className="flex flex-col gap-0.5 mt-1">
                {sessionList.slice(0, 8).map((sessionItem) => {
                  const isActive = searchParams?.get("session") === sessionItem.id;
                  return (
                    <Link
                      key={sessionItem.id}
                      href={`${basePath}/chat?session=${sessionItem.id}`}
                      className={cn(
                        "group block rounded-[8px] px-3 py-2 text-[13px] truncate transition-colors",
                        isActive
                          ? "bg-slate-200 text-slate-900 font-medium"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      )}
                    >
                      {sessionItem.title}
                    </Link>
                  );
                })}
              </div>
            </Collapse>
          </div>
        )}
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-white transition-all duration-300 relative">
        <main className="flex-1 flex flex-col bg-white overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
