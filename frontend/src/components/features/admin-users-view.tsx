"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Lock,
  Unlock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const usersData = [
  {
    id: "U-001",
    name: "Lâm Minh Triết",
    email: "trietlm@fpt.edu.vn",
    role: "Student",
    status: "ĐANG HOẠT ĐỘNG",
    active: true,
  },
  {
    id: "U-002",
    name: "Nguyễn Văn Minh",
    email: "minhnv@fe.edu.vn",
    role: "Lecturer",
    status: "ĐANG HOẠT ĐỘNG",
    active: true,
  },
  {
    id: "U-003",
    name: "Trần Thị Thu",
    email: "thutt@fe.edu.vn",
    role: "Lecturer",
    status: "ĐANG HOẠT ĐỘNG",
    active: true,
  },
  {
    id: "U-004",
    name: "Hệ thống Admin",
    email: "admin@fpt.edu.vn",
    role: "Admin",
    status: "ĐANG HOẠT ĐỘNG",
    active: true,
  },
  {
    id: "U-005",
    name: "Lê Hoàng Long",
    email: "longlh@fpt.edu.vn",
    role: "Student",
    status: "BỊ KHÓA",
    active: false,
  },
];

export function AdminUsersView() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = usersData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý tài khoản người dùng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý vai trò và trạng thái truy cập của người dùng trong hệ thống
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm người dùng theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border border-border/60 bg-white pl-11 pr-4 text-sm shadow-soft focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5"
          />
        </div>
        <button className="flex h-12 items-center gap-2 rounded-2xl bg-secondary px-6 text-sm font-semibold text-secondary-foreground shadow-soft transition-all hover:opacity-90">
          <Plus className="h-4 w-4" />
          Tạo tài khoản mới
        </button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/60">
              <TableHead className="pl-6 h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Tên người dùng
              </TableHead>
              <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Vai trò
              </TableHead>
              <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </TableHead>
              <TableHead className="pr-6 h-12 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="group transition-colors hover:bg-muted/30">
                <TableCell className="pl-6 py-4">
                  <span className="text-sm font-semibold text-foreground">
                    {user.name}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm text-foreground">{user.role}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-[11px] font-bold tracking-tight",
                      user.active
                        ? "bg-success-soft text-success-foreground"
                        : "bg-rose-soft text-rose-foreground"
                    )}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="pr-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.active ? (
                      <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
                        <Lock className="h-3.5 w-3.5" />
                        Khóa
                      </button>
                    ) : (
                      <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-success-soft hover:text-success-foreground hover:border-success/30">
                        <Unlock className="h-3.5 w-3.5" />
                        Mở khóa
                      </button>
                    )}
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Hiển thị {filteredUsers.length} trên {usersData.length} người dùng
          </p>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-medium text-primary-foreground">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
