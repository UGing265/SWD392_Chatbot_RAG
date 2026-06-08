"use client";

import { useState } from "react";
import { Shield, Database, Bell, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const sections = [
  {
    title: "RAG Engine",
    desc: "Configure retrieval and embedding settings for the platform.",
    icon: Database,
    fields: [
      { label: "Embedding Model", value: "gemini-embedding-001", type: "select" as const },
      { label: "Vector Dimensions", value: "3072", type: "text" as const },
      { label: "Chunk Size", value: "512 tokens", type: "text" as const },
      { label: "Similarity Threshold", value: "0.75", type: "text" as const },
    ],
  },
  {
    title: "Security",
    desc: "Manage authentication and access control policies.",
    icon: Shield,
    toggles: [
      { label: "Require 2FA for Admins", default: true },
      { label: "Session Timeout (1 hour)", default: true },
      { label: "IP Allowlist", default: false },
    ],
  },
  {
    title: "Notifications",
    desc: "Configure system alerts and email notifications.",
    icon: Bell,
    toggles: [
      { label: "Indexing failure alerts", default: true },
      { label: "Daily usage report", default: true },
      { label: "New user registration", default: false },
    ],
  },
];

export function AdminSettingsView() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  const getToggle = (key: string, defaultVal: boolean) =>
    toggles[key] ?? defaultVal;

  const setToggle = (key: string, val: boolean) =>
    setToggles((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">System Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure platform-wide settings for the RAG engine and administration.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft"
            >
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.desc}</p>
                </div>
              </div>

              {"fields" in section && section.fields && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <div key={field.label}>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  ))}
                </div>
              )}

              {"toggles" in section && section.toggles && (
                <div className="space-y-3">
                  {section.toggles.map((t) => {
                    const key = `${section.title}-${t.label}`;
                    return (
                      <div
                        key={t.label}
                        className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3"
                      >
                        <span className="text-sm text-foreground">{t.label}</span>
                        <Switch
                          checked={getToggle(key, t.default)}
                          onCheckedChange={(v) => setToggle(key, v)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">API Keys</h2>
              <p className="text-sm text-muted-foreground">
                Manage external service credentials for LLM and embedding providers.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Gemini API Key
              </label>
              <input
                type="password"
                defaultValue="sk-••••••••••••••••"
                className="h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Vector DB Connection
              </label>
              <input
                type="text"
                defaultValue="postgresql://localhost:5432/studymate_vectors"
                className="h-10 w-full rounded-xl border border-border bg-muted/30 px-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" className="rounded-xl">
            Reset to Defaults
          </Button>
          <Button className="rounded-xl shadow-soft">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
