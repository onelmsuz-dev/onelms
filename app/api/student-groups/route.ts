import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  studentId: z.string().min(1),
  groupId:   z.string().min(1),
});

// POST — add existing student to a new group (used for group transfer)
export const POST = guard(["SUPER_ADMIN", "RECEPTIONIST"], async (req, _, { organizationId }) => {
  if (!organizationId) return err("Organization topilmadi", 400);

  const body   = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { studentId, groupId } = parsed.data;

  const [student, group] = await Promise.all([
    db.student.findFirst({ where: { id: studentId, organizationId } }),
    db.group.findFirst({ where: { id: groupId, organizationId } }),
  ]);
  if (!student) return err("O'quvchi topilmadi", 404);
  if (!group)   return err("Guruh topilmadi", 404);

  const existing = await db.studentGroup.findUnique({
    where: { studentId_groupId: { studentId, groupId } },
  });

  if (existing) {
    if (existing.enrollmentStatus !== "CHIQIB_KETGAN") {
      return err("O'quvchi bu guruhda allaqachon ro'yxatda", 400);
    }
    // Re-activate: was CHIQIB_KETGAN, now re-joining as FAOL
    const sg = await db.$transaction(async (tx) => {
      const updated = await tx.studentGroup.update({
        where: { id: existing.id },
        data:  { enrollmentStatus: "FAOL", joinedAt: new Date() },
      });
      await tx.student.update({
        where: { id: studentId },
        data:  { isActive: true },
      });
      return updated;
    });
    return ok(sg);
  }

  const sg = await db.$transaction(async (tx) => {
    const record = await tx.studentGroup.create({
      data: { studentId, groupId, enrollmentStatus: "FAOL" },
    });
    await tx.student.update({
      where: { id: studentId },
      data:  { isActive: true },
    });
    return record;
  });

  return ok(sg, 201);
});
