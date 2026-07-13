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
  IconLayoutSidebar,
  IconGitCompare,
  IconLayoutDashboard,
  IconUsers,
  IconBook,
  IconTerminal2,
  IconClipboardList,
  IconShieldCheck,
  IconFileText,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button, Menu, Tooltip, UnstyledButton } from "@mantine/core";

const getNavGroups = (basePath: string, role: string) => {
  const isStudent = role === "student";
  const isAdmin = role === "admin";

  if (isAdmin) {
    return [
      {
        label: "Tổng Quan",
        items: [
          { label: "Bảng Điều Khiển", icon: IconLayoutDashboard, href: `${basePath}` },
        ],
      },
      {
        label: "Quản Lý",
        items: [
          { label: "Quản Lý Tài Khoản", icon: IconUsers, href: `${basePath}/users` },
          { label: "Quản Lý Môn Học", icon: IconBook, href: `${basePath}/curriculum` },
          { label: "Phân Công Môn Học", icon: IconTerminal2, href: `${basePath}/assignment` },
          { label: "Danh Mục Khác", icon: IconClipboardList, href: `${basePath}/metadata` },
        ],
      },
      {
        label: "Kiểm Duyệt",
        items: [
          { label: "Tài Liệu Hệ Thống", icon: IconFileText, href: `${basePath}/documents` },
        ],
      },
    ];
  }

  const groups = [
    {
      label: "Khám Phá",
      items: [
        { label: "Thư Viện", icon: IconWorld, href: `${basePath}/explore` },
        { label: "Đã Lưu", icon: IconBookmark, href: `${basePath}/bookmarks` },
      ],
    },
    {
      label: "Không Gian AI",
      items: [
        { label: "Chatbot AI", icon: IconMessageChatbot, href: `${basePath}/chat` },
        { label: "Lịch Sử Chat", icon: IconHistory, href: `${basePath}/sessions` },
        { label: "So Sánh", icon: IconGitCompare, href: `${basePath}/documents/compare` },
        !isStudent && { label: "Tạo Quiz", icon: IconListCheck, href: `${basePath}/quiz-builder` },
      ].filter(Boolean) as any[],
    },
    !isStudent && {
      label: "Quản Lý",
      items: [
        { label: "Tài Liệu Của Tôi", icon: IconFolder, href: `${basePath}/documents/my` },
        { label: "Tiến Trình", icon: IconDatabaseImport, href: `${basePath}/progress` },
      ],
    },
  ];

  return groups.filter(Boolean) as any[];
};


