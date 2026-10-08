/**
 * modules/categories/queries/get-category-by-id-or-slug.query.ts
 * Query to find a single category by identifier (ID or slug).
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { CategoryWithProductsDTO } from "../categories.types";

export async function getCategoryByIdOrSlugQuery(
  identifier: string,
  options?: { includeProducts?: boolean }
): Promise<CategoryWithProductsDTO | null> {
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug: identifier }, { id: identifier }],
    },
    include: options?.includeProducts
      ? {
          products: {
            include: {
              category: true,
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { products: true },
          },
        }
      : {
          _count: {
            select: { products: true },
          },
        },
  });

  if (!category) {
    return null;
  }

  return {
    ...category,
    products: (category as any).products || [],
  } as CategoryWithProductsDTO;
}
