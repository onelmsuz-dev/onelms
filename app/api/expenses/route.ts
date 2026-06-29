import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  category:    z.string().min(1),
  description: z.string().min(1),
  amount:      z.number().positive(),
  date:        z.string().optional(),
});

export const GET = guard(["SUPER_ADMIN", "ACCOUNTANT"], async (req, _, { organizationId }) => {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  let dateFilter = {};
  if (month) {
    const [y, m] = month.split("-").map(Number);
    dateFilter = { date: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) } };
  }

  const expenses = await db.expense.findMany({
    where: { organizationId: organizationId ?? undefined, ...dateFilter },
    orderBy: { date: "desc" },
  });

  return ok(expenses);
});

export const POST = guard(["SUPER_ADMIN", "ACCOUNTANT"], async (req, _, { organizationId }) => {
  if (!organizationId) return err("Organization topilmadi", 400);
  const body   = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const { date, ...rest } = parsed.data;
  const expense = await db.expense.create({
    data: { ...rest, organizationId, date: date ? new Date(date) : new Date() },
  });

  return ok(expense, 201);
});
