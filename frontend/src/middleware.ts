import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAuth = request.cookies.has("mock_auth");

  // Allow access to login page
  if (request.nextUrl.pathname.startsWith("/login")) {
  // If already logged in, redirect to role-based home
    if (isAuth) {
      const role = request.cookies.get("mock_role")?.value || "student";
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if unauthenticated
  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
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
