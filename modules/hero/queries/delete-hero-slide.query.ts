/**
 * modules/hero/queries/delete-hero-slide.query.ts
 * Query to delete a hero slide by ID.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";

export async function deleteHeroSlideQuery(id: string): Promise<void> {
  await prisma.heroImage.delete({
    where: { id },
  });
}
