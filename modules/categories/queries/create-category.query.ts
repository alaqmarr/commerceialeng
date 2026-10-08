/**
 * modules/categories/queries/create-category.query.ts
 * Query to create a new category with uniqueness verification.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { CategoryDTO, CreateCategoryInput } from "../categories.types";
import { sanitizeCategoryPayload } from "../categories.lib";

export async function createCategoryQuery(
  data: CreateCategoryInput
): Promise<CategoryDTO> {
  const { name, slug, description, imageUrl } = sanitizeCategoryPayload(data);

  // Uniqueness check for name and slug
  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existing) {
    throw new Error(
      `Category with name "${name}" or slug "${slug}" already exists`
    );
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      imageUrl,
    },
  });

  return category as CategoryDTO;
}
