/**
 * modules/use-cases/queries/delete-use-case.query.ts
 * Query to delete an existing use-case by ID.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { UseCaseDTO } from "../use-cases.types";

export async function deleteUseCaseQuery(id: string): Promise<UseCaseDTO> {
  const existing = await prisma.useCase.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Use case not found");
  }

  const deleted = await prisma.useCase.delete({
    where: { id },
  });

  return deleted as UseCaseDTO;
}
