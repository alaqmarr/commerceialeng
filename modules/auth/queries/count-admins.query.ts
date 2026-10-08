/**
 * modules/auth/queries/count-admins.query.ts
 * Query to count administrator accounts and determine setup status.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";

export async function countAdminsQuery(): Promise<number> {
  return prisma.adminUser.count();
}

export async function isSetupCompleteQuery(): Promise<boolean> {
  const count = await prisma.adminUser.count();
  return count > 0;
}
