import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
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
  const groupId = searchParams.get("groupId");
  const q       = searchParams.get("q") ?? "";

  const teacherFilter = role === "TEACHER" && teacherId
    ? { groups: { some: { group: { teacherId } } } }
    : {};

  const students = await db.student.findMany({
    where: {
      organizationId: organizationId ?? undefined,
      ...teacherFilter,
      ...(groupId ? { groups: { some: { groupId } } } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: {
      groups: {
        include: { group: { include: { course: true, teacher: { include: { user: true } } } } },
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

  const group = await db.group.findFirst({ where: { id: groupId, organizationId } });
  if (!group) return err("Guruh topilmadi", 404);

  const student = await db.$transaction(async (tx) => {
    const s = await tx.student.create({ data: { ...data, organizationId } });
    await tx.studentGroup.create({ data: { studentId: s.id, groupId } });
    return s;
  });

  return ok(student, 201);
});
