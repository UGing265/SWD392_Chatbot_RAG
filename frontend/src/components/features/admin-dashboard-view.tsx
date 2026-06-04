"use client";

import { useState } from "react";
import {
  Database,
  Users,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const metrics = [
  {
    label: "Total Embeddings",
    value: "842,510",
    change: "+8.4%",
    up: true,
    icon: Database,
    bar: 78,
  },
  {
    label: "Active Users",
    value: "12,402",
    change: "2.1%",
    up: false,
    icon: Users,
    bar: 62,
  },
  {
    label: "System Health",
    value: "99.9%",
    badge: "READY",
    icon: ShieldCheck,
    bars: [4, 6, 5, 7, 8, 6, 9, 7, 8, 9],
  },
];

const chartData = [
  { time: "04:00", queries: 120 },
  { time: "08:00", queries: 280 },
  { time: "12:00", queries: 420 },
  { time: "16:00", queries: 380 },
  { time: "20:00", queries: 520 },
  { time: "23:59", queries: 340 },
];

const queryLogs = [
  {
    id: "Q-2841",
    query: "What is the cafeteria menu for Friday?",
    time: "12 mins ago",
    sources: ["Manual_v2", "Policy_FAQ"],
    latency: "1.2s",
    confidence: 0.94,
    status: "Success" as const,
  },
  {
    id: "Q-2840",
    query: "Explain the grading policy for CS3001 midterm",
    time: "28 mins ago",
    sources: ["Syllabus_2025", "Grading_Rubric"],
    latency: "2.4s",
    confidence: 0.87,
    status: "Success" as const,
  },
  {
    id: "Q-2839",
    query: "When is the next office hours for Dr. Rossi?",
    time: "45 mins ago",
    sources: ["Schedule_Fall"],
    latency: "1.8s",
    confidence: 0.62,
    status: "Partial" as const,
  },
  {
    id: "Q-2838",
    query: "What is the weather like tomorrow?",
    time: "1 hour ago",
    sources: [],
    latency: "0.4s",
    confidence: 0.12,
    status: "Out of Scope" as const,
  },
];

const chartConfig = {
  queries: { label: "Queries", color: "oklch(0.74 0.1 240)" },
};

const statusStyles = {
  Success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
  "Out of Scope": "bg-red-50 text-red-600 border-red-200",
};

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 0.8 ? "bg-emerald-500" : value >= 0.5 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 tabular-nums text-sm font-medium">{value.toFixed(2)}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

export function AdminDashboardView() {
  const [period, setPeriod] = useState<"1D" | "1W" | "1M">("1W");

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor RAG engine performance and query activity
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-white p-1">
          {(["1D", "1W", "1M"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{m.value}</p>
                  {"change" in m && m.change && (
                    <div className="mt-1 flex items-center gap-1 text-xs font-medium">
                      {m.up ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={m.up ? "text-emerald-600" : "text-red-500"}>{m.change}</span>
                    </div>
                  )}
                  {"badge" in m && m.badge && (
                    <span className="mt-2 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {m.badge}
                    </span>
                  )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              {"bar" in m && m.bar !== undefined && (
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: `${m.bar}%` }}
                  />
                </div>
              )}
              {"bars" in m && m.bars && (
                <div className="mt-4 flex items-end gap-0.5">
                  {m.bars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-emerald-400"
                      style={{ height: `${h * 3}px` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-6 rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Activity</h2>
            <p className="text-xs text-muted-foreground">Retrieval performance (last 24 hours)</p>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillQueries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-queries)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-queries)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="queries"
              stroke="var(--color-queries)"
              strokeWidth={2}
              fill="url(#fillQueries)"
            />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Query Log</h2>
          <div className="flex items-center gap-3">
            <select className="rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground focus:outline-none">
              <option>Sort by Confidence</option>
              <option>Sort by Latency</option>
              <option>Sort by Time</option>
            </select>
            <button className="text-xs font-medium text-primary hover:underline">View All Logs</button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Query Information</TableHead>
              <TableHead>Source Docs</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10 pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {queryLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="pl-5">
                  <p className="max-w-xs truncate text-sm font-medium text-foreground">
                    {log.query}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {log.id} · {log.time}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {log.sources.length > 0 ? (
                      log.sources.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums text-sm">{log.latency}</TableCell>
                <TableCell>
                  <ConfidenceBar value={log.confidence} />
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      statusStyles[log.status],
                    )}
                  >
                    {log.status}
                  </span>
                </TableCell>
                <TableCell className="pr-5">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
          <p className="text-xs text-muted-foreground">Showing 4 of 2,400 queries</p>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
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
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <button className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pop transition-transform hover:scale-105">
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
