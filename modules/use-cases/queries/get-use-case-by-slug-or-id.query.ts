/**
 * modules/use-cases/queries/get-use-case-by-slug-or-id.query.ts
 * Query to find a use-case by ID or slug, optionally including joined products and categories.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { UseCaseWithProductsDTO } from "../use-cases.types";

export async function getUseCaseBySlugOrIdQuery(
  identifier: string,
  options?: { includeProducts?: boolean }
): Promise<UseCaseWithProductsDTO | null> {
  const useCase = await prisma.useCase.findFirst({
    where: {
      OR: [{ slug: identifier }, { id: identifier }],
    },
    include: options?.includeProducts
      ? {
          products: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
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

  if (!useCase) {
    return null;
  }

  return {
    ...useCase,
    products: (useCase as any).products || [],
  } as UseCaseWithProductsDTO;
}
