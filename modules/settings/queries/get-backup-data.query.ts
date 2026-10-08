/**
 * modules/settings/queries/get-backup-data.query.ts
 * Query to aggregate catalog and hero snapshot for system backup.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { BackupDataDTO } from "../settings.types";

export async function getBackupDataQuery(): Promise<BackupDataDTO> {
  const [categories, useCases, products, heroImages] = await Promise.all([
    prisma.category.findMany(),
    prisma.useCase.findMany(),
    prisma.product.findMany({ include: { useCases: true } }),
    prisma.heroImage.findMany(),
  ]);

  return {
    categories,
    useCases,
    products,
    heroImages,
    exportedAt: new Date().toISOString(),
  };
}

export const getBackupData = getBackupDataQuery;
