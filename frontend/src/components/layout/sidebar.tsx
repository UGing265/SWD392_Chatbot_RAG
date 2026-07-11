"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconWorld,
  IconBookmark,
  IconMessageChatbot,
  IconHistory,
  IconScale,
  IconListCheck,
  IconFolder,
  IconDatabaseImport,
  IconUser,
  IconLogout,
  IconBrain,
  IconPlus,
  IconSquarePlus,
  IconDiscountCheckFilled,
  IconDots,
  IconSettings,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button, Menu } from "@mantine/core";

const navGroups = [
  {
    label: "Khám Phá",
    items: [
      { label: "Thư Viện", icon: IconWorld, href: "/lecturer/explore" },
      { label: "Đã Lưu", icon: IconBookmark, href: "/lecturer/bookmarks" },
    ],
  },
  {
    label: "Không Gian AI",
    items: [
      { label: "Chatbot AI", icon: IconMessageChatbot, href: "/lecturer/chat" },
      { label: "Lịch Sử Chat", icon: IconHistory, href: "/lecturer/chat/sessions" },
      { label: "So Sánh", icon: IconScale, href: "/lecturer/compare" },
      { label: "Tạo Quiz", icon: IconListCheck, href: "/lecturer/quiz-builder" },
    ],
  },
  {
    label: "Quản Lý",
    items: [
      { label: "Tài Liệu Của Tôi", icon: IconFolder, href: "/lecturer/documents/my" },
      { label: "Tiến Trình", icon: IconDatabaseImport, href: "/lecturer/upload-jobs" },
    ],
  },
];

export function Sidebar({ session, signOut, children }: { session?: any, signOut?: any, children?: React.ReactNode }) {
  const pathname = usePathname();
  const user = session?.user;
  const userName = user?.name || "Người dùng";
  const userEmail = user?.email || "Chưa cập nhật email";
  
  const roleId = Number(user?.roleId || user?.role_id);
  const userRole = roleId === 1 ? "Quản Trị Viên" : roleId === 2 ? "Giảng Viên" : roleId === 3 ? "Sinh Viên" : "Thành Viên";

  return (
    <aside className="shrink-0 flex-col bg-white border-r border-zinc-200 hidden md:flex h-full w-[220px]">
      {/* ── Brand ── */}
      <div className="flex items-center gap-2 px-4 border-b border-zinc-100 h-[52px] shrink-0">
        <div className="bg-zinc-900 text-white rounded-md flex items-center justify-center w-7 h-7">
          <IconBrain size={18} stroke={2} />
        </div>
        <span className="font-bold text-zinc-900 tracking-tight text-[15px]">
          EduRAG
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {navGroups.map((group) => (
          <div key={group.label}>
            <h3 className="px-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">
              {group.label}
            </h3>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 h-8 rounded-md transition-colors text-[13px]",
                      isActive
                        ? "bg-zinc-100/80 text-zinc-900 font-medium"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
                    )}
                  >
                    <item.icon
                      size={16}
                      stroke={isActive ? 2 : 1.6}
                      className={isActive ? "text-zinc-900" : "text-zinc-400"}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Divider */}
        <div className="bg-zinc-100 h-px my-2" />

        {/* New Document */}
        <Link
          href="/lecturer/documents/new"
          className="w-full flex items-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors h-9 px-3 gap-2.5 text-sm font-medium shadow-sm bg-white mt-3"
        >
          <IconSquarePlus size={18} stroke={1.6} className="text-zinc-500" />
          <span>Tài Liệu Mới</span>
        </Link>
      </nav>

      {/* Render children (like chat history) if passed */}
      {children}

      {/* ── Profile Dropdown ── */}
      <div className="mt-auto p-3 shrink-0">
        <Menu shadow="sm" width={204} position="top-start" offset={4} withArrow={false}>
          <Menu.Target>
            <button className="w-full flex items-center p-1.5 gap-2.5 bg-white border border-zinc-200/80 rounded-lg shadow-sm hover:bg-zinc-50 transition-colors text-left">
              {/* Avatar */}
              {user?.image ? (
                <img src={user.image} alt={userName} className="rounded-md w-6 h-6 object-cover shrink-0" />
              ) : (
                <div className="rounded-md bg-gradient-to-tr from-cyan-400 via-pink-500 to-amber-400 w-6 h-6 shrink-0" />
              )}

              {/* Info */}
              <div className="flex flex-col flex-1 overflow-hidden text-left">
                <span className="text-zinc-900 text-[13px] font-medium leading-tight truncate">
                  {userName}
                </span>
                <span className="text-zinc-500 text-[11px] font-medium leading-none truncate mt-0.5">
                  {userRole}
                </span>
              </div>

              {/* Dots */}
              <IconDots size={16} stroke={2} className="text-zinc-400 shrink-0 mr-0.5" />
            </button>
          </Menu.Target>

          <Menu.Dropdown className="!rounded-xl !border-zinc-200 !shadow-md !p-1.5">
            <div className="px-2 py-1.5 mb-1 border-b border-zinc-100 flex flex-col gap-0.5">
              <span className="block text-zinc-900 text-[13px] font-semibold truncate">{userName}</span>
              <span className="block text-zinc-500 text-[11px] truncate">{userEmail}</span>
            </div>
            
            <Menu.Item 
              component={Link} 
              href="/lecturer/profile" 
              leftSection={<IconUser size={15} stroke={1.6} />}
              className="!text-[13px] !font-medium !text-zinc-700 hover:!bg-zinc-50 !rounded-md"
            >
              Tài Khoản
            </Menu.Item>
            <Menu.Item 
              component={Link} 
              href="/lecturer/settings" 
              leftSection={<IconSettings size={15} stroke={1.6} />}
              className="!text-[13px] !font-medium !text-zinc-700 hover:!bg-zinc-50 !rounded-md"
            >
              Cài Đặt
            </Menu.Item>
            <Menu.Divider className="!border-zinc-100 !my-1" />
            <Menu.Item 
              color="red" 
              onClick={signOut} 
              leftSection={<IconLogout size={15} stroke={1.6} />}
              className="!text-[13px] !font-medium hover:!bg-rose-50 !rounded-md"
            >
              Đăng Xuất
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </aside>
  );
}
