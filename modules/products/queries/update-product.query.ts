/**
 * modules/products/queries/update-product.query.ts
 * Query to update an existing product with transaction-isolated relations.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { UpdateProductInput, ProductWithDetailsDTO } from "../products.types";
import {
  slugifyProductName,
  serializeProductSpecifications,
  serializeGalleryImages,
} from "../products.lib";

export async function updateProductQuery(
  id: string,
  input: UpdateProductInput
): Promise<ProductWithDetailsDTO> {
  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Product not found");
  }

  if (input.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: input.categoryId.trim() },
    });
    if (!categoryExists) {
      throw new Error("Selected category does not exist");
    }
  }

  let updatedSlug = existing.slug;
  if (input.slug && input.slug.trim()) {
    updatedSlug = slugifyProductName(input.slug);
  } else if (input.name && input.name.trim()) {
    updatedSlug = slugifyProductName(input.name);
  }

  if (updatedSlug !== existing.slug) {
    const conflict = await prisma.product.findUnique({
      where: { slug: updatedSlug },
    });
    if (conflict && conflict.id !== id) {
      throw new Error(`Slug "${updatedSlug}" is already in use`);
    }
  }

  let specsString: string | null | undefined = undefined;
  if (input.specifications !== undefined) {
    specsString = serializeProductSpecifications(input.specifications);
  }

  let galleryString: string | null | undefined = undefined;
  if (input.galleryImages !== undefined) {
    galleryString = serializeGalleryImages(input.galleryImages);
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (Array.isArray(input.useCaseIds)) {
      await tx.productUseCase.deleteMany({
        where: { productId: id },
      });

      if (input.useCaseIds.length > 0) {
        await tx.productUseCase.createMany({
          data: input.useCaseIds.map((uId: string) => ({
            productId: id,
            useCaseId: uId,
          })),
        });
      }
    }

    return await tx.product.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name.trim() }),
        slug: updatedSlug,
        ...(input.description !== undefined && { description: input.description.trim() }),
        ...(input.shortDesc !== undefined && { shortDesc: input.shortDesc?.trim() || null }),
        ...(specsString !== undefined && { specifications: specsString }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl?.trim() || null }),
        ...(galleryString !== undefined && { galleryImages: galleryString }),
        ...(input.categoryId && { categoryId: input.categoryId.trim() }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        useCases: {
          include: {
            useCase: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  });

  return updated as unknown as ProductWithDetailsDTO;
}
