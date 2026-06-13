"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button, TextInput, PasswordInput, Paper, Text, Stack } from "@mantine/core";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email hoặc tên tài khoản"),
  password: z.string().min(6, "Mật khẩu phải dài ít nhất 6 ký tự"),
});

export default function LoginPage() {
  const { signIn, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const watchEmail = watch("email");
  const isEmailEntered = watchEmail.length > 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await signIn(values.email, values.password);
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
              StudyMate.
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Tài Khoản"
                placeholder="Email hoặc tên đăng nhập"
                error={errors.email?.message}
                size="md"
                radius="md"
                {...register("email")}
              />

              <div
                className={`grid transition-[grid-template-rows,opacity,margin-top] duration-500 ${
                  isEmailEntered
                    ? "grid-rows-[1fr] opacity-100 mt-2"
                    : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden">
                  <PasswordInput
                    label="Mật Khẩu"
                    placeholder="Nhập mật khẩu"
                    error={errors.password?.message}
                    size="md"
                    radius="md"
                    visible={showPassword}
                    onVisibilityChange={setShowPassword}
                    {...register("password")}
                  />
                </div>
              </div>

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
                Tiếp Tục
              </Button>

              <div className="text-center mt-4">
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors hover:underline underline-offset-4"
                >
                  Bạn quên mật khẩu?
                </Link>
              </div>
            </Stack>
          </form>
        </Paper>
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-400 font-mono uppercase tracking-[0.1em]">
        StudyMate System &copy; {new Date().getFullYear()}
      </div>
    </>
  );
}
