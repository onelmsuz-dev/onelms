import { db } from "@/lib/db";
import { guard, ok } from "@/lib/api-guard";
import { groupBranchWhere, parseBranchId } from "@/lib/branch-filter";

export const dynamic = "force-dynamic";

export const GET = guard(
  ["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"],
  async (req, __, { role, teacherId, organizationId }) => {
    const branchId = parseBranchId(req);
    const orgFilter = organizationId ? { organizationId } : {};
    const groupFilter = branchId ? groupBranchWhere(branchId) : {};

    if (role === "TEACHER" && teacherId) {
      const [groups, payments] = await Promise.all([
        db.group.findMany({
          where:   { teacherId, ...orgFilter, ...(branchId ? groupFilter : {}) },
          include: { _count: { select: { students: true } } },
        }),
        db.payment.findMany({
          where:  {
            ...orgFilter,
            group: { teacherId, ...(branchId ? groupFilter : {}) },
          },
          select: { amount: true },
        }),
      ]);

      return ok({
        groups:         groups.length,
        totalStudents:  groups.reduce((s, g) => s + g._count.students, 0),
        monthlyRevenue: payments.reduce((s, p) => s + p.amount, 0),
      });
    }

    const now           = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 1);

    const studentWhere = branchId
      ? { ...orgFilter, groups: { some: { group: groupFilter } } }
      : orgFilter;

    const groupWhere = branchId
      ? { status: "ACTIVE" as const, ...orgFilter, ...groupFilter }
      : { status: "ACTIVE" as const, ...orgFilter };

    const paymentWhere = (dateFilter: object) => branchId
      ? { ...orgFilter, ...dateFilter, group: groupFilter }
      : { ...orgFilter, ...dateFilter };

    const teacherWhere = branchId
      ? { status: "ACTIVE" as const, ...orgFilter, groups: { some: groupFilter } }
      : { status: "ACTIVE" as const, ...orgFilter };

    const noLeads = { id: { in: [] as string[] } };

    const leadWhere = branchId
      ? { ...orgFilter, ...noLeads }
      : { status: { in: ["YANGI", "ALOQA_QILINGAN"] as const }, ...orgFilter };

    const prevLeadWhere = branchId
      ? { ...orgFilter, ...noLeads }
      : { status: { in: ["YANGI", "ALOQA_QILINGAN"] as const }, ...orgFilter, createdAt: { lt: thisMonthStart } };

    const [
      studentCount,
      prevStudentCount,
      groupCount,
      leadCount,
      prevLeadCount,
      teacherCount,
      monthPayments,
      prevMonthPayments,
      debtorCount,
    ] = await Promise.all([
      db.student.count({ where: studentWhere }),
      db.student.count({
        where: branchId
          ? { ...studentWhere, createdAt: { lt: thisMonthStart } }
          : { ...orgFilter, createdAt: { lt: thisMonthStart } },
      }),
      db.group.count({ where: groupWhere }),
      db.lead.count({ where: leadWhere }),
      db.lead.count({ where: prevLeadWhere }),
      db.teacher.count({ where: teacherWhere }),
      db.payment.aggregate({ where: paymentWhere({ date: { gte: thisMonthStart } }), _sum: { amount: true } }),
      db.payment.aggregate({ where: paymentWhere({ date: { gte: lastMonthStart, lt: lastMonthEnd } }), _sum: { amount: true } }),
      db.student.count({
        where: branchId
          ? { balance: { lt: 0 }, ...studentWhere }
          : { balance: { lt: 0 }, ...orgFilter },
      }),
    ]);

    const thisMonthRevenue = monthPayments._sum.amount ?? 0;
    const lastMonthRevenue = prevMonthPayments._sum.amount ?? 0;
    const newStudentsThisMonth = studentCount - prevStudentCount;

    return ok({
      studentCount,
      groupCount,
      leadCount,
      teacherCount,
      monthlyRevenue: thisMonthRevenue,
      debtorCount,
      newStudentsThisMonth,
      revenueChange: lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : null,
      newLeadsThisMonth: leadCount - prevLeadCount,
      branchId,
    });
  }
);
