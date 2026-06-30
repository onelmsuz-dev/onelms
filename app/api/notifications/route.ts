import { db } from "@/lib/db";
import { guard, ok } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export const GET = guard(
  ["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"],
  async (_, __, { organizationId }) => {
    if (!organizationId) return ok({ items: [], unread: 0 });

    const items = await db.notification.findMany({
      where:   { organizationId },
      orderBy: { createdAt: "desc" },
      take:    30,
    });

    const unread = items.filter(n => !n.isRead).length;
    return ok({ items, unread });
  },
);

export const PATCH = guard(
  ["SUPER_ADMIN", "TEACHER", "RECEPTIONIST", "ACCOUNTANT"],
  async (_, __, { organizationId }) => {
    if (!organizationId) return ok({});
    await db.notification.updateMany({
      where: { organizationId, isRead: false },
      data:  { isRead: true },
    });
    return ok({ ok: true });
  },
);
