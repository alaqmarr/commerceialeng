"use server";

/**
 * modules/categories/category.actions.ts
 * Server actions for managing Categories with path cache revalidation.
 * Strictly under 200 lines.
 */

import { revalidatePath } from "next/cache";
import {
  getCategoriesQuery,
  getCategoryByIdOrSlugQuery,
  createCategoryQuery,
  updateCategoryQuery,
  deleteCategoryQuery,
} from "./queries";
import { validateCategoryInput } from "./categories.lib";
import type {
  CategoryDTO,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryActionResult,
} from "./categories.types";

export async function getCategoriesAction(): Promise<CategoryDTO[]> {
  return getCategoriesQuery({ orderBy: "name", orderDirection: "asc" });
}

export async function createCategoryAction(
  input: CreateCategoryInput
): Promise<CategoryActionResult> {
  const validation = validateCategoryInput(input);
  if (!validation.isValid) {
    return { success: false, error: validation.error || "Invalid category data" };
  }

  try {
    const category = await createCategoryQuery(input);
    revalidatePath("/categories");
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, category };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create category";
    return { success: false, error: msg };
  }
}

export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput
): Promise<CategoryActionResult> {
  try {
    const category = await updateCategoryQuery(id, input);
    revalidatePath("/categories");
    revalidatePath(`/categories/${category.slug}`);
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, category };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update category";
    return { success: false, error: msg };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<CategoryActionResult> {
  try {
    const category = await deleteCategoryQuery(id);
    revalidatePath("/categories");
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, category };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete category";
    return { success: false, error: msg };
  }
}
