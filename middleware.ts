import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Vercel'da x-forwarded-host original hostni beradi
  const host     = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.hostname;
  const hostname = host.split(":")[0].toLowerCase();
  const parts    = hostname.split(".");

  // Subdomain aniqlash: demo.oneroom.uz → "demo"
  // oneroom.uz yoki www.oneroom.uz → asosiy domen
  const isSubdomain = parts.length >= 3 && parts[0] !== "www" && !hostname.includes("vercel.app");
  const isLoggedIn  = !!req.auth?.user;
  const { pathname } = req.nextUrl;

  const isApiAuth  = pathname.startsWith("/api/auth");
  const isStatic   = pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".");
  const isAdmode   = pathname.startsWith("/admode");
  const isLogin    = pathname === "/login";
  const isRoot     = pathname === "/";

  if (isStatic || isApiAuth) return;

  // Admode: har doim o'tadi (o'z auth logikasi bor)
  if (isAdmode) return;

  // Subdomain (masalan demo.oneroom.uz):
  if (isSubdomain) {
    // Root ga kirsa → login yoki dashboard
    if (isRoot) {
      const target = isLoggedIn ? "/dashboard" : "/login";
      return Response.redirect(new URL(target, req.nextUrl));
    }
    // Login sahifasiga kirgan bo'lsa va tizimga kirgan bo'lsa → dashboard
    if (isLogin && isLoggedIn) {
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    }
    // Boshqa sahifaga kirmoqchi, lekin login qilmagan → login
    if (!isLogin && !isLoggedIn) {
      return Response.redirect(new URL("/login", req.nextUrl));
    }
    return;
  }

  // Asosiy domen (oneroom.uz):
  // Root → landing (ruxsat)
  if (isRoot) return;
  // Login sahifasi → ruxsat
  if (isLogin) {
    if (isLoggedIn) return Response.redirect(new URL("/dashboard", req.nextUrl));
    return;
  }
  // Dashboard va boshqalar → login kerak
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|.*\\.svg).*)"],
};
