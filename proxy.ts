import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

function getSubdomainFromReq(req: NextRequest): string | null {
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    req.nextUrl.hostname;
  const hostname = host.split(":")[0].toLowerCase();
  const parts = hostname.split(".");
  if (
    parts.length >= 3 &&
    parts[0] !== "www" &&
    !hostname.includes("vercel.app") &&
    !hostname.includes("localhost")
  ) {
    return parts[0];
  }
  return null;
}

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const role       = (req.auth?.user as any)?.role ?? null;
  const { pathname } = req.nextUrl;

  const isApiAuth = pathname.startsWith("/api/auth");
  if (isApiAuth) return NextResponse.next();

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

  // ── Subdomain routing (demo.oneroom.uz, birnchi.oneroom.uz, ...) ─────────
  const subdomain = getSubdomainFromReq(req);

  if (subdomain) {
    if (pathname === "/") {
      const target = isLoggedIn ? "/dashboard" : "/login";
      return Response.redirect(new URL(target, req.nextUrl));
    }
    if (pathname === "/login" && isLoggedIn) {
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    }
    if (pathname !== "/login" && !isLoggedIn) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
    const res = NextResponse.next();
    res.headers.set("x-org-subdomain", subdomain);
    return res;
  }

  // ── Asosiy domen (oneroom.uz) ────────────────────────────────────────────
  if (pathname === "/") return NextResponse.next();
  if (pathname === "/login") {
    if (isLoggedIn) return Response.redirect(new URL("/dashboard", req.nextUrl));
    return NextResponse.next();
  }
  if (!isLoggedIn) return Response.redirect(new URL("/login", req.nextUrl));

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)$).*)",
  ],
};
