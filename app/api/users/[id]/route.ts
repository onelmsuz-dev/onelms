import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name:     z.string().min(2).optional(),
  phone:    z.string().min(9).optional(),
  email:    z.string().email().optional().or(z.literal("")),
  role:     z.enum(["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export const PATCH = guard(["SUPER_ADMIN"], async (req, ctx, { organizationId }) => {
  const { id } = await ctx.params;
  const body   = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const existing = await db.user.findFirst({
    where: { id, organizationId: organizationId ?? undefined },
  });
  if (!existing) return err("Foydalanuvchi topilmadi", 404);

  const { password, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (password) data.password = await bcrypt.hash(password, 12);
  if (rest.email === "") data.email = null;

  const user = await db.user.update({
    where:  { id },
    data,
    select: { id: true, name: true, phone: true, email: true, role: true, isActive: true },
  });

  return ok(user);
});

export const DELETE = guard(["SUPER_ADMIN"], async (_, ctx, { organizationId }) => {
  const { id } = await ctx.params;

  const existing = await db.user.findFirst({
    where: { id, organizationId: organizationId ?? undefined },
  });
  if (!existing) return err("Foydalanuvchi topilmadi", 404);
  if (existing.role === "SUPER_ADMIN") return err("Super Admin ni o'chirib bo'lmaydi", 403);

  await db.user.update({ where: { id }, data: { isActive: false } });
  return ok({ success: true });
});
