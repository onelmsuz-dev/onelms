import { db } from "@/lib/db";

export async function createNotification(
  organizationId: string,
  type: string,
  title: string,
  body: string,
) {
  try {
    await db.notification.create({
      data: { organizationId, type, title, body },
    });
  } catch {
    // non-critical — never throw on notification failure
  }
}
