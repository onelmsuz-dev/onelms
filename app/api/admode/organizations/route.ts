import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:          z.string().min(2),
  subdomain:     z.string().min(2).regex(/^[a-z0-9-]+$/, "Faqat kichik harf, raqam va '-'"),
  plan:          z.enum(["BASIC", "PRO", "ENTERPRISE"]).default("BASIC"),
  adminName:     z.string().min(2),
  adminPhone:    z.string().min(9),
  adminEmail:    z.string().email().optional(),
  adminPassword: z.string().min(6),
});

export const POST = guard(["PLATFORM_ADMIN"], async (req: NextRequest) => {
  const body   = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { name, subdomain, plan, adminName, adminPhone, adminEmail, adminPassword } = parsed.data;

  const exists = await db.organization.findUnique({ where: { subdomain } });
  if (exists) return err("Bu subdomain band", 409);

  const org = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const newOrg = await tx.organization.create({
      data: { name, subdomain, plan, isActive: true },
    });

    const passwordHash = await hash(adminPassword, 10);

    await tx.user.create({
      data: {
        name:           adminName,
        phone:          adminPhone,
        email:          adminEmail,
        password:       passwordHash,
        role:           "SUPER_ADMIN",
        organizationId: newOrg.id,
      },
    });

    return newOrg;
  });

  return ok(org, 201);
});
