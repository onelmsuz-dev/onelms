import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name:        z.string().min(1).optional(),
  address:     z.string().optional(),
  phone:       z.string().optional(),
  managerName: z.string().optional(),
});

export const PATCH = guard(
  ["SUPER_ADMIN"],
  async (req, ctx, { organizationId }) => {
    if (!organizationId) return err("Tashkilot topilmadi", 404);
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Ma'lumotlar noto'g'ri", 400);

    const existing = await db.branch.findFirst({ where: { id, organizationId } });
    if (!existing) return err("Filial topilmadi", 404);

    const branch = await db.branch.update({
      where: { id },
      data:  parsed.data,
      include: { _count: { select: { rooms: true } } },
    });

    return ok({ id: branch.id, name: branch.name, address: branch.address, phone: branch.phone, roomCount: branch._count.rooms, studentCount: 0, status: "active" });
  },
);

export const DELETE = guard(
  ["SUPER_ADMIN"],
  async (_req, ctx, { organizationId }) => {
    if (!organizationId) return err("Tashkilot topilmadi", 404);
    const { id } = await ctx.params;

    const existing = await db.branch.findFirst({ where: { id, organizationId } });
    if (!existing) return err("Filial topilmadi", 404);

    await db.branch.delete({ where: { id } });
    return ok({ success: true });
  },
);
