import { db } from "@/lib/db";
import { guard, ok } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export const GET = guard(["PLATFORM_ADMIN"], async () => {
  const [
    orgCount,
    studentCount,
    teacherCount,
    groupCount,
    leadCount,
    revenueAgg,
    expenseAgg,
    orgs,
  ] = await Promise.all([
    db.organization.count({ where: { isActive: true } }),
    db.student.count(),
    db.teacher.count(),
    db.group.count({ where: { status: "ACTIVE" } }),
    db.lead.count(),
    db.payment.aggregate({ _sum: { amount: true } }),
    db.expense.aggregate({ _sum: { amount: true } }),
    db.organization.findMany({
      where:   { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id:        true,
        name:      true,
        subdomain: true,
        plan:      true,
        isActive:  true,
        createdAt: true,
        _count: {
          select: {
            students: true,
            teachers: true,
            groups:   true,
            leads:    true,
            users:    true,
          },
        },
      },
    }),
  ]);

  // Per-org revenue
  const orgRevenues = await db.payment.groupBy({
    by:  ["organizationId"],
    _sum: { amount: true },
  });
  const revenueMap = Object.fromEntries(
    orgRevenues.map(r => [r.organizationId, r._sum.amount ?? 0])
  );

  const orgsWithRevenue = orgs.map(org => ({
    ...org,
    revenue: revenueMap[org.id] ?? 0,
  }));

  return ok({
    totals: {
      orgs:     orgCount,
      students: studentCount,
      teachers: teacherCount,
      groups:   groupCount,
      leads:    leadCount,
      revenue:  revenueAgg._sum.amount ?? 0,
      expenses: expenseAgg._sum.amount ?? 0,
    },
    orgs: orgsWithRevenue,
  });
});
