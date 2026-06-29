import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:        z.string().min(1),
  address:     z.string().optional(),
  phone:       z.string().optional(),
  managerName: z.string().optional(),
});

export const GET = guard(
  ["SUPER_ADMIN", "RECEPTIONIST", "ACCOUNTANT", "TEACHER"],
  async (_req, _ctx, { organizationId }) => {
    const branches = await db.branch.findMany({
      where: { organizationId: organizationId ?? undefined },
      include: {
        _count: { select: { rooms: true, groups: true } },
      },
      orderBy: { name: "asc" },
    });

    const result = branches.map(b => ({
      id:           b.id,
      name:         b.name,
      address:      b.address,
      phone:        b.phone,
      roomCount:    b._count.rooms,
      studentCount: 0,
      status:       "active",
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

    const branch = await db.branch.create({
      data: {
        organizationId,
        name:        parsed.data.name,
        address:     parsed.data.address,
        phone:       parsed.data.phone,
      },
    });

    return ok({ id: branch.id, name: branch.name, address: branch.address, phone: branch.phone, roomCount: 0, studentCount: 0, status: "active" }, 201);
  },
);
