import React from 'react';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { ProductCatalogClient } from './ProductCatalogClient';
import { Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Product Catalog | Commercial Engineering Associates',
  description:
    'Comprehensive technical catalog of industrial adhesive tapes, structural bonding films, silicone sealants, and thermal interface materials.',
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-sans text-xs font-semibold text-red-600 mb-3">
            <Layers className="h-3.5 w-3.5" />
            <span>PRODUCTS</span>
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-gray-900">
            Product Catalog
          </h1>

          <p className="mt-2 text-sm text-gray-600 max-w-2xl leading-relaxed">
            Explore our complete range of industrial tapes, structural adhesives, silicone sealants, and specialty bonding materials.
          </p>
        </div>

        {/* Interactive Filter and Products Grid */}
        <ProductCatalogClient
          initialProducts={products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            shortDesc: p.shortDesc,
            description: p.description,
            imageUrl: p.imageUrl,
            specifications: p.specifications,
            category: p.category,
          }))}
          categories={categories}
        />
      </div>
    </div>
  );
}
