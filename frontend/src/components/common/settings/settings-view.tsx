"use client";

import { useState } from "react";
import {
  PasswordInput,
  Button,
  Paper,
  Text,
  Stack,
} from "@mantine/core";

export function SettingsView() {
  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-zinc-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900">Cài đặt</h1>
        <Text size="sm" c="dimmed" className="mt-1">Quản lý tài khoản và giao diện.</Text>

        <Stack gap="lg" className="mt-8">
          <Section
            title="Đổi mật khẩu"
            desc="Cập nhật mật khẩu của bạn để bảo vệ tài khoản."
          >
            <Stack gap="md" className="max-w-md">
              <PasswordInput
                placeholder="Mật khẩu hiện tại"
                radius="md"
                size="md"
              />
              <PasswordInput
                placeholder="Mật khẩu mới"
                radius="md"
                size="md"
              />
              <PasswordInput
                placeholder="Xác nhận mật khẩu mới"
                radius="md"
                size="md"
              />
              <Button
                color="blue"
                radius="md"
                w="fit-content"
                mt="xs"
              >
                Cập nhật mật khẩu
              </Button>
            </Stack>
          </Section>
        </Stack>
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
    <Paper withBorder p="xl" radius="lg" bg="#ffffff" className="shadow-sm">
      <Text fw={700} size="md" className="text-gray-900">{title}</Text>
      <Text size="xs" c="dimmed" className="mt-1 mb-4">{desc}</Text>
      <div>{children}</div>
    </Paper>
  );
}
