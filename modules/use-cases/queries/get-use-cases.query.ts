/**
 * modules/use-cases/queries/get-use-cases.query.ts
 * Query to retrieve use-cases with product counts and configurable sorting.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { UseCaseDTO, GetUseCasesQueryOptions } from "../use-cases.types";

export async function getUseCasesQuery(
  options?: GetUseCasesQueryOptions
): Promise<UseCaseDTO[]> {
  const orderByField = options?.orderBy || "createdAt";
  const orderDirection = options?.orderDirection || "desc";

  const useCases = await prisma.useCase.findMany({
    take: options?.take,
    include:
      options?.includeProductCount !== false
        ? {
            _count: {
              select: { products: true },
            },
          }
        : undefined,
    orderBy: {
      [orderByField]: orderDirection,
    },
  });

  return useCases as UseCaseDTO[];
}
