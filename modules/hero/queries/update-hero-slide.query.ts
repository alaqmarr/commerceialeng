/**
 * modules/hero/queries/update-hero-slide.query.ts
 * Query to update an existing hero slide.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { UpdateHeroSlideInput, HeroSlideDTO } from "../hero.types";

export async function updateHeroSlideQuery(
  id: string,
  data: UpdateHeroSlideInput
): Promise<HeroSlideDTO> {
  return prisma.heroImage.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.subtitle !== undefined && {
        subtitle: data.subtitle?.trim() || null,
      }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl.trim() }),
      ...(data.linkUrl !== undefined && {
        linkUrl: data.linkUrl?.trim() || null,
      }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.active !== undefined && { active: data.active }),
    },
  });
}
