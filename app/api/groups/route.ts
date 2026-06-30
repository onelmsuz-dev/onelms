import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:         z.string().min(2),
  courseId:     z.string().min(1),
  teacherId:    z.string().min(1),
  roomId:       z.string().optional(),
  branchId:     z.string().optional(),
  maxStudents:  z.number().int().min(1).default(15),
  scheduleDays: z.array(z.string()).min(1),
  startTime:    z.string().regex(/^\d{2}:\d{2}$/),
  endTime:      z.string().regex(/^\d{2}:\d{2}$/),
  startDate:    z.string(),
  endDate:      z.string().optional(),
  status:       z.enum(["ACTIVE", "UPCOMING", "COMPLETED"]).default("ACTIVE"),
  color:        z.string().optional(),
});

export const GET = guard(
  ["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"],
  async (req, _, { role, teacherId, organizationId }) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q      = searchParams.get("q") ?? "";

    const teacherFilter = role === "TEACHER" && teacherId ? { teacherId } : {};

    const groups = await db.group.findMany({
      where: {
        organizationId: organizationId ?? undefined,
        ...teacherFilter,
        ...(status && status !== "barchasi" ? { status: status.toUpperCase() as any } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      include: {
        course:   true,
        teacher:  { include: { user: true } },
        room:     true,
        branch:   true,
        _count:   { select: { students: { where: { enrollmentStatus: { not: "CHIQIB_KETGAN" } } } } },
      },
      orderBy: { name: "asc" },
    });

    return ok(groups);
  }
);

export const POST = guard(["SUPER_ADMIN"], async (req, _, { organizationId }) => {
  if (!organizationId) return err("Organization topilmadi", 400);
  const body   = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { startDate, endDate, ...rest } = parsed.data;

  const group = await db.group.create({
    data: {
      ...rest,
      organizationId,
      startDate: new Date(startDate),
      endDate:   endDate ? new Date(endDate) : undefined,
    },
    include: { course: true, teacher: { include: { user: true } } },
  });

  return ok(group, 201);
});
