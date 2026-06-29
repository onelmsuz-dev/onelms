import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name:    z.string().min(1).optional(),
  phone:   z.string().optional(),
  address: z.string().optional(),
});

export const GET = guard(
  ["SUPER_ADMIN", "RECEPTIONIST", "ACCOUNTANT", "TEACHER"],
  async (_req, _ctx, { organizationId }) => {
    if (!organizationId) return err("Tashkilot topilmadi", 404);
    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, subdomain: true, plan: true, isActive: true },
    });
    if (!org) return err("Tashkilot topilmadi", 404);
    return ok(org);
  },
);

export const PATCH = guard(
  ["SUPER_ADMIN"],
  async (req, _ctx, { organizationId }) => {
    if (!organizationId) return err("Tashkilot topilmadi", 404);
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err("Ma'lumotlar noto'g'ri", 400);

    const org = await db.organization.update({
      where: { id: organizationId },
      data:  { ...(parsed.data.name ? { name: parsed.data.name } : {}) },
      select: { id: true, name: true, subdomain: true, plan: true, isActive: true },
    });

    return ok(org);
  },
);