export function Sidebar({ session, signOut, children, basePath = "/lecturer", navItems, collapsed, onToggleCollapse, showCollapseButton }: { session?: any, signOut?: any, children?: React.ReactNode, basePath?: string, navItems?: any[], collapsed?: boolean, onToggleCollapse?: () => void, showCollapseButton?: boolean }) {
  const pathname = usePathname();
  const user = session?.user;
  const userName = user?.name || "Người dùng";
  const userEmail = user?.email || "Chưa cập nhật email";
  
  const roleId = Number(user?.roleId || user?.role_id);
  const userRole = roleId === 1 ? "Quản Trị Viên" : roleId === 2 ? "Giảng Viên" : roleId === 3 ? "Sinh Viên" : "Thành Viên";

  return (
    <aside className={cn("shrink-0 flex-col bg-white border-r border-zinc-200 hidden md:flex h-full transition-all duration-300", collapsed ? "w-[68px]" : "w-[220px]")}>
      {/* ── Brand ── */}
      <div className={cn("flex items-center gap-2 border-b border-zinc-100 h-[52px] shrink-0", collapsed ? "justify-center px-0" : "px-4")}>
        {!collapsed && (
          <>
            <div className="bg-zinc-900 text-white rounded-md flex items-center justify-center w-7 h-7 shrink-0">
              <IconBrain size={18} stroke={2} />
            </div>
            <span className="font-bold text-zinc-900 tracking-tight text-[15px] truncate flex-1">
              EduRAG
            </span>
          </>
        )}
        {(showCollapseButton || onToggleCollapse) && (
           <UnstyledButton onClick={onToggleCollapse} className={cn("text-zinc-400 hover:text-zinc-600 transition-colors p-1.5 rounded-md hover:bg-zinc-100 flex items-center justify-center", collapsed ? "" : "ml-auto")}>
               <IconLayoutSidebar size={18} stroke={1.5} />
           </UnstyledButton>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {getNavGroups(basePath, basePath.replace('/', '')).map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <h3 className="px-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1 truncate">
                {group.label}
              </h3>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item: any) => {
                const isActive = pathname.startsWith(item.href);
                const linkContent = (
                  <>
                    <item.icon
                      size={16}
                      stroke={isActive ? 2 : 1.6}
                      className={isActive ? "text-zinc-900 shrink-0" : "text-zinc-400 shrink-0"}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </>
                );

                return collapsed ? (
                  <Tooltip label={item.label} position="right" withArrow key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center h-8 w-8 mx-auto rounded-md transition-colors",
                        isActive
                          ? "bg-zinc-100/80 text-zinc-900 font-medium"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
                      )}
                    >
                      {linkContent}
                    </Link>
                  </Tooltip>
                ) : (
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
                    {linkContent}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Divider */}
        {basePath.replace('/', '') !== "student" && basePath.replace('/', '') !== "admin" && (
          <div className="bg-zinc-100 h-px my-2" />
        )}

        {/* New Document */}
        {basePath.replace('/', '') !== "student" && basePath.replace('/', '') !== "admin" && (
          collapsed ? (
            <Tooltip label="Tài Liệu Mới" position="right" withArrow>
              <Link
                href={`${basePath}/documents/new`}
                className="flex items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors h-9 w-9 mx-auto shadow-sm bg-white mt-3"
              >
                <IconSquarePlus size={18} stroke={1.6} className="text-zinc-500 shrink-0" />
              </Link>
            </Tooltip>
          ) : (
            <Link
              href={`${basePath}/documents/new`}
              className="w-full flex items-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors h-9 px-3 gap-2.5 text-sm font-medium shadow-sm bg-white mt-3"
            >
              <IconSquarePlus size={18} stroke={1.6} className="text-zinc-500 shrink-0" />
              <span className="truncate">Tài Liệu Mới</span>
            </Link>
          )
        )}
        {/* Render children (like chat history) if passed */}
        {children}
      </nav>

      {/* ── Profile Dropdown ── */}
      <div className="mt-auto p-3 shrink-0">
        <Menu shadow="sm" width={204} position="top-start" offset={4} withArrow={false}>
          <Menu.Target>
    <button className={cn("w-full flex items-center p-1.5 gap-2.5 bg-white border border-zinc-200/80 rounded-lg shadow-sm hover:bg-zinc-50 transition-colors text-left", collapsed && "justify-center")}>
              {/* Avatar */}
              {user?.image ? (
                <img src={user.image} alt={userName} className="rounded-md w-6 h-6 object-cover shrink-0" />
              ) : (
                <div className="rounded-md bg-gradient-to-tr from-cyan-400 via-pink-500 to-amber-400 w-6 h-6 shrink-0" />
              )}

              {!collapsed && (
                <>
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
                </>
              )}
            </button>
          </Menu.Target>

          <Menu.Dropdown className="!rounded-xl !border-zinc-200 !shadow-md !p-1.5">
            <div className="px-2 py-1.5 mb-1 border-b border-zinc-100 flex flex-col gap-0.5">
              <span className="block text-zinc-900 text-[13px] font-semibold truncate">{userName}</span>
              <span className="block text-zinc-500 text-[11px] truncate">{userEmail}</span>
            </div>
            
            <Menu.Item 
              component={Link} 
              href={`${basePath}/profile`} 
              leftSection={<IconUser size={15} stroke={1.6} />}
              className="!text-[13px] !font-medium !text-zinc-700 hover:!bg-zinc-50 !rounded-md"
            >
              Tài Khoản
            </Menu.Item>
            <Menu.Item 
              component={Link} 
              href={`${basePath}/settings`} 
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
