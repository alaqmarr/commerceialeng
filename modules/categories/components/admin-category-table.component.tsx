"use client";

import React from "react";
import { FolderTree, Edit2, Trash2, Loader, Package } from "lucide-react";
import type { CategoryDTO } from "../categories.types";

/**
 * modules/categories/components/admin-category-table.component.tsx
 * Admin table displaying category records, product counts, and actions.
 * Strictly under 200 lines.
 */

interface AdminCategoryTableProps {
  categories: CategoryDTO[];
  loading: boolean;
  onEdit: (cat: CategoryDTO) => void;
  onDelete: (cat: CategoryDTO) => void;
}

export function AdminCategoryTable({
  categories,
  loading,
  onEdit,
  onDelete,
}: AdminCategoryTableProps) {
  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader className="w-7 h-7 text-red-600 animate-spin" />
        <span className="text-xs uppercase tracking-wider font-semibold">
          Loading Categories...
        </span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs">
        No categories found. Click &quot;Add Category&quot; to initialize your first taxonomy record.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase text-gray-600">
            <th className="py-3 px-4">Image</th>
            <th className="py-3 px-4">Category Name & Slug</th>
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4 text-center">Products</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-xs">
          {categories.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderTree className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="font-semibold text-gray-900">{c.name}</div>
                <div className="text-[11px] text-red-600">/{c.slug}</div>
              </td>
              <td className="py-3 px-4 max-w-xs text-gray-600 truncate">
                {c.description || <span className="text-gray-400 italic">None</span>}
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] border border-gray-200">
                  <Package className="w-3 h-3 text-red-600" />
                  {c._count?.products ?? 0}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(c)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
