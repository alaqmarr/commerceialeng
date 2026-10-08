/**
 * modules/products/queries/create-product.query.ts
 * Query to create a new product with category check, unique slug, and relations.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { CreateProductInput, ProductWithDetailsDTO } from "../products.types";
import {
  slugifyProductName,
  serializeProductSpecifications,
  serializeGalleryImages,
} from "../products.lib";

export async function createProductQuery(
  input: CreateProductInput
): Promise<ProductWithDetailsDTO> {
  const name = input.name.trim();
  const categoryId = input.categoryId.trim();
  const description = input.description.trim();

  // Verify category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!categoryExists) {
    throw new Error("Selected category does not exist");
  }

  // Determine slug
  const targetSlug = input.slug && input.slug.trim()
    ? slugifyProductName(input.slug)
    : slugifyProductName(name);

  // Check unique slug
  const existing = await prisma.product.findUnique({
    where: { slug: targetSlug },
  });
  if (existing) {
    throw new Error(`Product with slug "${targetSlug}" already exists`);
  }

  const specsString = serializeProductSpecifications(input.specifications);
  const galleryString = serializeGalleryImages(input.galleryImages);

  const product = await prisma.product.create({
    data: {
      name,
      slug: targetSlug,
      description,
      shortDesc: input.shortDesc?.trim() || null,
      specifications: specsString,
      imageUrl: input.imageUrl?.trim() || null,
      galleryImages: galleryString,
      categoryId,
      useCases: Array.isArray(input.useCaseIds) && input.useCaseIds.length > 0
        ? {
            create: input.useCaseIds.map((uId: string) => ({
              useCase: {
                connect: { id: uId },
              },
            })),
          }
        : undefined,
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

  return product as unknown as ProductWithDetailsDTO;
}
