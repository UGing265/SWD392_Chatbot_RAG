import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export type UserRole = "student" | "lecturer" | "admin";

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: sessionData, isPending: isSessionPending, refetch } = authClient.useSession();

  // Ensure session token is stored in localStorage if session exists
  useEffect(() => {
    if (sessionData && !localStorage.getItem("token")) {
      const match = document.cookie.match(/(^|;)\s*better-auth\.session_token\s*=\s*([^;]+)/);
      if (match) {
        localStorage.setItem("token", match[2]);
      }
    }
  }, [sessionData]);

  const session = sessionData ? {
    user: sessionData.user,
    role: sessionData.user.email === "admin01@gmail.com"
      ? "admin"
      : (sessionData.user.email === "teacher@gmail.com" 
        ? "lecturer" 
        : ((sessionData.user as any).roleId === 1 ? "admin" : ((sessionData.user as any).roleId === 2 ? "lecturer" : "student"))) as UserRole
  } : null;

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);

      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error("Đăng nhập thất bại", {
          description: error.message || "Email hoặc mật khẩu không chính xác.",
        });
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data) {
        const token = data.token;
        localStorage.setItem("token", token);
        
        const role = data.user.email === "admin01@gmail.com"
          ? "admin"
          : (data.user.email === "teacher@gmail.com"
            ? "lecturer"
            : ((data.user as any).roleId === 1 ? "admin" : ((data.user as any).roleId === 2 ? "lecturer" : "student")));

        document.cookie = "mock_auth=true; path=/; max-age=3600";
        document.cookie = `mock_role=${role}; path=/; max-age=3600`;

        toast.success("Đăng nhập thành công!", {
          description: "Đang chuyển hướng...",
        });

        await refetch();
        setIsLoading(false);

        setTimeout(() => {
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push(`/${role}/documents/my`);
          }
        }, 500);

        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Authentication failed" };
    },
    [router, refetch]
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Failed to sign out from Better Auth:", err);
    }
    localStorage.removeItem("token");
    document.cookie = "mock_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsLoading(false);
    router.push("/login");
  }, [router]);

  return {
    signIn,
    signOut,
    session,
    isLoading: isLoading || isSessionPending,
  };
}
