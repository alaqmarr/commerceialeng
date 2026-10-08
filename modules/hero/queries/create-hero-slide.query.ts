/**
 * modules/hero/queries/create-hero-slide.query.ts
 * Query to insert a new hero slide in the database.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { CreateHeroSlideInput, HeroSlideDTO } from "../hero.types";

export async function createHeroSlideQuery(
  data: CreateHeroSlideInput
): Promise<HeroSlideDTO> {
  return prisma.heroImage.create({
    data: {
      title: data.title.trim(),
      subtitle: data.subtitle?.trim() || null,
      imageUrl: data.imageUrl.trim(),
      linkUrl: data.linkUrl?.trim() || null,
      order: data.order ?? 0,
      active: data.active ?? true,
    },
  });
}
