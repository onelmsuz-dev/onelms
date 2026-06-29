import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const upsertSchema = z.object({
  groupId:  z.string().min(1),
  date:     z.string(),
  records:  z.array(z.object({
    studentGroupId: z.string().min(1),
    studentId:      z.string().min(1),
    status:         z.enum(["KELDI", "KELMADI", "KECH_KELDI", "SABABLI"]),
    note:           z.string().optional(),
  })),
});

export const GET = guard(["SUPER_ADMIN", "TEACHER"], async (req, _, { role, teacherId }) => {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");
  const date    = searchParams.get("date");

  if (!groupId) return err("groupId kerak");

  // Teacher can only access their own group
  if (role === "TEACHER" && teacherId) {
    const group = await db.group.findUnique({ where: { id: groupId }, select: { teacherId: true } });
    if (!group || group.teacherId !== teacherId) return err("Ruxsat yo'q", 403);
  }

  const attendance = await db.attendance.findMany({
    where: {
      groupId,
      ...(date ? { date: { gte: new Date(date), lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) } } : {}),
    },
    include: { student: true, studentGroup: true },
    orderBy: { date: "desc" },
  });

  return ok(attendance);
});

export const POST = guard(["SUPER_ADMIN", "TEACHER"], async (req, _, { role, teacherId }) => {
  const body   = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { groupId, date, records } = parsed.data;

  // Teacher can only mark attendance for their own groups
  if (role === "TEACHER" && teacherId) {
    const group = await db.group.findUnique({ where: { id: groupId }, select: { teacherId: true } });
    if (!group || group.teacherId !== teacherId) return err("Ruxsat yo'q", 403);
  }

  const dateObj = new Date(date);

  const upserted = await db.$transaction(
    records.map(r =>
      db.attendance.upsert({
        where:  { studentGroupId_date: { studentGroupId: r.studentGroupId, date: dateObj } },
        update: { status: r.status, note: r.note },
        create: {
          studentGroupId: r.studentGroupId,
          studentId:      r.studentId,
          groupId,
          date:           dateObj,
          status:         r.status,
          note:           r.note,
        },
      })
    )
  );

  return ok(upserted);
});
