"use server";

/**
 * modules/products/product.actions.ts
 * Next.js Server Actions for Products domain with path revalidation.
 * Strictly under 200 lines.
 */

import { revalidatePath } from "next/cache";
import type {
  CreateProductInput,
  UpdateProductInput,
  GetProductsQueryOptions,
  ProductActionResult,
  ProductDTO,
  ProductWithDetailsDTO,
} from "./products.types";
import { validateProductInput } from "./products.lib";
import {
  getProductsQuery,
  getProductByIdOrSlugQuery,
  createProductQuery,
  updateProductQuery,
  deleteProductQuery,
} from "./queries";

export async function getProductsAction(
  options?: GetProductsQueryOptions
): Promise<ProductDTO[]> {
  return await getProductsQuery(options);
}

export async function getProductByIdOrSlugAction(
  idOrSlug: string
): Promise<ProductWithDetailsDTO | null> {
  return await getProductByIdOrSlugQuery(idOrSlug);
}

export async function createProductAction(
  input: CreateProductInput
): Promise<ProductActionResult> {
  try {
    const validation = validateProductInput(input);
    if (!validation.isValid) {
      return { success: false, error: validation.error || "Invalid input" };
    }

    const product = await createProductQuery(input);

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/categories");
    revalidatePath("/use-cases");
    revalidatePath("/");

    return { success: true, product };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create product";
    return { success: false, error: msg };
  }
}

export async function updateProductAction(
  id: string,
  input: UpdateProductInput
): Promise<ProductActionResult> {
  try {
    const product = await updateProductQuery(id, input);

    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/admin/products");
    revalidatePath("/categories");
    revalidatePath("/use-cases");
    revalidatePath("/");

    return { success: true, product };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update product";
    return { success: false, error: msg };
  }
}

export async function deleteProductAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteProductQuery(id);

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/categories");
    revalidatePath("/use-cases");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete product";
    return { success: false, error: msg };
  }
}
