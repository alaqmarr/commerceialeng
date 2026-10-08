"use client";

/**
 * modules/products/components/admin-product-table.component.tsx
 * Admin product list table with test selectors and edit/delete triggers.
 * Strictly under 200 lines.
 */

import React from "react";
import { Package, FolderTree, Edit2, Trash2, Loader } from "lucide-react";
import type { ProductDTO } from "../products.types";

export interface AdminProductTableProps {
  products: ProductDTO[];
  loading: boolean;
  onEdit: (product: ProductDTO) => void;
  onDelete: (product: ProductDTO) => void;
}

export function AdminProductTable({
  products,
  loading,
  onEdit,
  onDelete,
}: AdminProductTableProps) {
  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader className="w-7 h-7 text-red-600 animate-spin" />
        <span className="text-xs uppercase tracking-wider font-semibold">
          Loading Catalog Products...
        </span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs">
        No products found. Click &quot;Add Product&quot; to create your first industrial adhesive or sealant product.
      </div>
    );
  }

  return (
    <div
      data-testid="product-list"
      className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase text-gray-600">
            <th className="py-3 px-4">Image</th>
            <th className="py-3 px-4">Product Name & URL</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Use-Cases</th>
            <th className="py-3 px-4">Specs</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-xs">
          {products.map((p) => {
            let specCount = 0;
            if (p.specifications) {
              try {
                specCount = Object.keys(JSON.parse(p.specifications)).length;
              } catch {
                specCount = 1;
              }
            }

            return (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-gray-900">{p.name}</div>
                  <div className="text-[11px] text-red-600">/{p.slug}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] border border-gray-200">
                    <FolderTree className="w-3 h-3 text-red-600" />
                    {p.category?.name || "Uncategorized"}
                  </span>
                </td>
                <td className="py-3 px-4 max-w-xs">
                  <div className="flex flex-wrap gap-1">
                    {p.useCases && p.useCases.length > 0 ? (
                      p.useCases.map((uc) => (
                        <span
                          key={uc.useCaseId}
                          className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] border border-red-200"
                        >
                          {uc.useCase?.title || "Use Case"}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-[11px] italic">None</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-[11px] text-gray-500">
                  {specCount} attributes
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
