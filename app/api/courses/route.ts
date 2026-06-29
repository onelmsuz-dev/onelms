import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name:        z.string().min(2),
  description: z.string().optional(),
  duration:    z.string().min(1),
  price:       z.number().positive(),
  color:       z.string().optional(),
});

export const GET = guard(
  ["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"],
  async (_, _ctx, { organizationId }) => {
    const courses = await db.course.findMany({
      where: { organizationId: organizationId ?? undefined },
      include: {
        _count:  { select: { groups: true } },
        groups:  { include: { _count: { select: { students: true } } } },
      },
      orderBy: { name: "asc" },
    });

    const enriched = courses.map(c => ({
      ...c,
      studentCount: c.groups.reduce((s: number, g: any) => s + g._count.students, 0),
    }));

    return ok(enriched);
  }
);

export const POST = guard(["SUPER_ADMIN"], async (req, _, { organizationId }) => {
  if (!organizationId) return err("Organization topilmadi", 400);
  const body   = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const course = await db.course.create({ data: { ...parsed.data, organizationId } });
  return ok(course, 201);
});
