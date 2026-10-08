/**
 * modules/hero/queries/get-hero-slide-by-id.query.ts
 * Query to fetch a single hero slide by ID.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { HeroSlideDTO } from "../hero.types";

export async function getHeroSlideByIdQuery(id: string): Promise<HeroSlideDTO | null> {
  return prisma.heroImage.findUnique({
    where: { id },
  });
}
