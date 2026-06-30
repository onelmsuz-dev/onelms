import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

export const GET = guard(["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"], async (_, ctx, { organizationId }) => {
  const { id } = await ctx.params;
  const course = await db.course.findFirst({
    where: { id, organizationId: organizationId ?? undefined },
    include: {
      groups: {
        include: {
          teacher: { include: { user: true } },
          students: { include: { student: true } },
        },
        orderBy: { startDate: "desc" },
      },
    },
  });
  if (!course) return err("Kurs topilmadi", 404);
  return ok(course);
});

const updateSchema = z.object({
  name:        z.string().min(2).optional(),
  description: z.string().optional(),
  duration:    z.string().min(1).optional(),
  price:       z.number().positive().optional(),
  color:       z.string().optional(),
});

export const PATCH = guard(["SUPER_ADMIN"], async (req, ctx, { organizationId }) => {
  const { id } = await ctx.params;
  const body   = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const count = await db.course.updateMany({
    where: { id, organizationId: organizationId ?? undefined },
    data:  parsed.data,
  });
  if (count.count === 0) return err("Kurs topilmadi", 404);
  const course = await db.course.findUnique({ where: { id } });
  return ok(course);
});

export const DELETE = guard(["SUPER_ADMIN"], async (_req, ctx, { organizationId }) => {
  const { id } = await ctx.params;

  const groupCount = await db.group.count({ where: { courseId: id, organizationId: organizationId ?? undefined } });
  if (groupCount > 0) return err("Kursga bog'liq guruhlar bor. Avval guruhlarni o'chiring.");

  await db.course.deleteMany({ where: { id, organizationId: organizationId ?? undefined } });
  return ok({ success: true });
});
