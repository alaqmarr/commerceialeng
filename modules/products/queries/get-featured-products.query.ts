/**
 * modules/products/queries/get-featured-products.query.ts
 * Query to fetch featured showcase products for homepage or promotions.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { ProductDTO } from "../products.types";

export async function getFeaturedProductsQuery(limit = 6): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    take: limit,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products as unknown as ProductDTO[];
}
