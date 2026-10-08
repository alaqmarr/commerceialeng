/**
 * modules/categories/categories.types.ts
 * Domain contracts, DTOs, and action input interfaces for Categories.
 * Strictly under 200 lines.
 */

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  _count?: {
    products: number;
  };
}

export interface ProductSummaryDTO {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  description: string;
  imageUrl?: string | null;
  specifications?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface CategoryWithProductsDTO extends CategoryDTO {
  products: ProductSummaryDTO[];
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface CategoryValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface CategoryActionResult {
  success: boolean;
  category?: CategoryDTO;
  error?: string;
}

export interface GetCategoriesQueryOptions {
  take?: number;
  orderBy?: "name" | "createdAt";
  orderDirection?: "asc" | "desc";
  includeProductCount?: boolean;
}
