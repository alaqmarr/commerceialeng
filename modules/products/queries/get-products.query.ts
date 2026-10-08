/**
 * modules/products/queries/get-products.query.ts
 * Granular Prisma query for listing products with filtering and sorting.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { ProductDTO, GetProductsQueryOptions } from "../products.types";

export async function getProductsQuery(
  options?: GetProductsQueryOptions
): Promise<ProductDTO[]> {
  const where: any = {};

  if (options?.search && options.search.trim()) {
    const s = options.search.trim();
    where.OR = [
      { name: { contains: s } },
      { slug: { contains: s } },
      { description: { contains: s } },
      { shortDesc: { contains: s } },
    ];
  }

  if (options?.categoryId) {
    where.categoryId = options.categoryId;
  }

  if (options?.categorySlug) {
    where.category = {
      slug: options.categorySlug,
    };
  }

  if (options?.useCaseId) {
    where.useCases = {
      some: {
        useCaseId: options.useCaseId,
      },
    };
  }

  const orderByField = options?.orderBy || "createdAt";
  const orderDirection = options?.orderDirection || "desc";

  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      useCases: {
        include: {
          useCase: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
    take: options?.take,
    skip: options?.skip,
    orderBy: {
      [orderByField]: orderDirection,
    },
  });

  return products as unknown as ProductDTO[];
}
