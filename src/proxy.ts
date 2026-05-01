import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_ONLY_PATHS = ["/admin/site", "/admin/accounts"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("maiba-session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      const secretValue = process.env.JWT_SECRET;
      if (!secretValue) throw new Error("JWT_SECRET not configured");

      const secret = new TextEncoder().encode(secretValue);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role;

      if (role !== "admin" && role !== "moderator") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      if (
        role === "moderator" &&
        ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))
      ) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

