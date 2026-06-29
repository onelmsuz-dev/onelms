import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:         z.string().min(2),
  phone:        z.string().min(9),
  source:       z.string().min(1),
  course:       z.string().optional(),
  note:         z.string().optional(),
  assignedToId: z.string().optional(),
});

export const GET = guard(["SUPER_ADMIN", "RECEPTIONIST"], async (req, _, { organizationId }) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q      = searchParams.get("q") ?? "";

  const leads = await db.lead.findMany({
    where: {
      organizationId: organizationId ?? undefined,
      ...(status && status !== "barchasi" ? { status: status.toUpperCase() as any } : {}),
      ...(q ? { OR: [
        { name:  { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ]} : {}),
    },
    include: { assignedTo: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return ok(leads);
});

export const POST = guard(["SUPER_ADMIN", "RECEPTIONIST"], async (req, _, { organizationId }) => {
  if (!organizationId) return err("Organization topilmadi", 400);
  const body   = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const lead = await db.lead.create({
    data:    { ...parsed.data, organizationId },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  return ok(lead, 201);
});
