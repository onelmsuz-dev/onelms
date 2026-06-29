import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  plan:     z.enum(["BASIC", "PRO", "ENTERPRISE"]).optional(),
  isActive: z.boolean().optional(),
});

export const PATCH = guard(
  ["PLATFORM_ADMIN"],
  async (req: NextRequest, ctx: any) => {
    const { id }   = await ctx.params;
    const body     = await req.json().catch(() => null);
    const parsed   = updateSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const org = await db.organization.findUnique({ where: { id } });
    if (!org) return err("Organization topilmadi", 404);

    const updated = await db.organization.update({
      where: { id },
      data:  parsed.data,
    });

    return ok(updated);
  }
);

export const DELETE = guard(["PLATFORM_ADMIN"], async (_req: NextRequest, ctx: any) => {
  const { id } = await ctx.params;
  const org    = await db.organization.findUnique({ where: { id } });
  if (!org) return err("Organization topilmadi", 404);

  await db.organization.delete({ where: { id } });
  return ok({ success: true });
});
