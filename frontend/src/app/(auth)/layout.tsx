import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào StudyMate",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden dots">
      {/* Animated blob backgrounds */}
      <div className="absolute top-1/4 -left-1/4 w-[50vw] h-[50vw] bg-[var(--primary-soft)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-[50vw] h-[50vw] bg-[var(--accent-soft)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-[var(--peach-soft)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: "4s" }}></div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-md p-6">
        {children}
      </main>
    </div>
  );
}
