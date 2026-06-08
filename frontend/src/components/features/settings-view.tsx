"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export function SettingsView() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="scrollbar-thin h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-foreground">Cài đặt</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý tài khoản và giao diện.
        </p>

        <div className="mt-6 space-y-4">
          <Section title="Đổi mật khẩu" desc="Cập nhật mật khẩu của bạn để bảo vệ tài khoản.">
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <button className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90">
                Cập nhật mật khẩu
              </button>
            </div>
          </Section>

          {/* Giao diện section removed */}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5 text-sm text-foreground">
      {label}
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${defaultOn ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow-soft transition-transform ${defaultOn ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </span>
    </label>
  );
}
