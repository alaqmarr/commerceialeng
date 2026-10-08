import React from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { UseCaseWithProductsDTO } from "../use-cases.types";
import { UseCaseDetailHeader } from "./use-case-detail-header.component";

/**
 * modules/use-cases/components/use-case-detail-view.component.tsx
 * Presentation component for public use-case detail view.
 * Strictly under 200 lines.
 */

interface UseCaseDetailViewProps {
  useCase: UseCaseWithProductsDTO;
}

export function UseCaseDetailView({ useCase }: UseCaseDetailViewProps) {
  const associatedProducts = (useCase.products || []).map((puc) => puc.product);

  return (
    <div className="flex-1 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <UseCaseDetailHeader
          useCase={useCase}
          productCount={associatedProducts.length}
        />
        {associatedProducts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center text-gray-600">
            <p className="font-sans text-sm">
              No products currently assigned to this application profile.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 font-sans text-xs font-semibold text-white hover:bg-red-700"
            >
              Browse Complete Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {associatedProducts.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
