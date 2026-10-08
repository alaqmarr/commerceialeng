"use client";

/**
 * modules/products/components/admin-product-filter-toolbar.component.tsx
 * Search bar and category filter controls for admin products list.
 * Strictly under 200 lines.
 */

import React from "react";
import { Search } from "lucide-react";
import type { CategoryRef } from "../products.types";

export interface AdminProductFilterToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  categories: CategoryRef[];
  totalFiltered: number;
}

export function AdminProductFilterToolbar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalFiltered,
}: AdminProductFilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products by title, SKU, category..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
        />
      </div>

      <div className="flex items-center gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-red-600"
        >
          <option value="">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="text-xs text-gray-500 hidden sm:block">
          Showing <strong>{totalFiltered}</strong> items
        </div>
      </div>
    </div>
  );
}
