/**
 * modules/auth/queries/get-admin-user.query.ts
 * Query to find administrator accounts by email or ID.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { AdminUserDTO } from "../auth.types";
import { sanitizeAdminUser } from "../auth.lib";

/**
 * Retrieves admin record including hashed password for NextAuth credential verification.
 */
export async function getAdminByEmailWithPasswordQuery(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });
}

/**
 * Retrieves safe admin record by ID without password hash.
 */
export async function getAdminByIdQuery(id: string): Promise<AdminUserDTO | null> {
  const user = await prisma.adminUser.findUnique({
    where: { id },
  });
  if (!user) return null;
  return sanitizeAdminUser(user);
}
