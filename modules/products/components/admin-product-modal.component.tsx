"use client";

/**
 * modules/products/components/admin-product-modal.component.tsx
 * Admin create/edit product modal dialog with light theme and test contracts.
 * Strictly under 200 lines.
 */

import React from "react";
import ImageUpload from "@/components/ImageUpload";
import { Package, X, AlertCircle, Loader } from "lucide-react";
import type {
  ProductDTO,
  CategoryRef,
  UseCaseRef,
  CreateProductInput,
} from "../products.types";
import { useAdminProductForm } from "./use-admin-product-form.hook";
import { AdminProductBasicFields } from "./admin-product-basic-fields.component";
import { AdminProductUseCasesSelector } from "./admin-product-usecases-selector.component";
import { AdminProductSpecsEditor } from "./admin-product-specs-editor.component";

export interface AdminProductModalProps {
  isOpen: boolean;
  editingProduct: ProductDTO | null;
  categories: CategoryRef[];
  useCases: UseCaseRef[];
  saving: boolean;
  modalError: string | null;
  onClose: () => void;
  onSave: (payload: CreateProductInput) => Promise<void>;
}

export function AdminProductModal({
  isOpen,
  editingProduct,
  categories,
  useCases,
  saving,
  modalError,
  onClose,
  onSave,
}: AdminProductModalProps) {
  const {
    formData,
    setFormData,
    specRows,
    localError,
    handleNameChange,
    handleSpecChange,
    addSpecRow,
    removeSpecRow,
    toggleUseCase,
    preparePayload,
  } = useAdminProductForm(isOpen, editingProduct, categories);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = preparePayload();
    if (payload) {
      await onSave(payload);
    }
  };

  const displayError = localError || modalError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-red-600" />
            <span>{editingProduct ? "Edit Product" : "New Industrial Product"}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AdminProductBasicFields
            name={formData.name}
            slug={formData.slug}
            categoryId={formData.categoryId}
            shortDesc={formData.shortDesc}
            description={formData.description}
            categories={categories}
            onNameChange={handleNameChange}
            onSlugChange={(slug) => setFormData((prev) => ({ ...prev, slug }))}
            onCategoryChange={(categoryId) =>
              onFormDataChange(categoryId, "categoryId")
            }
            onShortDescChange={(shortDesc) =>
              onFormDataChange(shortDesc, "shortDesc")
            }
            onDescriptionChange={(description) =>
              onFormDataChange(description, "description")
            }
          />

          <AdminProductUseCasesSelector
            useCases={useCases}
            selectedUseCaseIds={formData.selectedUseCaseIds}
            onToggleUseCase={toggleUseCase}
          />

          <ImageUpload
            label="Primary Product Image (Cloudflare R2)"
            value={formData.imageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            folder="products"
          />

          <AdminProductSpecsEditor
            specRows={specRows}
            onAddRow={addSpecRow}
            onRemoveRow={removeSpecRow}
            onChangeRow={handleSpecChange}
          />

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {saving && <Loader className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingProduct ? "Update Product" : "Publish Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  function onFormDataChange(value: string, field: "categoryId" | "shortDesc" | "description") {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }
}
