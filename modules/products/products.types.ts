/**
 * modules/products/products.types.ts
 * Domain contracts, DTOs, and action input interfaces for Products.
 * Strictly under 200 lines.
 */

export interface ProductCategorySummaryDTO {
  id: string;
  name: string;
  slug: string;
}

export interface ProductUseCaseSummaryDTO {
  productId: string;
  useCaseId: string;
  useCase: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  specifications: string | null;
  imageUrl: string | null;
  galleryImages: string | null;
  categoryId: string;
  category?: ProductCategorySummaryDTO;
  useCases?: ProductUseCaseSummaryDTO[];
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface ProductSummaryDTO {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  description: string;
  imageUrl?: string | null;
  specifications?: string | null;
  category?: ProductCategorySummaryDTO | null;
}

export interface ProductWithDetailsDTO extends ProductDTO {
  category: ProductCategorySummaryDTO;
  useCases: ProductUseCaseSummaryDTO[];
}

// Backward-compatible alias
export type ProductCardData = ProductSummaryDTO;

export interface ProductCardProps {
  product: ProductSummaryDTO;
}

export interface SpecRow {
  key: string;
  value: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  categoryId: string;
  shortDesc: string;
  description: string;
  imageUrl: string;
  selectedUseCaseIds: string[];
}

export interface CategoryRef {
  id: string;
  name: string;
  slug?: string;
}

export interface UseCaseRef {
  id: string;
  title: string;
  slug?: string;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  categoryId: string;
  description: string;
  shortDesc?: string | null;
  imageUrl?: string | null;
  galleryImages?: string[] | string | null;
  specifications?: Record<string, string> | string | null;
  useCaseIds?: string[];
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  categoryId?: string;
  description?: string;
  shortDesc?: string | null;
  imageUrl?: string | null;
  galleryImages?: string[] | string | null;
  specifications?: Record<string, string> | string | null;
  useCaseIds?: string[];
}

export interface ProductValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface ProductActionResult {
  success: boolean;
  product?: ProductWithDetailsDTO;
  error?: string;
}

export interface GetProductsQueryOptions {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  useCaseId?: string;
  take?: number;
  skip?: number;
  orderBy?: "name" | "createdAt" | "updatedAt";
  orderDirection?: "asc" | "desc";
}
