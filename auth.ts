import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";

const loginSchema = z.object({
  phone:     z.string().min(1),
  password:  z.string().min(1),
  subdomain: z.string().optional().default(""),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { phone, password, subdomain } = parsed.data;

        // PLATFORM_ADMIN: admin subdomenidan kiradi
        if (subdomain === "admin") {
          const user = await db.user.findFirst({
            where: { phone, role: "PLATFORM_ADMIN", organizationId: null },
          });
          if (!user || !user.isActive) return null;
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;
          return {
            id: user.id, name: user.name, email: user.email ?? "",
            phone: user.phone, role: user.role,
            teacherId: null, organizationId: null,
          };
        }

        // Subdomensiz kirish: telefon bo'yicha istalgan orgdan qidirish
        if (!subdomain || subdomain === "demo" || subdomain === "www") {
          const user = await db.user.findFirst({
            where: { phone, organizationId: { not: null } },
            include: { organization: { select: { isActive: true } } },
          });
          if (!user || !user.isActive) return null;
          if (!user.organization?.isActive) return null;

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;

          let teacherId: string | null = null;
          if (user.role === "TEACHER") {
            const teacher = await db.teacher.findUnique({
              where: { userId: user.id }, select: { id: true },
            });
            teacherId = teacher?.id ?? null;
          }

          return {
            id: user.id, name: user.name, email: user.email ?? "",
            phone: user.phone, role: user.role,
            teacherId, organizationId: user.organizationId,
          };
        }

        // Subdomenli kirish: subdomain orqali org topiladi
        const org = await db.organization.findUnique({ where: { subdomain } });
        if (!org || !org.isActive) return null;

        const user = await db.user.findFirst({
          where: { phone, organizationId: org.id },
        });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        let teacherId: string | null = null;
        if (user.role === "TEACHER") {
          const teacher = await db.teacher.findUnique({
            where: { userId: user.id }, select: { id: true },
          });
          teacherId = teacher?.id ?? null;
        }

        return {
          id: user.id, name: user.name, email: user.email ?? "",
          phone: user.phone, role: user.role,
          teacherId, organizationId: org.id,
        };
      },
    }),
  ],
});
