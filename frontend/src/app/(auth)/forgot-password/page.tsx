"use client";

import { useState, useRef, MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
});

function StaticCard({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-[440px] z-10 relative">{children}</div>;
}

function SpotlightInput({
  field,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  field?: any;
  label: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty("--x", `${x}px`);
    divRef.current.style.setProperty("--y", `${y}px`);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className="relative group rounded-[6px] bg-[#FFFFFF] border border-[#EAEAEA] focus-within:border-[#111111] transition-colors duration-300"
    >
      <div className="pointer-events-none absolute inset-0 rounded-[6px] overflow-hidden z-0">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(120px_circle_at_var(--x)_var(--y),rgba(17,17,17,0.03),transparent_100%)]" />
      </div>
      <Input
        {...props}
        {...field}
        placeholder=" "
        className="peer h-14 w-full bg-transparent border-none px-4 text-[15px] text-[#111111] shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[6px] relative z-10"
      />
      <label className="absolute left-3 top-[17px] z-20 origin-top-left -translate-y-[27px] scale-[0.8] transform font-medium text-[15px] text-[#A0A0A0] peer-focus:text-[#111111] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-[27px] peer-focus:scale-[0.8] peer-autofill:!-translate-y-[27px] peer-autofill:!scale-[0.8] peer-autofill:transition-none pointer-events-none bg-[#FFFFFF] px-1">
        {label}
      </label>
    </div>
  );
}

function ElegantExpandButton({
  children,
  disabled,
  isLoading,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="relative pt-6 w-full h-auto flex items-center justify-center">
      <Button
        type="submit"
        disabled={disabled}
        className="group relative flex h-14 w-full overflow-hidden rounded-[6px] bg-[#111111] text-[#FFFFFF] text-[15px] font-medium transition-all duration-500 hover:bg-[#222222] hover:shadow-[0_8px_24px_-6px_rgba(17,17,17,0.3)] disabled:opacity-50 disabled:cursor-not-allowed border border-[#111111]"
      >
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {isLoading ? (
            <span className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              Đang Xử Lý
            </span>
          ) : (
            <div className="flex items-center relative">
              <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-2">
                {children}
              </span>
              <svg
                className="absolute opacity-0 -right-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:-right-5"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </Button>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const { forgetPassword, isLoading } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const watchEmail = form.watch("email");

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
      <StaticCard>
        <div className="bg-[#FFFFFF] rounded-[16px] border border-[#EAEAEA] p-8 md:p-12 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="mb-10 text-left border-b border-[#EAEAEA] pb-6">
            <h2 className="font-serif text-[40px] tracking-[-0.03em] text-[#111111] leading-none select-none">
              Khôi Phục.
            </h2>
          </div>

          {isSuccess ? (
            <div className="space-y-6 text-center animate-in fade-in duration-500">
              <div className="mx-auto w-16 h-16 bg-[#111111] rounded-full flex items-center justify-center mb-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="font-serif text-[22px] text-[#111111]">Đã Gửi Email Khôi Phục</h3>
              <p className="text-[14px] text-[#787774] leading-relaxed px-4">
                Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu vào email{" "}
                <span className="font-medium text-[#111111]">{watchEmail}</span>. Vui lòng kiểm tra
                hộp thư của bạn.
              </p>
              <div className="pt-6">
                <Link
                  href="/login"
                  className="text-[14px] font-medium text-[#111111] hover:underline underline-offset-4 transition-colors"
                >
                  Quay Lại Đăng Nhập
                </Link>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <SpotlightInput label="Email" field={field} />
                        </FormControl>
                        <FormMessage className="text-[13px] text-[#9F2F2D] ml-0.5 mt-2" />
                      </FormItem>
                    )}
                  />
                </div>

                <ElegantExpandButton isLoading={isLoading} disabled={isLoading || !watchEmail}>
                  Gửi Yêu Cầu
                </ElegantExpandButton>

                <div className="pt-6 text-center">
                  <Link
                    href="/login"
                    className="text-[13px] text-[#787774] hover:text-[#111111] transition-colors hover:underline underline-offset-4"
                  >
                    Quay Lại Đăng Nhập
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </div>
      </StaticCard>

      <div className="mt-10 text-center text-[11px] text-[#A0A0A0] font-mono uppercase tracking-[0.1em] animate-in fade-in duration-1000 delay-500">
        StudyMate System &copy; {new Date().getFullYear()}
      </div>
    </>
  );
}
