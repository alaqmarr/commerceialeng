"use client";

/**
 * modules/products/components/admin-product-header.component.tsx
 * Admin products page header with section title and Add Product action.
 * Strictly under 200 lines.
 */

import React from "react";
import { Package, Plus } from "lucide-react";

export interface AdminProductHeaderProps {
  onAddProduct: () => void;
}

export function AdminProductHeader({ onAddProduct }: AdminProductHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <div className="flex items-center gap-2 text-xs text-red-600 uppercase tracking-wider mb-1 font-semibold">
          <Package className="w-3.5 h-3.5" />
          <span>Industrial Catalog</span>
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">
          Product Management
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Full specification, category mapping, R2 image synchronization, and use-case tagging.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddProduct}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Add Product</span>
      </button>
    </div>
  );
}
