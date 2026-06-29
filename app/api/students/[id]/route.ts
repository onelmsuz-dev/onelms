import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name:        z.string().min(2).optional(),
  phone:       z.string().min(9).optional(),
  parentPhone: z.string().optional(),
  balance:     z.number().optional(),
});

export const GET = guard(["SUPER_ADMIN", "TEACHER", "RECEPTIONIST"], async (_, ctx, { role, teacherId, organizationId }) => {
  const { id } = await ctx.params;

  const student = await db.student.findFirst({
    where: { id, organizationId: organizationId ?? undefined },
    include: {
      groups: {
        include: { group: { include: { course: true, teacher: { include: { user: true } } } } },
      },
      payments:   { orderBy: { date: "desc" }, take: 20 },
      attendance: { orderBy: { date: "desc" }, take: 30 },
    },
  });

  if (!student) return err("O'quvchi topilmadi", 404);

  if (role === "TEACHER" && teacherId) {
    const inTeacherGroup = student.groups.some(sg => sg.group.teacherId === teacherId);
    if (!inTeacherGroup) return err("Ruxsat yo'q", 403);
  }

  return ok(student);
});

export const PATCH = guard(["SUPER_ADMIN", "RECEPTIONIST"], async (req, ctx, { organizationId }) => {
  const { id }  = await ctx.params;
  const body    = await req.json().catch(() => null);
  const parsed  = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const student = await db.student.updateMany({
    where: { id, organizationId: organizationId ?? undefined },
    data:  parsed.data,
  });

  if (student.count === 0) return err("O'quvchi topilmadi", 404);
  const updated = await db.student.findUnique({ where: { id } });
  return ok(updated);
});

export const DELETE = guard(["SUPER_ADMIN"], async (_, ctx, { organizationId }) => {
  const { id } = await ctx.params;
  await db.student.deleteMany({ where: { id, organizationId: organizationId ?? undefined } });
  return ok({ success: true });
});
