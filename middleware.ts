import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Forward current path in header for downstream Server Component layout checks
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // 1. Unrestricted Auth & Setup routes
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/auth") ||
    pathname === "/setup" ||
    pathname.startsWith("/api/setup")
  ) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 2. Protect /admin and all sub-routes
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect /api/admin/* endpoints
  if (pathname.startsWith("/api/admin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized access: valid admin session required" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/setup",
    "/api/setup/:path*",
  ],
};
