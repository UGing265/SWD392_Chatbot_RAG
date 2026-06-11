import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_HOME = "/admin";
const LECTURER_HOME = "/lecturer/documents/my";
const STUDENT_HOME = "/student/documents/shared";

function getHomePath(role: string) {
  if (role === "admin") return ADMIN_HOME;
  if (role === "lecturer") return LECTURER_HOME;
  return STUDENT_HOME;
}

export function middleware(request: NextRequest) {
  const isAuth = request.cookies.has("mock_auth");

  const role = request.cookies.get("mock_role")?.value || "student";
  const pathname = request.nextUrl.pathname;

  // Allow access to login page
  if (pathname.startsWith("/login")) {
    if (isAuth) {
      return NextResponse.redirect(new URL(getHomePath(role), request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if unauthenticated
  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Route Guards: Prevent cross-role access
  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL(getHomePath(role), request.url));
  }

  if (pathname.startsWith("/lecturer") && role !== "lecturer") {
    return NextResponse.redirect(new URL(getHomePath(role), request.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(getHomePath(role), request.url));
  }

  // Root path routing
  if (pathname === "/") {
    return NextResponse.redirect(new URL(getHomePath(role), request.url));
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
