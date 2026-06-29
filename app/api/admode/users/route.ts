import { db } from "@/lib/db";
import { guard, ok } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export const GET = guard(["PLATFORM_ADMIN"], async (req) => {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  const q     = searchParams.get("q")?.trim();

  const users = await db.user.findMany({
    where: {
      ...(orgId ? { organizationId: orgId } : { organizationId: { not: null } }),
      ...(q ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }] } : {}),
    },
    select: {
      id: true, name: true, phone: true, email: true,
      role: true, isActive: true, organizationId: true,
      organization: { select: { id: true, name: true, subdomain: true } },
    },
    orderBy: [{ organization: { name: "asc" } }, { name: "asc" }],
    take: 100,
  });

  return ok(users);
});
