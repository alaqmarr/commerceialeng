import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { Layers, ChevronRight, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug: id }, { id: id }],
    },
    select: { name: true, description: true },
  });

  if (!category) {
    return { title: 'Category Not Found | Commercial Engineering Associates' };
  }

  return {
    title: `${category.name} | Category | Commercial Engineering Associates`,
    description: category.description || `Industrial products under ${category.name}`,
  };
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { id } = await params;

  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug: id }, { id: id }],
    },
    include: {
      products: {
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="flex-1 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-sans text-gray-500">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <Link href="/categories" className="hover:text-red-600 transition-colors">
            Categories
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="text-red-600 font-bold">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-sans text-xs font-semibold text-red-600">
                <Layers className="h-3.5 w-3.5" />
                <span>CATEGORY</span>
              </div>
              <h1 className="font-sans text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-gray-900">
                {category.name}
              </h1>
            </div>

            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-xs font-sans text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Categories</span>
            </Link>
          </div>

          {category.description && (
            <p className="text-sm text-gray-700 max-w-3xl leading-relaxed">
              {category.description}
            </p>
          )}

          <div className="pt-2 text-xs font-sans text-red-600 font-medium">
            {category.products.length} Products Available
          </div>
        </div>

        {/* Products Grid */}
        {category.products.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center text-gray-600">
            <p className="font-sans text-sm">No products currently listed under this category.</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 font-sans text-xs font-semibold text-white hover:bg-red-700"
            >
              Browse Complete Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  shortDesc: p.shortDesc,
                  description: p.description,
                  imageUrl: p.imageUrl,
                  specifications: p.specifications,
                  category: {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                  },
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
