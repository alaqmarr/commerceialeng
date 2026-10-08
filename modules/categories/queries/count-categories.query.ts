/**
 * modules/categories/queries/count-categories.query.ts
 * Query to count the total number of categories.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";

export async function countCategoriesQuery(): Promise<number> {
  return prisma.category.count();
}
