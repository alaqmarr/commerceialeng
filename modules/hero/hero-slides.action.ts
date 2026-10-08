"use server";

/**
 * modules/hero/hero-slides.action.ts
 * Server Actions for managing Hero Carousel slides.
 * Strictly under 200 lines.
 */

import { revalidatePath } from "next/cache";
import {
  getHeroSlidesQuery,
  createHeroSlideQuery,
  updateHeroSlideQuery,
  deleteHeroSlideQuery,
} from "./queries";
import { validateHeroSlideInput } from "./hero.lib";
import type {
  HeroSlideDTO,
  CreateHeroSlideInput,
  UpdateHeroSlideInput,
  HeroSlideActionResult,
} from "./hero.types";

export async function getHeroSlidesAction(
  activeOnly?: boolean
): Promise<HeroSlideDTO[]> {
  return getHeroSlidesQuery({ activeOnly });
}

export async function createHeroSlideAction(
  input: CreateHeroSlideInput
): Promise<HeroSlideActionResult> {
  const validation = validateHeroSlideInput(input);
  if (!validation.isValid) {
    return { success: false, error: validation.error || "Invalid input" };
  }

  try {
    const slide = await createHeroSlideQuery(input);
    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { success: true, slide };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Creation failed";
    return { success: false, error: msg };
  }
}

export async function updateHeroSlideAction(
  id: string,
  input: UpdateHeroSlideInput
): Promise<HeroSlideActionResult> {
  try {
    const slide = await updateHeroSlideQuery(id, input);
    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { success: true, slide };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return { success: false, error: msg };
  }
}

export async function toggleHeroSlideActiveAction(
  id: string,
  active: boolean
): Promise<HeroSlideActionResult> {
  return updateHeroSlideAction(id, { active });
}

export async function deleteHeroSlideAction(
  id: string
): Promise<HeroSlideActionResult> {
  try {
    await deleteHeroSlideQuery(id);
    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Deletion failed";
    return { success: false, error: msg };
  }
}
