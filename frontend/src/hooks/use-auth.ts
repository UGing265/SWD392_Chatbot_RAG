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
    isLoading: isLoading || isSessionPending,
  };
}
