"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect logic based on mock cookies
    const cookies = document.cookie.split("; ");
    const authCookie = cookies.find((row) => row.startsWith("mock_auth="));
    const roleCookie = cookies.find((row) => row.startsWith("mock_role="));
    
    if (authCookie && authCookie.split("=")[1] === "true" && roleCookie) {
      const role = roleCookie.split("=")[1];
      router.replace(`/${role}`);
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
