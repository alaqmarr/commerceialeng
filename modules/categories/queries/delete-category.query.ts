/**
 * modules/categories/queries/delete-category.query.ts
 * Query to delete an existing category by ID.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { CategoryDTO } from "../categories.types";

export async function deleteCategoryQuery(id: string): Promise<CategoryDTO> {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  const deleted = await prisma.category.delete({
    where: { id },
  });

  return deleted as CategoryDTO;
}
