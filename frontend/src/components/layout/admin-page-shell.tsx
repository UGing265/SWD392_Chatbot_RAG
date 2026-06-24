"use client";

import type { ReactNode } from "react";
import { Group, Stack, Text, Title } from "@mantine/core";

type AdminPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidthClass?: string;
};

export function AdminPageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  maxWidthClass = "",
}: AdminPageShellProps) {
  return (
    <div className="relative min-h-full w-full flex-1 bg-zinc-50 font-sans">
      <div className="w-full px-4 py-10 sm:px-6 md:px-8 md:py-12 xl:px-[72px]">
        <div className={`w-full ${maxWidthClass}`}>
          <Group
            justify="space-between"
            align="flex-end"
            gap="md"
            className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            <Stack gap={0}>
              <Text
                size="xs"
                fw={600}
                className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500"
              >
                {eyebrow}
              </Text>
              <Title
                order={1}
                className="mb-3 select-none font-serif text-[40px] leading-none tracking-[-0.03em] text-zinc-900"
              >
                {title}
              </Title>
              <Text size="sm" c="dimmed" className="max-w-2xl font-sans font-medium">
                {description}
              </Text>
            </Stack>

            {actions && <Group gap="sm">{actions}</Group>}
          </Group>

          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
