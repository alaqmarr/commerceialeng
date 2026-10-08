import React from "react";
import { FolderTree } from "lucide-react";
import type { CategoryDistributionMetric } from "../analytics.types";

interface CategoryDistributionProps {
  categoryDistribution: CategoryDistributionMetric[];
  isLoading?: boolean;
}

const PALETTE = [
  "#dc2626", // brand red
  "#ef4444", // red-light
  "#b91c1c", // red-dark
  "#f97316", // orange
  "#e11d48", // rose
  "#475569", // slate-600
  "#64748b", // slate-500
  "#94a3b8", // slate-400
];

export function CategoryDistribution({
  categoryDistribution,
  isLoading,
}: CategoryDistributionProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
        <div className="h-40 rounded-full bg-gray-100 max-w-[160px] mx-auto animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalItems = categoryDistribution.reduce(
    (sum, c) => sum + c.enquiryItemCount,
    0
  );

  // SVG Donut calculation constants
  const RADIUS = 36;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~226.195
  let accumulatedPercent = 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-red-50 text-red-600 border border-red-200">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Category Distribution
            </h3>
            <p className="text-[11px] text-gray-500">
              Share of line items requested across categories
            </p>
          </div>
        </div>
      </div>

      {categoryDistribution.length === 0 || totalItems === 0 ? (
        <div className="p-8 text-center text-gray-500 text-xs">
          No category enquiry data recorded yet for this period.
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Native SVG Donut Chart */}
          <div className="relative flex justify-center items-center">
            <svg
              viewBox="0 0 100 100"
              className="w-36 h-36 transform -rotate-90"
              aria-label="Category distribution donut chart"
            >
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="transparent"
                stroke="#f3f4f6"
                strokeWidth="14"
              />
              {categoryDistribution.map((cat, idx) => {
                const color = PALETTE[idx % PALETTE.length];
                const sliceLength = (cat.sharePercentage / 100) * CIRCUMFERENCE;
                const offset = -(accumulatedPercent / 100) * CIRCUMFERENCE;
                accumulatedPercent += cat.sharePercentage;

                return (
                  <circle
                    key={cat.categoryId}
                    cx="50"
                    cy="50"
                    r={RADIUS}
                    fill="transparent"
                    stroke={color}
                    strokeWidth="14"
                    strokeDasharray={`${sliceLength} ${CIRCUMFERENCE}`}
                    strokeDashoffset={offset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-gray-900">
                {totalItems}
              </span>
              <span className="text-[10px] uppercase font-semibold text-gray-500">
                Items
              </span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            {categoryDistribution.map((cat, idx) => {
              const color = PALETTE[idx % PALETTE.length];
              return (
                <div
                  key={cat.categoryId}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold text-gray-800 truncate">
                      {cat.categoryName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      ({cat.productCount} prod.)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-600 font-medium">
                      {cat.enquiryItemCount} items
                    </span>
                    <span className="font-mono text-gray-900 font-bold w-12 text-right">
                      {cat.sharePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
