"use client";

/**
 * modules/products/components/product-catalog-view.component.tsx
 * Public interactive catalog view with search and category filtering.
 * Strictly under 200 lines.
 */

import React, { useState, useMemo } from "react";
import { Search, Layers, X } from "lucide-react";
import type { ProductSummaryDTO, ProductCategorySummaryDTO } from "../products.types";
import { filterProducts } from "../products.lib";
import { ProductCard } from "./product-card.component";

export interface ProductCatalogViewProps {
  initialProducts: ProductSummaryDTO[];
  categories: ProductCategorySummaryDTO[];
}

export function ProductCatalogView({
  initialProducts,
  categories,
}: ProductCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredProducts = useMemo(() => {
    return filterProducts(initialProducts, searchQuery, selectedCategory);
  }, [initialProducts, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
        {/* Search Input Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, substrate, or specs (e.g. VHB, Silicone)..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-9 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-lg px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
              selectedCategory === "ALL"
                ? "bg-red-600 text-white font-bold shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-lg px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-red-600 text-white font-bold shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-sans">
        <span>
          Showing {filteredProducts.length} of {initialProducts.length} products
          {selectedCategory !== "ALL" &&
            ` in "${categories.find((c) => c.slug === selectedCategory)?.name}"`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {(searchQuery || selectedCategory !== "ALL") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
            className="text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
          <Layers className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="font-sans text-base font-bold text-gray-900 uppercase">
            No Matching Products Found
          </h3>
          <p className="mt-1 text-xs text-gray-500 max-w-sm">
            Try adjusting your search query or selecting a different category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export const ProductCatalogClient = ProductCatalogView;
