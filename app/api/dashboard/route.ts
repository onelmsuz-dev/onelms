import { db } from "@/lib/db";
import { guard, ok } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export const GET = guard(
  ["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"],
  async (_, __, { role, teacherId, organizationId }) => {
    const orgFilter = organizationId ? { organizationId } : {};

    if (role === "TEACHER" && teacherId) {
      const [groups, payments] = await Promise.all([
        db.group.findMany({
          where:   { teacherId, ...orgFilter },
          include: { _count: { select: { students: true } } },
        }),
        db.payment.findMany({
          where:  { group: { teacherId }, ...orgFilter },
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
      db.student.count({ where: { ...orgFilter } }),
      db.student.count({ where: { ...orgFilter, createdAt: { lt: thisMonthStart } } }),
      db.group.count({ where: { status: "ACTIVE", ...orgFilter } }),
      db.lead.count({ where: { status: { in: ["YANGI", "ALOQA_QILINGAN"] }, ...orgFilter } }),
      db.lead.count({ where: { status: { in: ["YANGI", "ALOQA_QILINGAN"] }, ...orgFilter, createdAt: { lt: thisMonthStart } } }),
      db.teacher.count({ where: { status: "ACTIVE", ...orgFilter } }),
      db.payment.aggregate({ where: { date: { gte: thisMonthStart }, ...orgFilter }, _sum: { amount: true } }),
      db.payment.aggregate({ where: { date: { gte: lastMonthStart, lt: lastMonthEnd }, ...orgFilter }, _sum: { amount: true } }),
      db.student.count({ where: { balance: { lt: 0 }, ...orgFilter } }),
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
      // change indicators
      newStudentsThisMonth,
      revenueChange: lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : null,
      newLeadsThisMonth: leadCount - prevLeadCount,
    });
  }
);
