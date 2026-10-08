import React from "react";
import type { CategoryDTO } from "../categories.types";
import { CategoryCard } from "./category-card.component";

/**
 * modules/categories/components/category-grid.component.tsx
 * Public grid layout for displaying categories.
 * Strictly under 200 lines.
 */

interface CategoryGridProps {
  categories: CategoryDTO[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center text-gray-500 text-sm">
        No product categories found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
}
