"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, GraduationCap, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email hoặc tên tài khoản"),
  password: z.string().min(6, "Mật khẩu phải dài ít nhất 6 ký tự"),
  rememberMe: z.boolean(),
});

export default function LoginPage() {
  const { signIn, isLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "minhan@studymate.vn",
      password: "password123",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await signIn(values.email, values.password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[480px] animate-fade-in-up">
        <div className="relative overflow-hidden rounded-[40px] bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg">
              <GraduationCap className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">StudyMate</h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Hệ thống Học liệu & Chatbot RAG
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-foreground">
                      Email hoặc Tên tài khoản
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username@fpt.edu.vn hoặc giảng viên"
                        className="h-14 rounded-full border-gray-100 bg-gray-50/50 px-6 text-sm focus:border-primary/20 focus:bg-white transition-all outline-none ring-0 placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-foreground">Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-14 rounded-full border-gray-100 bg-gray-50/50 px-6 text-sm focus:border-primary/20 focus:bg-white transition-all outline-none ring-0 placeholder:text-gray-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-xs font-medium text-muted-foreground cursor-pointer"
                      >
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                  )}
                />
                <a
                  href="#"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-14 w-full rounded-full bg-primary text-sm font-bold text-white shadow-xl transition-all hover:opacity-90 active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Đăng Nhập"
                )}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 font-bold tracking-widest text-muted-foreground">
                HOẶC TIẾP TỤC VỚI
              </span>
            </div>
          </div>

          {/* Social Login */}
          <Button
            variant="outline"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full border-gray-100 bg-white text-sm font-bold text-[#333] hover:bg-gray-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Đăng nhập với Google FPT/FE
          </Button>
        </div>
      </div>
    </div>
  );
}

