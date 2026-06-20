import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Nhập",
  description: "Đăng Nhập Vào StudyMate",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[#FBFBFA] text-[#111111] font-sans selection:bg-[#EAEAEA] selection:text-[#111111] relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] overflow-hidden select-none z-0">
        <h1 className="font-serif text-[28vw] tracking-tighter leading-none whitespace-nowrap text-[#111111] font-bold">
          StudyMate
        </h1>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full px-6">{children}</div>
    </div>
  );
}
