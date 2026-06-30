import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const GET = guard(["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"], async (_, ctx, { organizationId }) => {
  const { id } = await ctx.params;
  const teacher = await db.teacher.findFirst({
    where: { id, organizationId: organizationId ?? undefined },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true, isActive: true } },
      groups: {
        include: {
          course: true,
          students: { include: { student: true } },
        },
        orderBy: { startDate: "desc" },
      },
      salaries: { orderBy: { month: "desc" }, take: 12 },
    },
  });
  if (!teacher) return err("O'qituvchi topilmadi", 404);
  return ok(teacher);
});


export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name:       z.string().min(2).optional(),
  phone:      z.string().min(9).optional(),
  email:      z.string().email().optional().or(z.literal("")),
  subjects:   z.array(z.string()).min(1).optional(),
  salary:     z.number().positive().optional(),
  salaryType: z.enum(["FIXED", "PERCENT"]).optional(),
  status:     z.enum(["ACTIVE", "INACTIVE"]).optional(),
  password:   z.string().min(6).optional(),
});

export const PATCH = guard(["SUPER_ADMIN"], async (req, ctx, { organizationId }) => {
  const { id } = await ctx.params;
  const body   = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const teacher = await db.teacher.findFirst({
    where: { id, organizationId: organizationId ?? undefined },
  });
  if (!teacher) return err("O'qituvchi topilmadi", 404);

  const { name, phone, email, password, subjects, salary, salaryType, status } = parsed.data;

  const updated = await db.$transaction(async (tx) => {
    if (name || phone || email !== undefined || password) {
      const userUpdate: Record<string, unknown> = {};
      if (name)     userUpdate.name  = name;
      if (phone)    userUpdate.phone = phone;
      if (email !== undefined) userUpdate.email = email || null;
      if (password) userUpdate.password = await bcrypt.hash(password, 12);
      await tx.user.update({ where: { id: teacher.userId }, data: userUpdate });
    }

    const teacherUpdate: Record<string, unknown> = {};
    if (phone)      teacherUpdate.phone      = phone;
    if (email !== undefined) teacherUpdate.email = email || null;
    if (subjects)   teacherUpdate.subjects   = subjects;
    if (salary)     teacherUpdate.salary     = salary;
    if (salaryType) teacherUpdate.salaryType = salaryType;
    if (status)     teacherUpdate.status     = status;

    return tx.teacher.update({
      where: { id },
      data:  teacherUpdate,
      include: { user: { select: { id: true, name: true, phone: true, email: true, isActive: true } } },
    });
  });

  return ok(updated);
});

export const DELETE = guard(["SUPER_ADMIN"], async (_req, ctx, { organizationId }) => {
  const { id } = await ctx.params;

  const teacher = await db.teacher.findFirst({
    where: { id, organizationId: organizationId ?? undefined },
    select: { id: true, userId: true, _count: { select: { groups: true } } },
  });
  if (!teacher) return err("O'qituvchi topilmadi", 404);

  if (teacher._count.groups > 0)
    return err("O'qituvchiga bog'liq guruhlar bor. Avval guruhlarni qayta tayinlang.");

  await db.$transaction(async (tx) => {
    await tx.teacher.delete({ where: { id } });
    await tx.user.delete({ where: { id: teacher.userId } });
  });

  return ok({ success: true });
});
