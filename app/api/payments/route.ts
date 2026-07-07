import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guard, ok, err } from "@/lib/api-guard";
import { createNotification } from "@/lib/notify";
import { groupBranchWhere, parseBranchId } from "@/lib/branch-filter";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  studentId: z.string().min(1),
  groupId:   z.string().optional(),
  amount:    z.number().positive(),
  method:    z.enum(["NAQD", "KARTA", "CLICK", "PAYME"]).default("NAQD"),
  note:      z.string().optional(),
});

export const GET = guard(["SUPER_ADMIN", "ACCOUNTANT", "RECEPTIONIST"], async (req, _, { organizationId }) => {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const month     = searchParams.get("month");
  const branchId  = parseBranchId(req);

  let dateFilter = {};
  if (month) {
    const [y, m] = month.split("-").map(Number);
    dateFilter = { date: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) } };
  }

  const payments = await db.payment.findMany({
    where: {
      organizationId: organizationId ?? undefined,
      ...(studentId ? { studentId } : {}),
      ...(branchId ? { group: groupBranchWhere(branchId) } : {}),
      ...dateFilter,
    },
    include: {
      student:    { select: { id: true, name: true } },
      group:      { select: { id: true, name: true } },
      receivedBy: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  return ok(payments);
});

export const POST = guard(["SUPER_ADMIN", "ACCOUNTANT", "RECEPTIONIST"], async (req, _, { userId, organizationId }) => {
  if (!organizationId) return err("Organization topilmadi", 400);
  const body   = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message);

  const student = await db.student.findFirst({ where: { id: parsed.data.studentId, organizationId } });
  if (!student) return err("O'quvchi topilmadi", 404);

  const payment = await db.$transaction(async (tx) => {
    const p = await tx.payment.create({
      data: { ...parsed.data, receivedById: userId, organizationId },
      include: { student: true, group: true },
    });

    await tx.student.update({
      where: { id: parsed.data.studentId },
      data:  { balance: { increment: parsed.data.amount } },
    });

    if (parsed.data.groupId) {
      const updated = await tx.student.findUnique({ where: { id: parsed.data.studentId } });
      const status  = (updated?.balance ?? 0) >= 0 ? "TOLANDI" : "QARZDOR";
      await tx.studentGroup.updateMany({
        where: { studentId: parsed.data.studentId, groupId: parsed.data.groupId },
        data:  { paymentStatus: status },
      });
    }

    return p;
  });

  const fmt = (v: number) =>
    new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS", maximumFractionDigits: 0 }).format(v);
  void createNotification(
    organizationId,
    "payment",
    "To'lov qabul qilindi",
    `${payment.student.name} — ${fmt(parsed.data.amount)}`,
  );

  return ok(payment, 201);
});
