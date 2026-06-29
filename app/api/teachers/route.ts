import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:       z.string().min(2),
  phone:      z.string().min(9),
  email:      z.string().email().optional(),
  password:   z.string().min(6),
  subjects:   z.array(z.string()).min(1),
  salary:     z.number().positive(),
  salaryType: z.enum(["FIXED", "PERCENT"]),
});

export const GET = guard(["SUPER_ADMIN"], async (req, _, { organizationId }) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const teachers = await db.teacher.findMany({
    where: {
      organizationId: organizationId ?? undefined,
      ...(q ? { user: { name: { contains: q, mode: "insensitive" } } } : {}),
    },
    include: {
      user:   { select: { id: true, name: true, phone: true, email: true, isActive: true } },
      _count: { select: { groups: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return ok(teachers);
});

export const POST = guard(["SUPER_ADMIN"], async (req, _, { organizationId }) => {
  if (!organizationId) return err("Organization topilmadi", 400);
  const body   = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { name, phone, email, password, subjects, salary, salaryType } = parsed.data;

  const existing = await db.user.findFirst({ where: { phone, organizationId } });
  if (existing) return err("Bu telefon raqam allaqachon ro'yxatdan o'tgan");

  const hashed = await bcrypt.hash(password, 12);

  const teacher = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, phone, email, password: hashed, role: "TEACHER", organizationId },
    });
    return tx.teacher.create({
      data: { userId: user.id, phone, email, subjects, salary, salaryType, organizationId },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });
  });

  return ok(teacher, 201);
});
