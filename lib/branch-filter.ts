import type { Prisma } from "@prisma/client";

/** Guruh filialga tegishli bo'lish shartlari */
export function groupBranchWhere(branchId: string): Prisma.GroupWhereInput {
  return {
    OR: [
      { branchId },
      { branchId: null, room: { branchId } },
    ],
  };
}

export function parseBranchId(req: Request): string | null {
  const id = new URL(req.url).searchParams.get("branchId");
  return id?.trim() || null;
}
