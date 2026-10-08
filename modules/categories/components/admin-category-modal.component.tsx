"use client";

import React, { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import { FolderTree, X, AlertCircle, Loader } from "lucide-react";
import type { CategoryDTO, CreateCategoryInput } from "../categories.types";
import { slugifyCategoryName } from "../categories.lib";

/**
 * modules/categories/components/admin-category-modal.component.tsx
 * Admin modal dialog for creating or updating a category.
 * Strictly under 200 lines.
 */

interface AdminCategoryModalProps {
  isOpen: boolean;
  editingCategory: CategoryDTO | null;
  onClose: () => void;
  onSave: (data: CreateCategoryInput) => Promise<void>;
  saving: boolean;
  error: string | null;
}

export function AdminCategoryModal({
  isOpen,
  editingCategory,
  onClose,
  onSave,
  saving,
  error,
}: AdminCategoryModalProps) {
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description || "",
        imageUrl: editingCategory.imageUrl || "",
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
      });
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !editingCategory ? slugifyCategoryName(val) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-red-600" />
            <span>{editingCategory ? "Edit Category" : "New Category"}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Industrial Adhesive Tapes"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Slug (URL Path) *
            </label>
            <input
              type="text"
              name="slug"
              required
              value={formData.slug || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  slug: slugifyCategoryName(e.target.value),
                }))
              }
              placeholder="e.g. industrial-adhesive-tapes"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-red-600 font-mono text-sm focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief overview of this industrial category..."
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600 resize-none"
            />
          </div>

          {/* Cloudflare R2 Image Upload */}
          <ImageUpload
            label="Category Cover Image (Cloudflare R2)"
            value={formData.imageUrl || ""}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            folder="categories"
          />

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
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
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {saving && <Loader className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingCategory ? "Update Category" : "Create Category"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
