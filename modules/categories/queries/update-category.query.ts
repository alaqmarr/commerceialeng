/**
 * modules/categories/queries/update-category.query.ts
 * Query to update an existing category by ID with slug conflict checks.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { CategoryDTO, UpdateCategoryInput } from "../categories.types";
import { slugifyCategoryName } from "../categories.lib";

export async function updateCategoryQuery(
  id: string,
  data: UpdateCategoryInput
): Promise<CategoryDTO> {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  const updatedSlug = data.slug
    ? slugifyCategoryName(data.slug)
    : data.name
    ? slugifyCategoryName(data.name)
    : existing.slug;

  if (updatedSlug !== existing.slug) {
    const slugConflict = await prisma.category.findUnique({
      where: { slug: updatedSlug },
    });
    if (slugConflict && slugConflict.id !== id) {
      throw new Error(`Slug "${updatedSlug}" is already in use`);
    }
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      slug: updatedSlug,
      description:
        data.description !== undefined
          ? data.description?.trim() || null
          : undefined,
      imageUrl:
        data.imageUrl !== undefined ? data.imageUrl?.trim() || null : undefined,
    },
  });

  return updated as CategoryDTO;
}
