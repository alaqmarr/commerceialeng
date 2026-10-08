"use client";

/**
 * modules/products/components/admin-product-specs-editor.component.tsx
 * Admin dynamic key-value specifications builder with test-critical selector attributes.
 * Strictly under 200 lines.
 */

import React from "react";
import { Sparkles, PlusCircle, X } from "lucide-react";
import type { SpecRow } from "../products.types";

export interface AdminProductSpecsEditorProps {
  specRows: SpecRow[];
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onChangeRow: (index: number, field: "key" | "value", value: string) => void;
}

export function AdminProductSpecsEditor({
  specRows,
  onAddRow,
  onRemoveRow,
  onChangeRow,
}: AdminProductSpecsEditorProps) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>Technical Specifications Table (Key-Value Builder)</span>
        </label>
        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-semibold"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Attribute</span>
        </button>
      </div>

      <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
        {specRows.map((row, idx) => {
          const lowerKey = row.key.toLowerCase();
          const specName = lowerKey.includes("tensile")
            ? "spec_tensile"
            : lowerKey.includes("temp")
            ? "spec_temp"
            : lowerKey.includes("thick")
            ? "spec_thickness"
            : undefined;

          return (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={row.key}
                onChange={(e) => onChangeRow(idx, "key", e.target.value)}
                placeholder="Property (e.g. Tensile Strength)"
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600"
              />
              <input
                type="text"
                value={row.value}
                name={specName}
                data-spec={lowerKey}
                onChange={(e) => onChangeRow(idx, "value", e.target.value)}
                placeholder="Value (e.g. 45 N/cm, -40°C to +150°C)"
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-red-600 placeholder:text-gray-400 focus:outline-none focus:border-red-600"
              />
              <button
                type="button"
                onClick={() => onRemoveRow(idx)}
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove attribute"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
