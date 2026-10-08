/**
 * modules/use-cases/queries/update-use-case.query.ts
 * Query to update an existing use-case by ID with slug conflict checks.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { UseCaseDTO, UpdateUseCaseInput } from "../use-cases.types";
import { slugifyUseCaseTitle } from "../use-cases.lib";

export async function updateUseCaseQuery(
  id: string,
  data: UpdateUseCaseInput
): Promise<UseCaseDTO> {
  const existing = await prisma.useCase.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Use case not found");
  }

  const updatedSlug = data.slug
    ? slugifyUseCaseTitle(data.slug)
    : data.title
    ? slugifyUseCaseTitle(data.title)
    : existing.slug;

  if (updatedSlug !== existing.slug) {
    const slugConflict = await prisma.useCase.findUnique({
      where: { slug: updatedSlug },
    });
    if (slugConflict && slugConflict.id !== id) {
      throw new Error(`Slug "${updatedSlug}" is already in use`);
    }
  }

  const updated = await prisma.useCase.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title.trim() }),
      slug: updatedSlug,
      description:
        data.description !== undefined
          ? data.description.trim()
          : undefined,
      imageUrl:
        data.imageUrl !== undefined ? data.imageUrl?.trim() || null : undefined,
    },
  });

  return updated as UseCaseDTO;
}
