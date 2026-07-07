import { db } from "@/lib/db";
import { guard, ok } from "@/lib/api-guard";
import { groupBranchWhere, parseBranchId } from "@/lib/branch-filter";

export const dynamic = "force-dynamic";

const UZ_MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

export const GET = guard(
  ["SUPER_ADMIN", "ACCOUNTANT"],
  async (req, _ctx, { organizationId }) => {
    const url       = new URL(req.url);
    const count     = Math.min(Math.max(parseInt(url.searchParams.get("months") ?? "6", 10) || 6, 1), 12);
    const branchId  = parseBranchId(req);

    const now = new Date();

    const months = Array.from({ length: count }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth(), label: UZ_MONTHS[d.getMonth()] };
    });

    const orgFilter = organizationId ? { organizationId } : {};
    const paymentBranch = branchId ? { group: groupBranchWhere(branchId) } : {};

    const revenueData = await Promise.all(
      months.map(async ({ year, month, label }) => {
        const start = new Date(year, month, 1);
        const end   = new Date(year, month + 1, 1);

        const [payments, expenses] = await Promise.all([
          db.payment.aggregate({
            where: { ...orgFilter, ...paymentBranch, date: { gte: start, lt: end } },
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
          kirim:  payments._sum.amount ?? 0,
          chiqim: expenses._sum.amount ?? 0,
        };
      }),
    );

    return ok({ revenue: revenueData });
  },
);
