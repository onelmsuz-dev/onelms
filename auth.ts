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

        // Asosiy domen (oneroom.uz) yoki www — FAQAT Platform Admin
        if (!subdomain || subdomain === "www" || subdomain === "admin") {
          const admin = await db.user.findFirst({
            where: { phone, role: "PLATFORM_ADMIN", organizationId: null },
          });
          if (!admin || !admin.isActive) return null;
          const valid = await bcrypt.compare(password, admin.password);
          if (!valid) return null;
          return {
            id: admin.id, name: admin.name, email: admin.email ?? "",
            phone: admin.phone, role: admin.role,
            teacherId: null, organizationId: null, orgSubdomain: null,
          };
        }

        // Subdomenli kirish: faqat o'sha subdomendagi foydalanuvchi
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
          teacherId, organizationId: org.id, orgSubdomain: subdomain,
        };
      },
    }),
  ],
});
