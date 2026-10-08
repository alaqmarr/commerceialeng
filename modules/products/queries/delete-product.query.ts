/**
 * modules/products/queries/delete-product.query.ts
 * Query to delete a product by CUID.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";

export async function deleteProductQuery(
  id: string
): Promise<{ success: boolean; message: string }> {
  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Product not found");
  }

  await prisma.product.delete({
    where: { id },
  });

  return { success: true, message: "Product deleted" };
}
