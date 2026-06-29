import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const generateSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM"),
});

// GET /api/teacher-salaries?month=2024-06
export const GET = guard(
  ["SUPER_ADMIN", "ACCOUNTANT"],
  async (req: NextRequest, _, { organizationId }) => {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    const where: any = {};
    if (month) where.month = month;

    const salaries = await db.teacherSalary.findMany({
      where: {
        ...where,
        teacher: { organizationId: organizationId ?? undefined },
      },
      include: {
        teacher: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { month: "desc" },
    });

    return ok(salaries);
  }
);

// POST /api/teacher-salaries — generate salaries for a given month
export const POST = guard(
  ["SUPER_ADMIN"],
  async (req: NextRequest, _, { organizationId }) => {
    if (!organizationId) return err("Organization topilmadi", 400);

    const body   = await req.json().catch(() => null);
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message);

    const { month } = parsed.data;

    // Fetch all teachers in this org
    const teachers = await db.teacher.findMany({
      where: { organizationId },
      include: {
        user:   { select: { name: true } },
        groups: { select: { id: true } },
      },
    });

    if (teachers.length === 0) return err("O'qituvchi topilmadi", 404);

    // Date range for the month
    const [year, mon] = month.split("-").map(Number);
    const startDate   = new Date(year, mon - 1, 1);
    const endDate     = new Date(year, mon, 1);

    const results = await Promise.all(
      teachers.map(async (teacher) => {
        const groupIds = teacher.groups.map((g) => g.id);

        // Sum of payments for this teacher's groups in the month
        const agg = await db.payment.aggregate({
          _sum: { amount: true },
          where: {
            groupId:       { in: groupIds },
            date:          { gte: startDate, lt: endDate },
            organizationId,
          },
        });

        const totalCollected   = agg._sum.amount ?? 0;
        const baseSalary       = teacher.salary ?? 0;
        const calculatedSalary =
          teacher.salaryType === "FIXED"
            ? baseSalary
            : totalCollected * (baseSalary / 100);

        return db.teacherSalary.upsert({
          where:  { teacherId_month: { teacherId: teacher.id, month } },
          create: { teacherId: teacher.id, month, baseSalary, totalCollected, calculatedSalary },
          update: { baseSalary, totalCollected, calculatedSalary },
          include: {
            teacher: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        });
      })
    );

    return ok(results, 201);
  }
);
