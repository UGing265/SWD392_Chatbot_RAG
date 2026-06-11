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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function getExplicitUserRole(user: unknown): UserRole | null {
  const roleId = (user as any)?.roleId ?? (user as any)?.role_id;
  if (roleId === 1) return "admin";
  if (roleId === 2) return "lecturer";
  if (roleId === 3) return "student";
  return null;
}

async function resolveUserRole(user: unknown, token: string | null): Promise<UserRole> {
  const explicitRole = getExplicitUserRole(user);
  if (explicitRole) return explicitRole;

  if (!token) return "student";

  const headers = { Authorization: `Bearer ${token}` };

  const adminResponse = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
  if (adminResponse.ok) return "admin";

  const lecturerResponse = await fetch(`${API_BASE_URL}/api/documents/dashboard`, { headers });
  if (lecturerResponse.ok) return "lecturer";

  return "student";
}

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [resolvedRole, setResolvedRole] = useState<UserRole | null>(null);
  const [isResolvingRole, setIsResolvingRole] = useState(false);
  const { data: sessionData, isPending: isSessionPending, refetch } = authClient.useSession();

  // Keep the Go API bearer token aligned with the active Better Auth session.
  useEffect(() => {
    if (!sessionData) {
      setResolvedRole(null);
      return;
    }

    const match = document.cookie.match(/(^|;)\s*better-auth\.session_token\s*=\s*([^;]+)/);
    const sessionToken = match?.[2] || localStorage.getItem("token");

    if (match?.[2]) {
      localStorage.setItem("token", match[2]);
    }

    let cancelled = false;
    setResolvedRole(null);
    setIsResolvingRole(true);

    resolveUserRole(sessionData.user, sessionToken)
      .then((role) => {
        if (cancelled) return;
        setResolvedRole(role);
      })
      .catch((err) => {
        console.error("Failed to resolve user role:", err);
        if (!cancelled) setResolvedRole("student");
      })
      .finally(() => {
        if (!cancelled) setIsResolvingRole(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionData]);

  const session = sessionData
    ? (() => {
        let currentRole: UserRole = "student";
        
        // 1. Try to get role from JWT token
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token") || document.cookie.match(/(^|;)\s*access_token\s*=\s*([^;]+)/)?.[2];
          if (token) {
            const payload = decodeJwt(token);
            if (payload && payload.role) {
              currentRole = payload.role as UserRole;
              return { user: sessionData.user, role: currentRole };
            }
          }
        }

        // 2. Try to get role from resolvedRole (async check)
        if (resolvedRole) {
          return { user: sessionData.user, role: resolvedRole };
        }

        // 3. Fallback to roleId/role_id mapping in sessionData.user
        const userObj = sessionData.user as any;
        const rId = userObj.roleId || userObj.role_id;
        currentRole = Number(rId) === 1 ? "admin" : Number(rId) === 2 ? "lecturer" : "student";
        
        return {
          user: sessionData.user,
          role: currentRole,
        };
      })()
    : null;

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

        let role: UserRole = "student";
        if (jwtToken) {
          const payload = decodeJwt(jwtToken);
          console.log("Decoded JWT payload:", payload);
          if (payload && payload.role) {
            role = payload.role as UserRole;
          }
        }

        // Fallback for role resolution from data.user or email if not resolved via JWT
        if (role === "student") {
          let loginRId = (data.user as any).roleId || (data.user as any).role_id;
          if (!loginRId) {
            if (email.toLowerCase().includes('admin')) loginRId = 1;
            else if (email.toLowerCase().includes('lecturer') || email.toLowerCase().includes('gv')) loginRId = 2;
            else loginRId = 3;
          }
          role = Number(loginRId) === 1 ? "admin" : (Number(loginRId) === 2 ? "lecturer" : "student");
        }

        toast.success("Đăng nhập thành công!", {
          description: "Đang chuyển hướng...",
        });

        await refetch();
        setIsLoading(false);

        const currentRole = role;
        setTimeout(() => {
          if (currentRole === "student") {
            router.push(`/student/documents/shared`);
          } else if (currentRole === "admin") {
            router.push(`/admin`);
          } else {
            // Lecturer
            router.push(`/lecturer/documents/my`);
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
    isLoading: isLoading || isSessionPending || isResolvingRole,
  };
}
