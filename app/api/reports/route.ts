import { db } from "@/lib/db";
import { guard, ok } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

const UZ_MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

export const GET = guard(
  ["SUPER_ADMIN", "ACCOUNTANT"],
  async (_req, _ctx, { organizationId }) => {
    const now = new Date();

    // Last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth(), label: UZ_MONTHS[d.getMonth()] };
    });

    const orgFilter = organizationId ? { organizationId } : {};

    const revenueData = await Promise.all(
      months.map(async ({ year, month, label }) => {
        const start = new Date(year, month, 1);
        const end   = new Date(year, month + 1, 1);

        const [payments, expenses] = await Promise.all([
          db.payment.aggregate({
            where: { ...orgFilter, date: { gte: start, lt: end } },
            _sum: { amount: true },
          }),
          db.expense.aggregate({
            where: { ...orgFilter, date: { gte: start, lt: end } },
            _sum: { amount: true },
          }),
        ]);

        return {
          month,
          label,
          kirim:  payments._sum.amount  ?? 0,
          chiqim: expenses._sum.amount  ?? 0,
        };
      }),
    );

    return ok({ revenue: revenueData });
  },
);
