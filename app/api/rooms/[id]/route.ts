import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name:     z.string().min(1).optional(),
  capacity: z.number().int().optional(),
});

export const PATCH = guard(
  ["SUPER_ADMIN"],
  async (req, ctx, { organizationId }) => {
    if (!organizationId) return err("Tashkilot topilmadi", 404);
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Ma'lumotlar noto'g'ri", 400);

    const existing = await db.room.findFirst({ where: { id, organizationId } });
    if (!existing) return err("Xona topilmadi", 404);

    const room = await db.room.update({
      where: { id },
      data:  parsed.data,
      include: { branch: { select: { name: true } } },
    });

    return ok({ id: room.id, branchId: room.branchId, branchName: room.branch.name, name: room.name, capacity: room.capacity, type: "dars_xonasi", status: "active" });
  },
);

export const DELETE = guard(
  ["SUPER_ADMIN"],
  async (_req, ctx, { organizationId }) => {
    if (!organizationId) return err("Tashkilot topilmadi", 404);
    const { id } = await ctx.params;

    const existing = await db.room.findFirst({ where: { id, organizationId } });
    if (!existing) return err("Xona topilmadi", 404);

    await db.room.delete({ where: { id } });
    return ok({ success: true });
  },
);
