/**
 * modules/categories/queries/get-categories.query.ts
 * Query to retrieve categories with optional ordering and product count.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { CategoryDTO, GetCategoriesQueryOptions } from "../categories.types";

export async function getCategoriesQuery(
  options?: GetCategoriesQueryOptions
): Promise<CategoryDTO[]> {
  const orderByField = options?.orderBy || "name";
  const orderDirection = options?.orderDirection || "asc";

  const categories = await prisma.category.findMany({
    take: options?.take,
    include: options?.includeProductCount !== false ? {
      _count: {
        select: { products: true },
      },
    } : undefined,
    orderBy: {
      [orderByField]: orderDirection,
    },
  });

  return categories as CategoryDTO[];
}
