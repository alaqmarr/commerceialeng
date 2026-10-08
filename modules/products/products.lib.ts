/**
 * modules/products/products.lib.ts
 * Pure domain calculations, formatting, and validation logic.
 * Strictly under 200 lines.
 */

import type {
  ProductSummaryDTO,
  CreateProductInput,
  ProductValidationResult,
  SpecRow,
} from "./products.types";

export function slugifyProductName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const generateProductSlug = slugifyProductName;

export function parseProductSpecifications(
  specsJson: string | null | undefined
): Record<string, string> {
  if (!specsJson) return {};
  try {
    const parsed = JSON.parse(specsJson);
    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed).reduce<Record<string, string>>((acc, [k, v]) => {
        acc[k] = String(v);
        return acc;
      }, {});
    }
  } catch {
    return { Details: specsJson };
  }
  return {};
}

export function serializeProductSpecifications(
  specs: Record<string, string> | string | null | undefined
): string | null {
  if (!specs) return null;
  if (typeof specs === "string") return specs.trim() || null;
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(specs)) {
    if (k.trim() && v.trim()) {
      cleaned[k.trim()] = v.trim();
    }
  }
  return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : null;
}

export function parseSpecifications(json: string | null | undefined): SpecRow[] {
  if (!json) return getDefaultSpecRows();
  try {
    const obj = JSON.parse(json);
    if (typeof obj === "object" && obj !== null) {
      const rows = Object.entries(obj).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      return rows.length > 0 ? rows : getDefaultSpecRows();
    }
  } catch {
    return [{ key: "Details", value: json }];
  }
  return getDefaultSpecRows();
}

export function serializeSpecifications(rows: SpecRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const row of rows) {
    if (row.key.trim() && row.value.trim()) {
      result[row.key.trim()] = row.value.trim();
    }
  }
  return result;
}

export function getDefaultSpecRows(): SpecRow[] {
  return [
    { key: "Adhesion to Steel", value: "" },
    { key: "Tensile Strength", value: "" },
    { key: "Operating Temperature", value: "" },
    { key: "Total Thickness", value: "" },
  ];
}

export function getDefaultEngineeringSpecs(): Record<string, string> {
  return {
    "Tape Thickness": "1.1 mm (45 mil)",
    "Peel Adhesion": "35 N/25mm to Stainless Steel",
    "Dynamic Tensile Strength": "620 kPa",
    "Continuous Temperature Limit": "120°C (248°F)",
    "Intermittent Temperature Peak": "180°C (356°F)",
  };
}

export function parseGalleryImages(
  galleryJson: string | null | undefined,
  primaryImageUrl?: string | null
): string[] {
  let images: string[] = [];
  if (galleryJson) {
    try {
      const parsed = JSON.parse(galleryJson);
      if (Array.isArray(parsed)) {
        images = parsed.filter((img) => typeof img === "string" && img.trim().length > 0);
      }
    } catch {
      images = [];
    }
  }
  if (primaryImageUrl && !images.includes(primaryImageUrl)) {
    images.unshift(primaryImageUrl);
  }
  return images;
}

export function serializeGalleryImages(
  images: string[] | string | null | undefined
): string | null {
  if (!images) return null;
  if (typeof images === "string") return images.trim() || null;
  if (Array.isArray(images)) {
    const filtered = images.filter((img) => img && img.trim().length > 0);
    return filtered.length > 0 ? JSON.stringify(filtered) : null;
  }
  return null;
}

export function validateProductInput(
  input: Partial<CreateProductInput>
): ProductValidationResult {
  if (!input.name || typeof input.name !== "string" || !input.name.trim()) {
    return { isValid: false, error: "Product name is required" };
  }
  if (!input.description || typeof input.description !== "string" || !input.description.trim()) {
    return { isValid: false, error: "Product description is required" };
  }
  if (!input.categoryId || typeof input.categoryId !== "string" || !input.categoryId.trim()) {
    return { isValid: false, error: "Category selection is required" };
  }
  return { isValid: true, error: null };
}

export function filterProducts<T extends ProductSummaryDTO>(
  products: T[],
  query: string,
  categoryIdOrSlug?: string
): T[] {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    if (
      categoryIdOrSlug &&
      categoryIdOrSlug !== "ALL" &&
      p.category?.slug !== categoryIdOrSlug &&
      (p as any).categoryId !== categoryIdOrSlug
    ) {
      return false;
    }

    if (!q) return true;

    const matchesName = p.name.toLowerCase().includes(q);
    const matchesSlug = p.slug.toLowerCase().includes(q);
    const matchesDesc = p.description.toLowerCase().includes(q);
    const matchesShort = p.shortDesc?.toLowerCase().includes(q) ?? false;
    const matchesCat = p.category?.name.toLowerCase().includes(q) ?? false;
    const matchesSpecs = p.specifications?.toLowerCase().includes(q) ?? false;

    return matchesName || matchesSlug || matchesDesc || matchesShort || matchesCat || matchesSpecs;
  });
}
