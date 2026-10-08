"use client";

import React from "react";
import { AlertCircle, Loader } from "lucide-react";
import type { CategoryDTO } from "../categories.types";

/**
 * modules/categories/components/admin-category-delete-modal.component.tsx
 * Admin confirmation dialog for deleting a category with cascade notice.
 * Strictly under 200 lines.
 */

interface AdminCategoryDeleteModalProps {
  category: CategoryDTO | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}

export function AdminCategoryDeleteModal({
  category,
  onClose,
  onConfirm,
  deleting,
}: AdminCategoryDeleteModalProps) {
  if (!category) return null;

  const productCount = category._count?.products ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span>Confirm Category Deletion</span>
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Are you sure you want to delete category <strong>&quot;{category.name}&quot;</strong>?
          {productCount > 0 && (
            <span className="block mt-2 text-red-700 bg-red-50 p-2 rounded border border-red-200">
              Warning: This category contains {productCount} assigned products. Deleting this category will cascade delete them.
            </span>
          )}
        </p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg text-xs font-sans"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 font-sans disabled:opacity-50"
          >
            {deleting && <Loader className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete Immediately</span>
          </button>
        </div>
      </div>
    </div>
  );
}
