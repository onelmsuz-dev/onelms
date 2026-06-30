import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { createNotification } from "@/lib/notify";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:        z.string().min(2),
  phone:       z.string().min(9),
  parentPhone: z.string().optional(),
  groupId:     z.string().min(1),
});

export const GET = guard(["SUPER_ADMIN", "TEACHER", "RECEPTIONIST"], async (req, _, { role, teacherId, organizationId }) => {
  const { searchParams } = new URL(req.url);
  const groupId  = searchParams.get("groupId");
  const q        = searchParams.get("q") ?? "";
  const isActive = searchParams.get("isActive");

  const teacherFilter = role === "TEACHER" && teacherId
    ? { groups: { some: { group: { teacherId } } } }
    : {};

  const students = await db.student.findMany({
    where: {
      organizationId: organizationId ?? undefined,
      ...teacherFilter,
      ...(groupId   ? { groups: { some: { groupId } } } : {}),
      ...(q         ? { name:   { contains: q, mode: "insensitive" } } : {}),
      ...(isActive !== null ? { isActive: isActive === "true" } : {}),
    },
    include: {
      groups: {
        include: {
          group: { include: { course: true, teacher: { include: { user: true } } } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return ok(students);
});

export const POST = guard(["SUPER_ADMIN", "RECEPTIONIST"], async (req, _, { organizationId }) => {
  if (!organizationId) return err("Organization topilmadi", 400);
  const body   = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { groupId, ...data } = parsed.data;

  const group = await db.group.findFirst({
    where: { id: groupId, organizationId },
    select: { id: true, scheduleDays: true, startTime: true },
  });
  if (!group) return err("Guruh topilmadi", 404);

  // Keyingi dars kunini topamiz (sinov darsi uchun)
  const trialDate = nextClassDate(group.scheduleDays, group.startTime);

  const student = await db.$transaction(async (tx) => {
    const s = await tx.student.create({
      data: { ...data, organizationId, isActive: false },
    });

    const sg = await tx.studentGroup.create({
      data: { studentId: s.id, groupId, enrollmentStatus: "SINOV" },
    });

    // Sinov darsi attendance yozuvi
    if (trialDate) {
      await tx.attendance.create({
        data: {
          studentGroupId: sg.id,
          studentId: s.id,
          groupId,
          date:   trialDate,
          status: "SINOV_DARSI",
        },
      }).catch(() => null); // unique constraint — o'sha kuni boshqa yozuv bo'lsa skip
    }

    return s;
  });

  void createNotification(
    organizationId,
    "student",
    "Yangi o'quvchi ro'yxatdan o'tdi",
    `${student.name}${parsed.data.phone ? ` · ${parsed.data.phone}` : ""}`,
  );

  return ok(student, 201);
});

// Guruh jadvaliga mos keyingi sana topadi
function nextClassDate(scheduleDays: string[], _startTime: string): Date | null {
  const DAY_MAP: Record<string, number> = {
    "du": 1, "se": 2, "ch": 3, "pa": 4, "ju": 5, "sha": 6, "ya": 0,
    "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6, "sun": 0,
  };
  const days = scheduleDays
    .map(d => DAY_MAP[d.toLowerCase()])
    .filter(d => d !== undefined);

  if (!days.length) return null;

  const now  = new Date();
  const dow  = now.getDay(); // 0=Sun
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);

  for (let i = 0; i <= 7; i++) {
    const targetDow = (dow + i) % 7;
    if (days.includes(targetDow)) {
      date.setDate(date.getDate() + i);
      return date;
    }
  }
  return null;
}
