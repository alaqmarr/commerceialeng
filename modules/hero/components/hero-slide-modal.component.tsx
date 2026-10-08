"use client";

/**
 * modules/hero/components/hero-slide-modal.component.tsx
 * Add / Edit modal dialog for Hero carousel slides with Cloudflare R2 upload.
 * Strictly under 200 lines.
 */

import React, { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import { Image as ImageIcon, X, AlertCircle, Loader } from "lucide-react";
import type { HeroSlideDTO, CreateHeroSlideInput } from "../hero.types";

interface HeroSlideModalProps {
  isOpen: boolean;
  slide: HeroSlideDTO | null;
  onClose: () => void;
  onSave: (data: CreateHeroSlideInput) => Promise<void>;
  saving: boolean;
  error: string | null;
  totalSlidesCount: number;
}

export function HeroSlideModal({
  isOpen,
  slide,
  onClose,
  onSave,
  saving,
  error,
  totalSlidesCount,
}: HeroSlideModalProps) {
  const [formData, setFormData] = useState<CreateHeroSlideInput>({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "/products",
    order: totalSlidesCount,
    active: true,
  });

  useEffect(() => {
    if (slide) {
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle || "",
        imageUrl: slide.imageUrl,
        linkUrl: slide.linkUrl || "/products",
        order: slide.order ?? 0,
        active: slide.active ?? true,
      });
    } else {
      setFormData({
        title: "",
        subtitle: "",
        imageUrl: "",
        linkUrl: "/products",
        order: totalSlidesCount,
        active: true,
      });
    }
  }, [slide, totalSlidesCount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-red-600" />
            <span>{slide ? "Edit Hero Slide" : "New Hero Slide"}</span>
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
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
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Headline Title *</label>
            <input
              type="text" required value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Engineered Bonding & High-Temperature Sealants"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Subheading Teaser</label>
            <input
              type="text" value={formData.subtitle || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="e.g. Precision adhesive tapes for automotive, electronics, and aerospace"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Call-to-Action Link</label>
              <input
                type="text" value={formData.linkUrl || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))}
                placeholder="/products"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-red-600 font-mono text-sm focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Display Order</label>
              <input
                type="number" value={formData.order ?? 0}
                onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 0 }))}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <ImageUpload
            label="Slide Background Banner (Cloudflare R2) *"
            value={formData.imageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            folder="hero"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox" id="active" checked={formData.active}
              onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="active" className="text-xs text-gray-700 cursor-pointer">
              Active (Display on Homepage Slider)
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {saving && <Loader className="w-3.5 h-3.5 animate-spin" />}
              <span>{slide ? "Update Slide" : "Create Slide"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
