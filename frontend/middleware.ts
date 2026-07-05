import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/account", "/checkout"];
const ADMIN_PREFIX = "/admin";

// This middleware only gates navigation using the lightweight, non-sensitive
// "auth_state" cookie (role only). The real authorization boundary is the
// backend's JWT + AdminOnly middleware — this is a UX convenience, not security.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("auth_state")?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdmin = pathname.startsWith(ADMIN_PREFIX);

  if (!authCookie && (isProtected || isAdmin)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && authCookie) {
    try {
      const parsed = JSON.parse(authCookie);
      if (parsed.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*"],
};
