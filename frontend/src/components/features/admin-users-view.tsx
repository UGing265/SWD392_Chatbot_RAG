"use client";

import { useState } from "react";
import {
  Download,
  UserPlus,
  Search,
  MoreVertical,
  Users,
  GraduationCap,
  Zap,
  UserCheck,
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UserRole = "Teacher" | "Student" | "Admin";
type UserStatus = "Active" | "Blocked";

type User = {
  id: string;
  email: string;
  role: UserRole;
  lastActive: string;
  status: UserStatus;
};

const users: User[] = [
  { id: "1", email: "s.johnson@studymate.edu", role: "Teacher", lastActive: "2 mins ago", status: "Active" },
  { id: "2", email: "m.chen@student.studymate.edu", role: "Student", lastActive: "14 Oct 2023", status: "Active" },
  { id: "3", email: "d.rossi@studymate.edu", role: "Teacher", lastActive: "Yesterday", status: "Active" },
  { id: "4", email: "a.patel@student.studymate.edu", role: "Student", lastActive: "Just now", status: "Active" },
  { id: "5", email: "blocked.user@studymate.edu", role: "Student", lastActive: "3 days ago", status: "Blocked" },
  { id: "6", email: "minhan@studymate.vn", role: "Admin", lastActive: "Just now", status: "Active" },
];

const roleStyles: Record<UserRole, string> = {
  Teacher: "bg-primary/10 text-primary",
  Student: "bg-muted text-muted-foreground",
  Admin: "bg-accent/20 text-accent-foreground",
};

const summaryCards = [
  { label: "Total Users", value: "1,284", sub: "All Accounts", icon: Users, color: "text-primary" },
  { label: "Teachers", value: "156", sub: "Staff Directory", icon: GraduationCap, color: "text-primary" },
  { label: "Active Now", value: "42", sub: "Live Session Tracking", icon: Zap, color: "text-emerald-600", live: true },
  { label: "Pending Requests", value: "08", sub: "Requires Attention", icon: UserCheck, color: "text-amber-600", warn: true },
];

export function AdminUsersView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = users.filter((u) => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user access, roles, and account statuses.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            Export List
          </Button>
          <Button className="gap-2 rounded-xl shadow-soft">
            <UserPlus className="h-4 w-4" />
            Add New User
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border/60 bg-white p-4 shadow-soft sm:flex-row sm:items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          <option value="All">Status: All</option>
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>
        <button
          onClick={() => { setStatusFilter("All"); setSearch(""); }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear All
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="h-10 w-full rounded-xl border border-border bg-muted/30 pl-9 pr-4 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white shadow-soft">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Email Address</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="pl-5 font-medium text-foreground">{user.email}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      roleStyles[user.role],
                    )}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.lastActive}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        user.status === "Active" ? "bg-emerald-500" : "bg-red-500",
                      )}
                    />
                    <span className={user.status === "Active" ? "text-emerald-700" : "text-red-600"}>
                      {user.status}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-end gap-1 border-t border-border/60 px-5 py-3">
          <button className="flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:bg-muted">
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium",
                p === 1
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {p}
            </button>
          ))}
          <span className="px-1 text-xs text-muted-foreground">…</span>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted">
            12
          </button>
          <button className="flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:bg-muted">
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p className={cn("mt-2 text-3xl font-bold tabular-nums", card.color)}>
                    {card.value}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    {card.live && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    {card.warn && <span className="text-amber-500">⚠</span>}
                    {card.sub}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60">
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
