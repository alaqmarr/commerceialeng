import React from "react";
import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import type { CategoryDTO } from "../categories.types";

/**
 * modules/categories/components/category-card.component.tsx
 * Public card component representing an individual product category.
 * Strictly under 200 lines.
 */

interface CategoryCardProps {
  category: CategoryDTO;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const productCount = category._count?.products ?? 0;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-red-500/50 hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {category.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <Layers className="h-12 w-12" />
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-red-600 backdrop-blur-sm border border-red-200 shadow-sm">
          {productCount} Products Listed
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-sans text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
            {category.name}
          </h3>
          <p className="mt-2 text-xs text-gray-600 leading-relaxed line-clamp-3">
            {category.description || "Precision industrial bonding and sealing materials."}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-sans font-semibold text-red-600">
          <span>View Category Products</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
