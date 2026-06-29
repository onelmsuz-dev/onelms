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

    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [studentCount, groupCount, leadCount, teacherCount, monthPayments, debtorCount] =
      await Promise.all([
        db.student.count({ where: { ...orgFilter } }),
        db.group.count({ where: { status: "ACTIVE", ...orgFilter } }),
        db.lead.count({ where: { status: { in: ["YANGI", "ALOQA_QILINGAN"] }, ...orgFilter } }),
        db.teacher.count({ where: { status: "ACTIVE", ...orgFilter } }),
        db.payment.aggregate({ where: { date: { gte: monthStart }, ...orgFilter }, _sum: { amount: true } }),
        db.student.count({ where: { balance: { lt: 0 }, ...orgFilter } }),
      ]);

    return ok({
      studentCount,
      groupCount,
      leadCount,
      teacherCount,
      monthlyRevenue: monthPayments._sum.amount ?? 0,
      debtorCount,
    });
  }
);
