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

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Resolve Auth and Role strictly from JWT (access_token)
  const tokenCookie = request.cookies.get("access_token");
  
  let isAuth = false;
  let role = "student";

  if (tokenCookie) {
    const payload = decodeJwt(tokenCookie.value);
    if (payload && payload.role && ["admin", "lecturer", "student"].includes(payload.role)) {
      isAuth = true;
      role = payload.role;
    }
  }

  const isAuthPage = pathname.startsWith("/login") || 
                     pathname.startsWith("/forgot-password") ||
                     pathname.startsWith("/reset-password");

  // Allow access to auth pages
  if (isAuthPage) {
    // If already logged in, redirect to role-based home
    if (isAuth) {
      return NextResponse.redirect(new URL(getHomePath(role), request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if unauthenticated
  if (!isAuth) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // Clean token if it was invalid
    if (tokenCookie) {
      response.cookies.delete("access_token");
    }
    return response;
  }

  // Route Guards: Prevent cross-role access
  const match = pathname.match(/^\/([^/]+)/);
  if (match) {
    const routeRole = match[1];
    const validRoles = ["student", "lecturer", "admin"];
    
    if (validRoles.includes(routeRole)) {
      // If the user's role doesn't match the route's role, redirect them to their own dashboard
      if (routeRole !== role) {
        return NextResponse.redirect(new URL(getHomePath(role), request.url));
      }
    }
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
