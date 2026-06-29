import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const schema = z.object({ password: z.string().min(6) });

export const POST = guard(["PLATFORM_ADMIN"], async (req: NextRequest, ctx) => {
  const { id }  = await ctx.params;
  const body    = await req.json().catch(() => null);
  const parsed  = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const admin = await db.user.findFirst({
    where: { organizationId: id, role: "SUPER_ADMIN" },
  });
  if (!admin) return err("Bu tashkilotda Super Admin topilmadi", 404);

  await db.user.update({
    where: { id: admin.id },
    data:  { password: await bcrypt.hash(parsed.data.password, 12) },
  });

  return ok({ success: true, adminName: admin.name });
});
