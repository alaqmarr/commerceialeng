"use client";

/**
 * modules/products/components/admin-product-delete-modal.component.tsx
 * Admin product deletion confirmation dialog with accessible light-theme layout.
 * Strictly under 200 lines.
 */

import React from "react";
import { AlertCircle, Loader } from "lucide-react";
import type { ProductDTO } from "../products.types";

export interface AdminProductDeleteModalProps {
  product: ProductDTO | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminProductDeleteModal({
  product,
  deleting,
  onClose,
  onConfirm,
}: AdminProductDeleteModalProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-base font-bold text-gray-900 font-sans mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span>Confirm Product Deletion</span>
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Are you sure you want to delete product <strong>&quot;{product.name}&quot;</strong>?
          This will remove the item from all public listings and RFQ carts.
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
            <span>Delete Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
