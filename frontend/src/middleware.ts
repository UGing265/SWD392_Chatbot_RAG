import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  const tokenCookie = request.cookies.get("access_token");
  const isAuth = !!tokenCookie;

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/forgot-password") ||
                     request.nextUrl.pathname.startsWith("/reset-password");

  // Allow access to auth pages
  if (isAuthPage) {
  // If already logged in, redirect to role-based home
    if (isAuth) {
      const payload = decodeJwt(tokenCookie.value);
      if (payload && payload.role && ["admin", "lecturer", "student"].includes(payload.role)) {
        return NextResponse.redirect(new URL(`/${payload.role}/documents/my`, request.url));
      } else {
        // Invalid token or missing role, let them stay on auth page
        const response = NextResponse.next();
        response.cookies.delete("access_token");
        return response;
      }
    }
    return NextResponse.next();
  }

  // Redirect to login if unauthenticated
  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Validate JWT payload for protected routes
  const payload = decodeJwt(tokenCookie.value);
  if (!payload || !payload.role || !["admin", "lecturer", "student"].includes(payload.role)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    return response;
  }

  const userRole = payload.role;

  // Check if the route is a role-specific protected route
  // The paths are in the format /[role]/...
  const match = request.nextUrl.pathname.match(/^\/([^/]+)/);
  if (match) {
    const routeRole = match[1];
    const validRoles = ["student", "lecturer", "admin"];
    
    if (validRoles.includes(routeRole)) {
      // If the user's role doesn't match the route's role, redirect them to their own dashboard
      if (routeRole !== userRole) {
        return NextResponse.redirect(new URL(`/${userRole}/documents/my`, request.url));
      }
    }
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
