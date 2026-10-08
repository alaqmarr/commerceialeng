/**
 * modules/use-cases/use-cases.lib.ts
 * Pure business logic, slugification, validation, and filter utilities for Use Cases.
 * STRICT CONSTRAINTS: ZERO DATABASE IMPORTS, ZERO REACT IMPORTS.
 * Strictly under 200 lines.
 */

import type {
  CreateUseCaseInput,
  UseCaseValidationResult,
} from "./use-cases.types";

/**
 * Converts an application title into a clean URL-friendly kebab-case slug.
 */
export function slugifyUseCaseTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Validates use-case creation or update payload.
 */
export function validateUseCaseInput(
  input: Partial<CreateUseCaseInput>
): UseCaseValidationResult {
  if (!input.title || typeof input.title !== "string" || !input.title.trim()) {
    return { isValid: false, error: "Use case title is required" };
  }

  if (
    !input.description ||
    typeof input.description !== "string" ||
    !input.description.trim()
  ) {
    return { isValid: false, error: "Use case description is required" };
  }

  if (input.slug !== undefined && typeof input.slug === "string") {
    const trimmedSlug = input.slug.trim();
    if (trimmedSlug && !/^[a-z0-9-]+$/.test(trimmedSlug)) {
      return {
        isValid: false,
        error: "Slug must contain only lowercase alphanumeric characters and hyphens",
      };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Formats engineered solutions badge label.
 */
export function formatProductCountBadge(count: number): string {
  return count === 1 ? "1 Engineered Solution" : `${count} Engineered Solutions`;
}

/**
 * Filters use cases by query matching title, slug, or description.
 */
export function filterUseCasesBySearch<
  T extends { title: string; slug: string; description: string }
>(useCases: T[], query: string): T[] {
  if (!query || !query.trim()) {
    return useCases;
  }
  const q = query.trim().toLowerCase();
  return useCases.filter(
    (u) =>
      u.title.toLowerCase().includes(q) ||
      u.slug.toLowerCase().includes(q) ||
      u.description.toLowerCase().includes(q)
  );
}

/**
 * Sorts use cases alphabetically by title.
 */
export function sortUseCasesByTitle<T extends { title: string }>(
  useCases: T[],
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...useCases].sort((a, b) => {
    const cmp = a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    return direction === "asc" ? cmp : -cmp;
  });
}

/**
 * Normalizes input fields for database persistence.
 */
export function sanitizeUseCasePayload(
  input: CreateUseCaseInput
): { title: string; slug: string; description: string; imageUrl: string | null } {
  const title = input.title.trim();
  const slug =
    input.slug && input.slug.trim()
      ? slugifyUseCaseTitle(input.slug)
      : slugifyUseCaseTitle(title);
  const description = input.description.trim();
  const imageUrl = input.imageUrl?.trim() || null;

  return { title, slug, description, imageUrl };
}
