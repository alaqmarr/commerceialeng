/**
 * modules/hero/hero.lib.ts
 * Pure business logic and calculation helpers for Hero Carousel slides.
 * ZERO DATABASE IMPORTS, ZERO REACT IMPORTS.
 * Strictly under 200 lines.
 */

import type {
  HeroSlideDTO,
  CreateHeroSlideInput,
  HeroSlideValidationResult,
} from "./hero.types";

/**
 * Static fallback slides used when no custom slides are active in the database.
 */
export const FALLBACK_HERO_SLIDES: HeroSlideDTO[] = [
  {
    id: "default-1",
    title: "High-Performance Industrial Tapes & Bonding Films",
    subtitle:
      "Engineered VHB acrylic foams, structural sealants, and precision masking solutions designed for automotive, electronics, and demanding industrial manufacturing.",
    imageUrl:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80",
    linkUrl: "/products",
    order: 0,
    active: true,
  },
  {
    id: "default-2",
    title: "Advanced Sealants & High-Temperature Silicones",
    subtitle:
      "Neutral-cure RTV sealants, polyurethane facade solutions, and EV battery module encapsulation systems built for extreme environmental durability.",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80",
    linkUrl: "/categories",
    order: 1,
    active: true,
  },
  {
    id: "default-3",
    title: "Structural Adhesives & Fastener Replacement Solutions",
    subtitle:
      "Two-part toughened epoxies, anaerobic threadlockers, and cyanoacrylates providing superior shear and peel resistance under cyclic thermal stresses.",
    imageUrl:
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1920&q=80",
    linkUrl: "/use-cases",
    order: 2,
    active: true,
  },
];

export function getFallbackHeroSlides(): HeroSlideDTO[] {
  return [...FALLBACK_HERO_SLIDES];
}

/**
 * Validates slide inputs before persistence.
 */
export function validateHeroSlideInput(
  input: Partial<CreateHeroSlideInput>
): HeroSlideValidationResult {
  if (!input.title || typeof input.title !== "string" || !input.title.trim()) {
    return { isValid: false, error: "Slide title is required" };
  }
  if (!input.imageUrl || typeof input.imageUrl !== "string" || !input.imageUrl.trim()) {
    return { isValid: false, error: "Slide image URL is required" };
  }
  return { isValid: true, error: null };
}

/**
 * Sorts hero slides by display order ascending, then by creation date ascending.
 */
export function sortHeroSlides<T extends { order?: number; createdAt?: string | Date }>(
  slides: T[]
): T[] {
  return [...slides].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    if (a.createdAt && b.createdAt) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });
}

/**
 * Filters list to return only active hero slides.
 */
export function filterActiveHeroSlides<T extends { active?: boolean }>(slides: T[]): T[] {
  return slides.filter((slide) => slide.active !== false);
}

/**
 * Formats a slide with fallback defaults for missing optional fields.
 */
export function formatHeroSlideForDisplay(slide: Partial<HeroSlideDTO>): HeroSlideDTO {
  return {
    id: slide.id || `temp-${Date.now()}`,
    title: slide.title || "Industrial Tapes & Sealants",
    subtitle: slide.subtitle ?? null,
    imageUrl: slide.imageUrl || FALLBACK_HERO_SLIDES[0].imageUrl,
    linkUrl: slide.linkUrl || "/products",
    order: slide.order ?? 0,
    active: slide.active ?? true,
    createdAt: slide.createdAt,
    updatedAt: slide.updatedAt,
  };
}

/**
 * Pure re-indexing utility for reordered slides.
 */
export function recalculateSlideOrders<T extends { id: string; order?: number }>(
  slides: T[],
  movedId: string,
  targetOrder: number
): T[] {
  const current = [...slides];
  const itemIndex = current.findIndex((s) => s.id === movedId);
  if (itemIndex === -1) return current;

  const [movedItem] = current.splice(itemIndex, 1);
  const clampedTarget = Math.max(0, Math.min(targetOrder, current.length));
  current.splice(clampedTarget, 0, movedItem);

  return current.map((slide, index) => ({
    ...slide,
    order: index,
  }));
}
