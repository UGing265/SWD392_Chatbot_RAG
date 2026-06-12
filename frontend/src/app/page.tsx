"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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

function getHomePath(role: string) {
  if (role === "admin") return "/admin";
  if (role === "lecturer") return "/lecturer/documents/my";
  return "/student/documents/shared";
}

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("access_token="));
    
    if (tokenCookie) {
      const token = tokenCookie.split("=")[1];
      const payload = decodeJwt(token);
      if (payload && payload.role && ["admin", "lecturer", "student"].includes(payload.role)) {
        router.replace(getHomePath(payload.role));
        return;
      }
    }
    
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
