import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

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

  let currentRole: UserRole = "student";
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token") || document.cookie.match(/(^|;)\s*access_token\s*=\s*([^;]+)/)?.[2];
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.role) {
        currentRole = payload.role as UserRole;
      }
    }
  }

  if (sessionData && (sessionData.user as any).roleId) {
     currentRole = (sessionData.user as any).roleId === 1 ? "admin" : ((sessionData.user as any).roleId === 2 ? "lecturer" : "student");
  }

  const session = sessionData ? {
    user: sessionData.user,
    role: currentRole
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
        // Retrieve the JWT token
        const client = authClient as any;
        let jwtToken;
        try {
          if (client.$fetch) {
            const res = await client.$fetch("/token", { method: "GET" });
            if (res.data) jwtToken = res.data.token;
          } else {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000'}/api/auth/token`);
            const tokenData = await res.json();
            jwtToken = tokenData?.token;
          }
        } catch (e) {
          console.error("Failed to fetch JWT token:", e);
        }
        
        if (!jwtToken) {
          jwtToken = data.token;
        }

        if (jwtToken) {
          localStorage.setItem("token", jwtToken);
          document.cookie = `access_token=${jwtToken}; path=/; max-age=3600`;
        }

        let role = "student";
        if (jwtToken) {
          const payload = decodeJwt(jwtToken);
          console.log("Decoded JWT payload:", payload);
          if (payload && payload.role) {
            role = payload.role;
          }
        }
        if (role === "student" && data.user && (data.user as any).roleId) {
          role = (data.user as any).roleId === 1 ? "admin" : ((data.user as any).roleId === 2 ? "lecturer" : "student");
        }

        toast.success("Đăng nhập thành công!", {
          description: "Đang chuyển hướng...",
        });

        await refetch();
        setIsLoading(false);

        setTimeout(() => {
          router.push(`/${role}/documents/my`);
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
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsLoading(false);
    router.push("/login");
  }, [router]);

  const forgetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      // @ts-ignore - Better Auth types might not include forgetPassword if plugin isn't typed
      const { data, error } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password",
      });
      if (error) {
        toast.error("Gửi yêu cầu thất bại", {
          description: error.message || "Không thể gửi email khôi phục.",
        });
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      toast.success("Đã gửi email khôi phục", {
        description: "Vui lòng kiểm tra hộp thư của bạn.",
      });
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || "Lỗi không xác định" };
    }
  }, []);

  return {
    signIn,
    signOut,
    forgetPassword,
    session,
    isLoading: isLoading || isSessionPending,
  };
}
