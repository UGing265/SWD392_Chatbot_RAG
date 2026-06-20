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
import { IconKey, IconLock, IconUser } from "@tabler/icons-react";
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
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#000000] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Cài đặt tài khoản</h1>
          <Text size="sm" className="text-white/70 mt-1">
            Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.
          </Text>
        </div>

        <Stack gap="xl">
          {/* Profile Section */}
          <Paper withBorder p="xl" radius="lg" className="bg-[#0d0d0d] border-white/5 shadow-sm">
            <Group mb="xl">
              <div className="h-12 w-12 rounded-2xl bg-teal-600/20 text-teal-400 flex items-center justify-center">
                <IconUser size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Thông tin cá nhân</h2>
                <Text size="xs" className="text-white/70 uppercase tracking-wider font-bold">Cập nhật thông tin định danh</Text>
              </div>
            </Group>
            
            {/* Note: In a real app, you'd have fields here. For now, matching the simplified structure. */}
            <Text size="sm" className="text-white/80">
              Thông tin hồ sơ của bạn được đồng bộ từ hệ thống quản lý sinh viên.
            </Text>
          </Paper>

          {/* Password Section */}
          <Paper withBorder radius="lg" p="xl" shadow="sm" className="bg-[#0d0d0d] border-white/5">
            <Group gap="md" mb="md">
              <ThemeIcon color="teal" variant="light" size="lg" radius="lg">
                <IconKey size={20} />
              </ThemeIcon>
              <div>
                <h2 className="text-xl font-bold text-white">Mật khẩu tài khoản</h2>
                <Text size="xs" className="text-white/70">
                  Vui lòng điền thông tin bên dưới để thay đổi mật khẩu của bạn
                </Text>
              </div>
            </Group>
            <Divider mb="xl" className="border-white/5" />

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
                  styles={{
                    label: { color: "rgba(255, 255, 255, 0.9)", marginBottom: "4px" },
                    input: { backgroundColor: "#171717", borderColor: "rgba(255, 255, 255, 0.1)", color: "white" }
                  }}
                />

                <PasswordInput
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  withAsterisk
                  radius="lg"
                  size="md"
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
                  styles={{
                    label: { color: "rgba(255, 255, 255, 0.9)", marginBottom: "4px" },
                    input: { backgroundColor: "#171717", borderColor: "rgba(255, 255, 255, 0.1)", color: "white" }
                  }}
                />

                <PasswordInput
                  label="Xác nhận mật khẩu mới"
                  placeholder="Nhập lại mật khẩu mới"
                  withAsterisk
                  radius="lg"
                  size="md"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                  styles={{
                    label: { color: "rgba(255, 255, 255, 0.9)", marginBottom: "4px" },
                    input: { backgroundColor: "#171717", borderColor: "rgba(255, 255, 255, 0.1)", color: "white" }
                  }}
                />

                <Button
                  type="submit"
                  color="teal"
                  radius="lg"
                  size="md"
                  loading={isLoading}
                  className="mt-3"
                  style={{ width: "fit-content" }}
                >
                  Cập nhật mật khẩu
                </Button>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </div>
    </div>
  );
}
