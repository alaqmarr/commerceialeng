import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ProductDTO } from '../products.types';
import { ProductCard } from './product-card.component';

interface FeaturedProductsSectionProps {
  products: ProductDTO[];
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  return (
    <section className="py-16 border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-red-600 font-semibold mb-1">
              <span>Featured Products</span>
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold uppercase text-gray-900 tracking-tight">
              Flagship Catalog Products
            </h2>
          </div>
          <Link
            href="/products?from=home"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
