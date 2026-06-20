"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PasswordInput,
  Button,
  Paper,
  Text,
  Stack,
  Title,
  Group,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { IconKey, IconLock } from "@tabler/icons-react";
import { useAuth } from "@/hooks/use-auth";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function SettingsView() {
  const { changePassword, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    const res = await changePassword(values.currentPassword, values.newPassword);
    if (res.success) {
      reset();
    }
  };

  return (
    <Stack gap="xl" p="md" className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-zinc-50/50" style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
      {/* Header - Matching Standard Pages */}
      <div>
        <Title order={2} style={{ fontFamily: "var(--font-heading)" }}>
          Đổi mật khẩu
        </Title>
        <Text size="sm" c="dimmed">
          Cập nhật mật khẩu tài khoản của bạn để đảm bảo an toàn thông tin
        </Text>
      </div>

      {/* Card Section - Matching Standard Pages */}
      <Paper withBorder radius="lg" p="xl" shadow="sm" style={{ maxWidth: 540 }}>
        <Group gap="md" mb="md">
          <ThemeIcon color="dark" variant="light" size="lg" radius="lg">
            <IconKey size={20} />
          </ThemeIcon>
          <div>
            <Title order={4}>Mật khẩu tài khoản</Title>
            <Text size="xs" c="dimmed">
              Vui lòng điền thông tin bên dưới để thay đổi mật khẩu của bạn
            </Text>
          </div>
        </Group>
        <Divider mb="xl" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <PasswordInput
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              withAsterisk
              radius="lg"
              size="md"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />

            <PasswordInput
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              withAsterisk
              radius="lg"
              size="md"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />

            <PasswordInput
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              withAsterisk
              radius="lg"
              size="md"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              color="dark"
              radius="lg"
              size="md"
              loading={isLoading}
              className="mt-3 bg-zinc-900 hover:bg-zinc-800"
              style={{ width: "fit-content" }}
            >
              Cập nhật mật khẩu
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
