import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name:         z.string().min(2).optional(),
  maxStudents:  z.number().int().min(1).optional(),
  scheduleDays: z.array(z.string()).optional(),
  startTime:    z.string().optional(),
  endTime:      z.string().optional(),
  status:       z.enum(["ACTIVE", "UPCOMING", "COMPLETED"]).optional(),
  roomId:       z.string().optional(),
});

export const GET = guard(
  ["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"],
  async (_, ctx, { role, teacherId, organizationId }) => {
    const { id } = await ctx.params;

    const group = await db.group.findFirst({
      where: { id, organizationId: organizationId ?? undefined },
      include: {
        course:   true,
        teacher:  { include: { user: true } },
        room:     true,
        branch:   true,
        students: {
          where:   { enrollmentStatus: { not: "CHIQIB_KETGAN" } },
          include: { student: true },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!group) return err("Guruh topilmadi", 404);

    if (role === "TEACHER" && teacherId && group.teacherId !== teacherId) {
      return err("Ruxsat yo'q", 403);
    }

    return ok(group);
  }
);

export const PATCH = guard(["SUPER_ADMIN", "TEACHER"], async (req, ctx, { role, teacherId, organizationId }) => {
  const { id } = await ctx.params;
  const body   = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  if (role === "TEACHER" && teacherId) {
    const group = await db.group.findFirst({ where: { id, organizationId: organizationId ?? undefined }, select: { teacherId: true } });
    if (!group || group.teacherId !== teacherId) return err("Ruxsat yo'q", 403);
  }

  const updated = await db.group.updateMany({
    where: { id, organizationId: organizationId ?? undefined },
    data:  parsed.data,
  });
  if (updated.count === 0) return err("Guruh topilmadi", 404);
  const result = await db.group.findUnique({ where: { id } });
  return ok(result);
});

export const DELETE = guard(["SUPER_ADMIN"], async (_, ctx, { organizationId }) => {
  const { id } = await ctx.params;
  await db.group.deleteMany({ where: { id, organizationId: organizationId ?? undefined } });
  return ok({ success: true });
});
