import type { NextAuthConfig } from "next-auth";

// Edge-compatible config (no DB, no bcrypt)
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id             = user.id ?? "";
        token.role           = (user as any).role;
        token.phone          = (user as any).phone;
        token.teacherId      = (user as any).teacherId      ?? null;
        token.organizationId = (user as any).organizationId ?? null;
        token.orgSubdomain   = (user as any).orgSubdomain   ?? null;
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
        session.user.orgSubdomain   = token.orgSubdomain   as string | null;
      }
      return session;
    },
  },
  providers: [],
  session: { strategy: "jwt" },
};
