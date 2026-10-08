"use client";

/**
 * modules/products/components/admin-product-usecases-selector.component.tsx
 * Multi-select checkbox selector for assigning industrial use cases to products.
 * Strictly under 200 lines.
 */

import React from "react";
import { Layers } from "lucide-react";
import type { UseCaseRef } from "../products.types";

export interface AdminProductUseCasesSelectorProps {
  useCases: UseCaseRef[];
  selectedUseCaseIds: string[];
  onToggleUseCase: (ucId: string) => void;
}

export function AdminProductUseCasesSelector({
  useCases,
  selectedUseCaseIds,
  onToggleUseCase,
}: AdminProductUseCasesSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-red-600" />
        <span>Target Industrial Applications & Use-Cases</span>
      </label>
      {useCases.length === 0 ? (
        <p className="text-xs text-gray-500">
          No use-cases created yet. Add them in Use-Cases tab.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
          {useCases.map((uc) => {
            const isChecked = selectedUseCaseIds.includes(uc.id);
            return (
              <label
                key={uc.id}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors border ${
                  isChecked
                    ? "bg-red-50 border-red-300 text-red-700 font-medium"
                    : "border-gray-200 text-gray-700 bg-white hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleUseCase(uc.id)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="truncate">{uc.title}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
