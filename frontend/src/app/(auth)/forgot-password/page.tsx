"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button, TextInput, Paper, Text, Stack, Center } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
});

export default function ForgotPasswordPage() {
  const { forgetPassword, isLoading } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const watchEmail = watch("email");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (forgetPassword) {
      const res = await forgetPassword(values.email);
      if (res.success) {
        setIsSuccess(true);
      }
    } else {
      setTimeout(() => setIsSuccess(true), 1000);
    }
  }

  return (
    <>
      <div className="w-full max-w-[440px] z-10 relative">
        <Paper
          withBorder
          p="xl"
          radius="lg"
          className="bg-white border-gray-200 shadow-md p-8 md:p-12"
        >
          <div className="mb-8 text-left border-b border-gray-100 pb-5">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 select-none">
              Khôi Phục.
            </h2>
          </div>

          {isSuccess ? (
            <Stack gap="md" align="center" className="text-center">
              <Center className="w-16 h-16 bg-gray-900 rounded-full text-white mb-4">
                <IconCircleCheck size={32} />
              </Center>
              <Text fw={900} size="lg" className="text-gray-900">
                Đã Gửi Email Khôi Phục
              </Text>
              <Text size="sm" c="dimmed" className="leading-relaxed px-4">
                Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu vào email{" "}
                <span className="font-semibold text-gray-900">{watchEmail}</span>. Vui lòng kiểm tra
                hộp thư của bạn.
              </Text>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-900 hover:underline underline-offset-4 transition-colors"
                >
                  Quay Lại Đăng Nhập
                </Link>
              </div>
            </Stack>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="Nhập email đăng ký tài khoản"
                  error={errors.email?.message}
                  size="md"
                  radius="md"
                  {...register("email")}
                />

                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading || !watchEmail}
                  color="dark"
                  size="lg"
                  radius="md"
                  className="mt-4 bg-gray-900 hover:bg-gray-800"
                  fullWidth
                >
                  Gửi Yêu Cầu
                </Button>

                <div className="text-center mt-4">
                  <Link
                    href="/login"
                    className="text-xs text-gray-500 hover:text-gray-900 transition-colors hover:underline underline-offset-4"
                  >
                    Quay Lại Đăng Nhập
                  </Link>
                </div>
              </Stack>
            </form>
          )}
        </Paper>
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-400 font-mono uppercase tracking-[0.1em]">
        StudyMate System &copy; {new Date().getFullYear()}
      </div>
    </>
  );
}
