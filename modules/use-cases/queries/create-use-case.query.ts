/**
 * modules/use-cases/queries/create-use-case.query.ts
 * Query to create a new use-case with title/slug collision checks.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { UseCaseDTO, CreateUseCaseInput } from "../use-cases.types";
import { sanitizeUseCasePayload } from "../use-cases.lib";

export async function createUseCaseQuery(
  data: CreateUseCaseInput
): Promise<UseCaseDTO> {
  const { title, slug, description, imageUrl } = sanitizeUseCasePayload(data);

  const existing = await prisma.useCase.findFirst({
    where: {
      OR: [{ title }, { slug }],
    },
  });

  if (existing) {
    throw new Error(
      `Use case with title "${title}" or slug "${slug}" already exists`
    );
  }

  const useCase = await prisma.useCase.create({
    data: {
      title,
      slug,
      description,
      imageUrl,
    },
  });

  return useCase as UseCaseDTO;
}
