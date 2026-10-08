/**
 * modules/products/queries/count-products.query.ts
 * Query to count total products, optionally filtered by category.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";

export async function countProductsQuery(categoryId?: string): Promise<number> {
  const where = categoryId ? { categoryId } : undefined;
  return await prisma.product.count({ where });
}
