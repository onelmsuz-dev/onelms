import { db } from "@/lib/db";
import { guard, ok } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export const GET = guard(
  ["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"],
  async (req, _, { organizationId }) => {
    const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
    if (!q || q.length < 2) return ok({ students: [], groups: [], leads: [] });

    const orgFilter = organizationId ? { organizationId } : {};

    const [students, groups, leads] = await Promise.all([
      db.student.findMany({
        where: { ...orgFilter, OR: [
          { name:  { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ]},
        select: { id: true, name: true, phone: true, isActive: true },
        take: 5,
      }),
      db.group.findMany({
        where: { ...orgFilter, name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, status: true, course: { select: { name: true } } },
        take: 4,
      }),
      db.lead.findMany({
        where: { ...orgFilter, OR: [
          { name:  { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ]},
        select: { id: true, name: true, phone: true, status: true },
        take: 4,
      }),
    ]);

    return ok({ students, groups, leads });
  },
);
