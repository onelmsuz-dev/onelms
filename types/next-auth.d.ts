import type { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id:             string;
      name:           string;
      email?:         string;
      phone:          string;
      role:           Role;
      teacherId:      string | null;
      organizationId: string | null;
    };
  }

  interface User {
    phone:          string;
    role:           Role;
    teacherId:      string | null;
    organizationId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:             string;
    phone:          string;
    role:           Role;
    teacherId:      string | null;
    organizationId: string | null;
  }
}
