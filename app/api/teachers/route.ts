import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:           z.string().min(2).optional(),
  phone:          z.string().min(9).optional(),
  email:          z.string().email().optional(),
  password:       z.string().min(6).optional(),
  subjects:       z.array(z.string()).optional(),
  salary:         z.number().positive().optional(),
  salaryType:     z.enum(["FIXED", "PERCENT"]).optional(),
  existingUserId: z.string().optional(), // link existing admin/user as teacher
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

  const { existingUserId, name, phone, email, password, subjects, salary, salaryType } = parsed.data;

  // ── Mavjud foydalanuvchini (masalan, admin) o'qituvchi sifatida qo'shish ──
  if (existingUserId) {
    const user = await db.user.findFirst({ where: { id: existingUserId, organizationId } });
    if (!user) return err("Foydalanuvchi topilmadi", 404);

    const alreadyTeacher = await db.teacher.findUnique({ where: { userId: existingUserId } });
    if (alreadyTeacher) return err("Bu foydalanuvchi allaqachon o'qituvchi sifatida ro'yxatda");

    const teacher = await db.teacher.create({
      data: {
        userId:         existingUserId,
        organizationId,
        phone:          user.phone,
        email:          user.email ?? undefined,
        subjects:       subjects?.length ? subjects : ["Umumiy"],
        salary:         salary ?? 0,
        salaryType:     salaryType ?? "FIXED",
      },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });
    return ok(teacher, 201);
  }

  // ── Yangi foydalanuvchi yaratib o'qituvchi qilish ──
  if (!name || !phone || !password || !subjects?.length) {
    return err("Ism, telefon, parol va fan majburiy");
  }

  const existing = await db.user.findFirst({ where: { phone, organizationId } });
  if (existing) return err("Bu telefon raqam allaqachon ro'yxatdan o'tgan");

  const hashed = await bcrypt.hash(password, 12);

  const teacher = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, phone, email, password: hashed, role: "TEACHER", organizationId },
    });
    return tx.teacher.create({
      data: { userId: user.id, phone, email, subjects, salary: salary ?? 0, salaryType: salaryType ?? "FIXED", organizationId },
      include: { user: { select: { id: true, name: true, phone: true } } },
    });
  });

  return ok(teacher, 201);
});
