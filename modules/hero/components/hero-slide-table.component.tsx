"use client";

/**
 * modules/hero/components/hero-slide-table.component.tsx
 * Admin grid card layout displaying existing hero carousel slides.
 * Strictly under 200 lines.
 */

import React from "react";
import { Edit2, Trash2, ExternalLink } from "lucide-react";
import type { HeroSlideDTO } from "../hero.types";

interface HeroSlideTableProps {
  slides: HeroSlideDTO[];
  onEdit: (slide: HeroSlideDTO) => void;
  onDelete: (slide: HeroSlideDTO) => void;
  onToggleActive: (slide: HeroSlideDTO) => void;
  disabled?: boolean;
}

export function HeroSlideTable({
  slides,
  onEdit,
  onDelete,
  onToggleActive,
  disabled = false,
}: HeroSlideTableProps) {
  if (slides.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs font-sans">
        No hero carousel slides created yet. Add slides to populate the homepage banner.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
      {slides.map((s) => (
        <div
          key={s.id}
          className={`rounded-2xl border bg-white overflow-hidden shadow-sm transition-all ${
            s.active ? "border-gray-200" : "border-gray-200/60 opacity-60"
          }`}
        >
          <div className="relative aspect-video w-full bg-gray-100 overflow-hidden border-b border-gray-200 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/90 backdrop-blur text-red-600 text-[11px] font-bold border border-gray-200 shadow-sm">
                Order #{s.order ?? 0}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  s.active ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {s.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-3 font-sans">
            <div>
              <h3 className="font-bold text-gray-900 text-base">{s.title}</h3>
              {s.subtitle && (
                <p className="text-xs text-gray-600 mt-1">{s.subtitle}</p>
              )}
            </div>

            {s.linkUrl && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-600">
                <ExternalLink className="w-3 h-3" />
                <span className="truncate">Links to: {s.linkUrl}</span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onToggleActive(s)}
                disabled={disabled}
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {s.active ? "Deactivate" : "Activate"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(s)}
                  disabled={disabled}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors disabled:opacity-50"
                  title="Edit Slide"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(s)}
                  disabled={disabled}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-colors disabled:opacity-50"
                  title="Delete Slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
