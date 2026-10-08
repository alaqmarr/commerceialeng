/**
 * modules/use-cases/queries/count-use-cases.query.ts
 * Query to count the total number of use-cases.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";

export async function countUseCasesQuery(): Promise<number> {
  return prisma.useCase.count();
}
