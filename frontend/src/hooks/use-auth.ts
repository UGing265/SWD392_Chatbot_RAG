import { useState, useCallback } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

export type UserRole = "student" | "teacher" | "admin";

/**

 * Mock representation of the Better Auth client.

 * In a real application, this would import from the generated better-auth client.

 */

export function useAuth() {

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const [session, setSession] = useState<{ user: any; role: UserRole } | null>(null);



  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Map emails to roles
      let role: UserRole = "student";
      const emailLower = email.toLowerCase();
      if (emailLower.includes("admin")) {
        role = "admin";
      } else if (emailLower.includes("teacher") || emailLower === "minhan@studymate.vn") {
        role = "teacher";
      } else {
        role = "student";
      }



      // Mock validation

      if (email && password.length >= 6) {

        setSession({

          user: {

            id: "1",

            email: email,

            name: "Minh An",

          },

          role,

        });

        document.cookie = "mock_auth=true; path=/; max-age=3600";

        document.cookie = `mock_role=${role}; path=/; max-age=3600`;

        toast.success("Đăng nhập thành công!", {

          description: "Đang chuyển hướng...",

        });

        setIsLoading(false);

        // Simulate redirect to dashboard or practice page

        setTimeout(() => {

          router.push(`/${role}`);

        }, 500);

        return { success: true };

      } else {

        toast.error("Đăng nhập thất bại", {

          description: "Email hoặc mật khẩu không chính xác.",

        });

        setIsLoading(false);

        return { success: false, error: "Invalid credentials" };

      }

    },

    [router]

  );



  const signOut = useCallback(async () => {

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    setSession(null);

    document.cookie = "mock_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    document.cookie = "mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    setIsLoading(false);

    router.push("/login");

  }, [router]);



  return {

    signIn,

    signOut,

    session,

    isLoading,

  };

}

