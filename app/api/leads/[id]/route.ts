import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status:       z.enum(["YANGI", "ALOQA_QILINGAN", "SINOV_DARSI", "TO_LANDI", "BEKOR"]).optional(),
  note:         z.string().optional(),
  assignedToId: z.string().optional(),
  name:         z.string().min(2).optional(),
  phone:        z.string().min(9).optional(),
  source:       z.string().optional(),
  course:       z.string().optional(),
});

export const PATCH = guard(["SUPER_ADMIN", "RECEPTIONIST"], async (req, ctx, { organizationId }) => {
  const { id } = await ctx.params;
  const body   = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const count = await db.lead.updateMany({
    where: { id, organizationId: organizationId ?? undefined },
    data:  parsed.data,
  });

  if (count.count === 0) return err("Lid topilmadi", 404);
  const lead = await db.lead.findUnique({
    where:   { id },
    include: { assignedTo: { select: { id: true, name: true } } },
  });
  return ok(lead);
});

export const DELETE = guard(["SUPER_ADMIN"], async (_, ctx, { organizationId }) => {
  const { id } = await ctx.params;
  await db.lead.deleteMany({ where: { id, organizationId: organizationId ?? undefined } });
  return ok({ success: true });
});
