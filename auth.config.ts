import type { NextAuthConfig } from "next-auth";

// Edge-compatible config (no DB, no bcrypt)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn    = !!auth?.user;
      const isLoginPage   = nextUrl.pathname === "/login";
      const isApiAuth     = nextUrl.pathname.startsWith("/api/auth");
      const isLandingPage = nextUrl.pathname === "/";

      if (isApiAuth)     return true;
      if (isLandingPage) return true;
      if (isLoginPage)   return isLoggedIn ? Response.redirect(new URL("/dashboard", nextUrl)) : true;
      if (!isLoggedIn)   return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id             = user.id ?? "";
        token.role           = (user as any).role;
        token.phone          = (user as any).phone;
        token.teacherId      = (user as any).teacherId      ?? null;
        token.organizationId = (user as any).organizationId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id             = token.id             as string;
        session.user.role           = token.role           as any;
        session.user.phone          = token.phone          as string;
        session.user.teacherId      = token.teacherId      as string | null;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
  providers: [],
  session: { strategy: "jwt" },
};
