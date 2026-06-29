import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

// PATCH /api/teacher-salaries/[id] — mark as PAID
export const PATCH = guard(
  ["SUPER_ADMIN", "ACCOUNTANT"],
  async (_req: NextRequest, ctx: any, { organizationId }) => {
    const { id } = await ctx.params;

    const salary = await db.teacherSalary.findUnique({
      where:   { id },
      include: { teacher: { select: { organizationId: true } } },
    });

    if (!salary) return err("Oylik topilmadi", 404);
    if (salary.teacher.organizationId !== organizationId)
      return err("Ruxsat yo'q", 403);

    const updated = await db.teacherSalary.update({
      where: { id },
      data:  { status: "PAID", paidAt: new Date() },
      include: {
        teacher: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return ok(updated);
  }
);

// DELETE /api/teacher-salaries/[id] — remove a salary record
export const DELETE = guard(
  ["SUPER_ADMIN"],
  async (_req: NextRequest, ctx: any, { organizationId }) => {
    const { id } = await ctx.params;

    const salary = await db.teacherSalary.findUnique({
      where:   { id },
      include: { teacher: { select: { organizationId: true } } },
    });

    if (!salary) return err("Oylik topilmadi", 404);
    if (salary.teacher.organizationId !== organizationId)
      return err("Ruxsat yo'q", 403);

    await db.teacherSalary.delete({ where: { id } });
    return ok({ success: true });
  }
);
