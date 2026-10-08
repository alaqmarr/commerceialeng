/**
 * modules/hero/queries/get-hero-slides.query.ts
 * Query to fetch hero slides with optional activeOnly filter.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { HeroSlideDTO } from "../hero.types";

export async function getHeroSlidesQuery(options?: {
  activeOnly?: boolean;
}): Promise<HeroSlideDTO[]> {
  return prisma.heroImage.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    orderBy: { order: "asc" },
  });
}
