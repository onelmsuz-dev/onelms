import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const schema = z.object({
  password: z.string().min(6),
});

export const PATCH = guard(["PLATFORM_ADMIN"], async (req, ctx) => {
  const { id } = await ctx.params;
  const body   = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return err("Foydalanuvchi topilmadi", 404);

  await db.user.update({
    where: { id },
    data:  { password: await bcrypt.hash(parsed.data.password, 12) },
  });

  return ok({ success: true });
});
