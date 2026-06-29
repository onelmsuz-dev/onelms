import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:     z.string().min(2),
  phone:    z.string().min(9),
  email:    z.string().email().optional(),
  password: z.string().min(6),
  role:     z.enum(["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"]),
});

export const GET = guard(["SUPER_ADMIN"], async (_, __, { organizationId }) => {
  const users = await db.user.findMany({
    where:   { organizationId: organizationId ?? undefined },
    select:  { id: true, name: true, phone: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return ok(users);
});

export const POST = guard(["SUPER_ADMIN"], async (req, _, { organizationId }) => {
  if (!organizationId) return err("Organization topilmadi", 400);
  const body   = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const existing = await db.user.findFirst({ where: { phone: parsed.data.phone, organizationId } });
  if (existing) return err("Bu telefon raqam allaqachon ro'yxatdan o'tgan");

  const hashed = await bcrypt.hash(parsed.data.password, 12);

  const user = await db.user.create({
    data:   { ...parsed.data, password: hashed, organizationId },
    select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
  });

  return ok(user, 201);
});
