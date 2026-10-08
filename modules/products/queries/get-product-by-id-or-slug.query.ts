/**
 * modules/products/queries/get-product-by-id-or-slug.query.ts
 * Query to fetch a single product by either CUID or URL slug.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { ProductWithDetailsDTO } from "../products.types";

export async function getProductByIdOrSlugQuery(
  idOrSlug: string
): Promise<ProductWithDetailsDTO | null> {
  if (!idOrSlug || typeof idOrSlug !== "string") {
    return null;
  }

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
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
  });

  return product as unknown as ProductWithDetailsDTO | null;
}
