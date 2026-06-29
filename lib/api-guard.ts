import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@prisma/client";

export interface AuthCtx {
  userId:         string;
  role:           Role;
  teacherId:      string | null;
  organizationId: string | null;
}

type Handler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>> },
  authCtx: AuthCtx,
) => Promise<NextResponse | Response>;

export function guard(allowedRoles: Role[] | null, handler: Handler) {
  return async (
    req:  NextRequest,
    ctx:  { params: Promise<Record<string, string>> },
  ) => {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
    }

    const role = session.user.role as Role;

    if (allowedRoles && !allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    // PLATFORM_ADMIN barcha orglarni ko'radi (organizationId = null)
    const organizationId = session.user.organizationId ?? null;

    return handler(req, ctx, {
      userId: session.user.id,
      role,
      teacherId: session.user.teacherId,
      organizationId,
    });
  };
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
