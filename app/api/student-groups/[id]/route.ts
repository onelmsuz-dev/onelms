import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  enrollmentStatus: z.enum(["SINOV", "FAOL", "CHIQIB_KETGAN"]).optional(),
  paymentStatus:    z.enum(["TOLANDI", "QARZDOR", "QISMAN"]).optional(),
});

export const PATCH = guard(["SUPER_ADMIN", "RECEPTIONIST"], async (req, ctx, { organizationId }) => {
  const { id }  = await ctx.params;
  const body    = await req.json().catch(() => null);
  const parsed  = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const sg = await db.studentGroup.findFirst({
    where: { id, student: { organizationId: organizationId ?? undefined } },
  });
  if (!sg) return err("Topilmadi", 404);

  const updated = await db.studentGroup.update({
    where: { id },
    data:  parsed.data,
  });

  // FAOL ga o'tkazilganda studentni ham faollashtirish
  if (parsed.data.enrollmentStatus === "FAOL") {
    await db.student.update({
      where: { id: sg.studentId },
      data:  { isActive: true },
    });
  }

  return ok(updated);
});
