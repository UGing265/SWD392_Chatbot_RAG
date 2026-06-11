import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAuth = request.cookies.has("mock_auth");

  const role = request.cookies.get("mock_role")?.value || "student";
  const pathname = request.nextUrl.pathname;

  // Allow access to login page
  if (pathname.startsWith("/login")) {
    if (isAuth) {
      if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      if (role === "lecturer") return NextResponse.redirect(new URL("/lecturer/documents/my", request.url));
      return NextResponse.redirect(new URL("/student/documents/shared", request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if unauthenticated
  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Route Guards: Prevent cross-role access
  if (pathname.startsWith("/student") && role !== "student") {
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    if (role === "lecturer") return NextResponse.redirect(new URL("/lecturer/documents/my", request.url));
  }

  if (pathname.startsWith("/lecturer") && role !== "lecturer") {
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    if (role === "student") return NextResponse.redirect(new URL("/student/documents/shared", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    if (role === "lecturer") return NextResponse.redirect(new URL("/lecturer/documents/my", request.url));
    if (role === "student") return NextResponse.redirect(new URL("/student/documents/shared", request.url));
  }

  // Root path routing
  if (pathname === "/") {
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    if (role === "lecturer") return NextResponse.redirect(new URL("/lecturer/documents/my", request.url));
    return NextResponse.redirect(new URL("/student/documents/shared", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
