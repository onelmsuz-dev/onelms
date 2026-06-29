import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:     z.string().min(1),
  branchId: z.string().min(1),
  capacity: z.number().int().optional(),
  type:     z.string().optional(),
});

export const GET = guard(
  ["SUPER_ADMIN", "RECEPTIONIST", "ACCOUNTANT", "TEACHER"],
  async (_req, _ctx, { organizationId }) => {
    const rooms = await db.room.findMany({
      where: { organizationId: organizationId ?? undefined },
      include: { branch: { select: { name: true } } },
      orderBy: [{ branch: { name: "asc" } }, { name: "asc" }],
    });

    const result = rooms.map(r => ({
      id:         r.id,
      branchId:   r.branchId,
      branchName: r.branch.name,
      name:       r.name,
      capacity:   r.capacity,
      type:       "dars_xonasi",
      status:     "active",
    }));

    return ok(result);
  },
);

export const POST = guard(
  ["SUPER_ADMIN"],
  async (req, _ctx, { organizationId }) => {
    if (!organizationId) return err("Tashkilot topilmadi", 400);
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return err("Ma'lumotlar noto'g'ri", 400);

    const branch = await db.branch.findFirst({
      where: { id: parsed.data.branchId, organizationId },
    });
    if (!branch) return err("Filial topilmadi", 404);

    const room = await db.room.create({
      data: {
        organizationId,
        branchId: parsed.data.branchId,
        name:     parsed.data.name,
        capacity: parsed.data.capacity,
      },
      include: { branch: { select: { name: true } } },
    });

    return ok({
      id: room.id, branchId: room.branchId, branchName: room.branch.name,
      name: room.name, capacity: room.capacity, type: "dars_xonasi", status: "active",
    }, 201);
  },
);
