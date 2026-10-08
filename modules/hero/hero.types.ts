/**
 * modules/hero/hero.types.ts
 * Domain DTOs and contracts for the Hero Carousel domain.
 * Strictly under 200 lines.
 */

export interface HeroSlideDTO {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  order?: number;
  active?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type HeroSlide = HeroSlideDTO;

export interface CreateHeroSlideInput {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  order?: number;
  active?: boolean;
}

export interface UpdateHeroSlideInput {
  title?: string;
  subtitle?: string | null;
  imageUrl?: string;
  linkUrl?: string | null;
  order?: number;
  active?: boolean;
}

export interface HeroSlideActionResult {
  success: boolean;
  slide?: HeroSlideDTO;
  error?: string;
}

export interface HeroSlideValidationResult {
  isValid: boolean;
  error: string | null;
}
