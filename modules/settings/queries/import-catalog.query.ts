/**
 * modules/settings/queries/import-catalog.query.ts
 * Query endpoint to import catalog data from SQLite database file.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import os from "os";
import path from "path";

export async function importCatalogQuery(buffer: Buffer): Promise<void> {
  const tmpFilePath = path.join(os.tmpdir(), `import-${Date.now()}.db`);
  fs.writeFileSync(tmpFilePath, buffer);

  let db;
  try {
    db = await open({
      filename: tmpFilePath,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY,
    });

    const categories = (await db.all("SELECT * FROM categories")) as any[];
    const useCases = (await db.all("SELECT * FROM use_cases")) as any[];
    const products = (await db.all("SELECT * FROM products")) as any[];
    const productUseCases = (await db.all(
      "SELECT * FROM product_use_cases"
    )) as any[];

    await prisma.$transaction(async (tx) => {
      // Categories
      for (const cat of categories) {
        await tx.category.upsert({
          where: { id: cat.id },
          update: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            imageUrl: cat.imageUrl,
            createdAt: new Date(cat.createdAt),
            updatedAt: new Date(cat.updatedAt),
          },
          create: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            imageUrl: cat.imageUrl,
            createdAt: new Date(cat.createdAt),
            updatedAt: new Date(cat.updatedAt),
          },
        });
      }

      // Use Cases
      for (const uc of useCases) {
        await tx.useCase.upsert({
          where: { id: uc.id },
          update: {
            title: uc.title,
            slug: uc.slug,
            description: uc.description,
            imageUrl: uc.imageUrl,
            createdAt: new Date(uc.createdAt),
            updatedAt: new Date(uc.updatedAt),
          },
          create: {
            id: uc.id,
            title: uc.title,
            slug: uc.slug,
            description: uc.description,
            imageUrl: uc.imageUrl,
            createdAt: new Date(uc.createdAt),
            updatedAt: new Date(uc.updatedAt),
          },
        });
      }

      // Products
      for (const prod of products) {
        await tx.product.upsert({
          where: { id: prod.id },
          update: {
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            shortDesc: prod.shortDesc,
            specifications: prod.specifications,
            imageUrl: prod.imageUrl,
            galleryImages: prod.galleryImages,
            categoryId: prod.categoryId,
            createdAt: new Date(prod.createdAt),
            updatedAt: new Date(prod.updatedAt),
          },
          create: {
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            shortDesc: prod.shortDesc,
            specifications: prod.specifications,
            imageUrl: prod.imageUrl,
            galleryImages: prod.galleryImages,
            categoryId: prod.categoryId,
            createdAt: new Date(prod.createdAt),
            updatedAt: new Date(prod.updatedAt),
          },
        });
      }

      // Product Use Cases
      for (const puc of productUseCases) {
        await tx.productUseCase.upsert({
          where: {
            productId_useCaseId: {
              productId: puc.productId,
              useCaseId: puc.useCaseId,
            },
          },
          update: {},
          create: {
            productId: puc.productId,
            useCaseId: puc.useCaseId,
          },
        });
      }
    });
  } finally {
    if (db) await db.close();
    try {
      fs.unlinkSync(tmpFilePath);
    } catch (e) {}
  }
}
