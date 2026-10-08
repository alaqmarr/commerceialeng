/**
 * modules/use-cases/use-cases.types.ts
 * Domain contracts, DTOs, and action input interfaces for Use Cases.
 * Strictly under 200 lines.
 */

export interface UseCaseDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  _count?: {
    products: number;
  };
}

export interface UseCaseProductItemDTO {
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

export interface ProductUseCaseRelationDTO {
  productId: string;
  useCaseId: string;
  product: UseCaseProductItemDTO;
}

export interface UseCaseWithProductsDTO extends UseCaseDTO {
  products: ProductUseCaseRelationDTO[];
}

export interface CreateUseCaseInput {
  title: string;
  slug?: string;
  description: string;
  imageUrl?: string | null;
}

export interface UpdateUseCaseInput {
  title?: string;
  slug?: string;
  description?: string;
  imageUrl?: string | null;
}

export interface UseCaseValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface UseCaseActionResult {
  success: boolean;
  useCase?: UseCaseDTO;
  error?: string;
}

export interface GetUseCasesQueryOptions {
  take?: number;
  orderBy?: "title" | "createdAt";
  orderDirection?: "asc" | "desc";
  includeProductCount?: boolean;
}
