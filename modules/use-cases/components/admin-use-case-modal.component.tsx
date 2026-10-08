"use client";

import React, { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import { Layers, X, AlertCircle, Loader } from "lucide-react";
import type { UseCaseDTO, CreateUseCaseInput } from "../use-cases.types";
import { slugifyUseCaseTitle } from "../use-cases.lib";

/**
 * modules/use-cases/components/admin-use-case-modal.component.tsx
 * Admin modal dialog for creating or updating an industrial use-case.
 * Strictly under 200 lines.
 */

interface AdminUseCaseModalProps {
  isOpen: boolean;
  editingUseCase: UseCaseDTO | null;
  onClose: () => void;
  onSave: (data: CreateUseCaseInput) => Promise<void>;
  saving: boolean;
  error: string | null;
}

export function AdminUseCaseModal({
  isOpen,
  editingUseCase,
  onClose,
  onSave,
  saving,
  error,
}: AdminUseCaseModalProps) {
  const [formData, setFormData] = useState<CreateUseCaseInput>({
    title: "",
    slug: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (editingUseCase) {
      setFormData({
        title: editingUseCase.title,
        slug: editingUseCase.slug,
        description: editingUseCase.description,
        imageUrl: editingUseCase.imageUrl || "",
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        description: "",
        imageUrl: "",
      });
    }
  }, [editingUseCase, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !editingUseCase ? slugifyUseCaseTitle(val) : prev.slug,
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
            <Layers className="w-4 h-4 text-red-600" />
            <span>{editingUseCase ? "Edit Use Case" : "New Use Case"}</span>
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
              Application Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Automotive Body Shop & Assembly"
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
                  slug: slugifyUseCaseTitle(e.target.value),
                }))
              }
              placeholder="e.g. automotive-body-shop"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-red-600 font-mono text-sm focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Industrial Requirements & Description *
            </label>
            <textarea
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Explain engineering challenges and bonding/sealing requirements in this sector..."
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600 resize-none"
            />
          </div>

          {/* Cloudflare R2 Image Upload */}
          <ImageUpload
            label="Application Banner Image (Cloudflare R2)"
            value={formData.imageUrl || ""}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            folder="use-cases"
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
              <span>{editingUseCase ? "Update Use-Case" : "Create Use-Case"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
