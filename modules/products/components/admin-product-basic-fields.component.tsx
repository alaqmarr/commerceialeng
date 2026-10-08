"use client";

/**
 * modules/products/components/admin-product-basic-fields.component.tsx
 * Admin form fields for product title, slug, category, short description, and overview.
 * Strictly under 200 lines.
 */

import React from "react";
import type { CategoryRef } from "../products.types";

export interface AdminProductBasicFieldsProps {
  name: string;
  slug: string;
  categoryId: string;
  shortDesc: string;
  description: string;
  categories: CategoryRef[];
  onNameChange: (val: string) => void;
  onSlugChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onShortDescChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
}

export function AdminProductBasicFields({
  name,
  slug,
  categoryId,
  shortDesc,
  description,
  categories,
  onNameChange,
  onSlugChange,
  onCategoryChange,
  onShortDescChange,
  onDescriptionChange,
}: AdminProductBasicFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Title & Slug Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Product Title *
          </label>
          <input
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. CEA-8000 High-Bond Acrylic Foam Tape"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
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
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="e.g. cea-8000-acrylic-foam-tape"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-red-600 font-mono text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Category & Short Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Primary Category *
          </label>
          <select
            name="categoryId"
            required
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
          >
            <option value="" disabled>Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Short Description (Teaser)
          </label>
          <input
            type="text"
            name="shortDesc"
            value={shortDesc}
            onChange={(e) => onShortDescChange(e.target.value)}
            placeholder="e.g. Extreme shear resistance for automotive exteriors"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Detailed Engineering Overview & Specifications *
        </label>
        <textarea
          name="description"
          rows={4}
          required
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Detailed breakdown of polymer composition, adhesive chemistry, surface compatibility..."
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600 resize-none"
        />
      </div>
    </div>
  );
}
