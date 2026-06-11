import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

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
    setIsResolvingRole(true);

    resolveUserRole(sessionData.user, sessionToken)
      .then((role) => {
        if (cancelled) return;
        setResolvedRole(role);
        document.cookie = `mock_role=${role}; path=/; max-age=3600`;
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

  const session = sessionData ? (() => {
    const userObj = sessionData.user as any;
    const rId = userObj.roleId || userObj.role_id;
    const roleStr = Number(rId) === 1 ? "admin" : (Number(rId) === 2 ? "lecturer" : "student");
    return {
      user: sessionData.user,
      role: roleStr as UserRole
    };
  })() : null;

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
        
        let loginRId = (data.user as any).roleId || (data.user as any).role_id;
        
        // Fallback for testing if database doesn't have the role correctly set
        if (!loginRId) {
          if (email.toLowerCase().includes('admin')) loginRId = 1;
          else if (email.toLowerCase().includes('lecturer') || email.toLowerCase().includes('gv')) loginRId = 2;
          else loginRId = 3;
        }

        const role = Number(loginRId) === 1 ? "admin" : (Number(loginRId) === 2 ? "lecturer" : "student");

        document.cookie = "mock_auth=true; path=/; max-age=3600";
        document.cookie = `mock_role=${role}; path=/; max-age=3600`;

        toast.success("Đăng nhập thành công!", {
          description: "Đang chuyển hướng...",
        });

        await refetch();
        setIsLoading(false);

        setTimeout(() => {
          if (role === "student") {
            router.push(`/student/documents/shared`);
          } else if (role === "admin") {
            router.push(`/admin/dashboard`);
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
    document.cookie = "mock_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsLoading(false);
    router.push("/login");
  }, [router]);

  return {
    signIn,
    signOut,
    session,
    isLoading: isLoading || isSessionPending || isResolvingRole || isRolePending,
  };
}
