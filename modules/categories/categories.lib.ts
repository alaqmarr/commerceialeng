/**
 * modules/categories/categories.lib.ts
 * Pure calculation, validation, slugification, and filter utilities for Categories.
 * STRICT CONSTRAINTS: ZERO DATABASE IMPORTS, ZERO REACT IMPORTS.
 * Strictly under 200 lines.
 */

import type {
  CategoryDTO,
  CreateCategoryInput,
  CategoryValidationResult,
} from "./categories.types";

/**
 * Converts a human-readable category name into a URL-safe kebab-case slug.
 */
export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Validates category creation or update input payload.
 */
export function validateCategoryInput(
  input: Partial<CreateCategoryInput>
): CategoryValidationResult {
  if (!input.name || typeof input.name !== "string" || !input.name.trim()) {
    return { isValid: false, error: "Category name is required" };
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
 * Formats product count badge label.
 */
export function formatCategoryProductCount(count: number): string {
  return `${count} Products Listed`;
}

/**
 * Filters a list of categories by case-insensitive name, slug, or description match.
 */
export function filterCategories<
  T extends { name: string; slug: string; description?: string | null }
>(categories: T[], query: string): T[] {
  if (!query || !query.trim()) {
    return categories;
  }
  const q = query.trim().toLowerCase();
  return categories.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
  );
}

/**
 * Sorts categories alphabetically by name.
 */
export function sortCategoriesByName<T extends { name: string }>(
  categories: T[],
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...categories].sort((a, b) => {
    const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    return direction === "asc" ? cmp : -cmp;
  });
}

/**
 * Sanitizes and normalizes category fields for safe presentation.
 */
export function sanitizeCategoryPayload(
  input: CreateCategoryInput
): { name: string; slug: string; description: string | null; imageUrl: string | null } {
  const name = input.name.trim();
  const slug =
    input.slug && input.slug.trim()
      ? slugifyCategoryName(input.slug)
      : slugifyCategoryName(name);
  const description = input.description?.trim() || null;
  const imageUrl = input.imageUrl?.trim() || null;

  return { name, slug, description, imageUrl };
}
