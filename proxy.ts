import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

function getSubdomain(req: NextRequest): string {
  const host = req.headers.get("host") ?? "";
  if (host.includes("localhost")) {
    const parts = host.split(".");
    return parts.length >= 2 ? parts[0] : "demo";
  }
  const parts = host.split(".");
  return parts.length >= 3 ? parts[0] : "demo";
}

export const proxy = auth((req) => {
  const isLoggedIn  = !!req.auth;
  const role        = (req.auth?.user as any)?.role ?? null;
  const { pathname } = req.nextUrl;

  const isApiAuth = pathname.startsWith("/api/auth");
  if (isApiAuth) return NextResponse.next();
  if (pathname === "/") return NextResponse.next();

  // ── /admode routes ──────────────────────────────────────────────────────
  if (pathname.startsWith("/admode")) {
    if (pathname === "/admode/login") {
      if (isLoggedIn && role === "PLATFORM_ADMIN")
        return Response.redirect(new URL("/admode", req.nextUrl));
      return NextResponse.next();
    }
    if (!isLoggedIn)
      return Response.redirect(new URL("/admode/login", req.nextUrl));
    if (role !== "PLATFORM_ADMIN")
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    return NextResponse.next();
  }

  // ── Regular dashboard routes ─────────────────────────────────────────────
  if (pathname === "/login") {
    if (isLoggedIn) return Response.redirect(new URL("/dashboard", req.nextUrl));
    return NextResponse.next();
  }

  if (!isLoggedIn) return Response.redirect(new URL("/login", req.nextUrl));

  const subdomain = getSubdomain(req);
  const res = NextResponse.next();
  res.headers.set("x-org-subdomain", subdomain);
  return res;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)$).*)",
  ],
};
