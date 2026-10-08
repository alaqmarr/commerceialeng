"use client";

/**
 * modules/hero/components/admin-hero-manager.component.tsx
 * Admin container managing hero carousel state, modal dialogs, and deletion.
 * Strictly under 200 lines.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Image as ImageIcon, Plus, Loader, AlertCircle } from "lucide-react";
import type { HeroSlideDTO, CreateHeroSlideInput } from "../hero.types";
import { HeroSlideTable } from "./hero-slide-table.component";
import { HeroSlideModal } from "./hero-slide-modal.component";

export function AdminHeroManager() {
  const [slides, setSlides] = useState<HeroSlideDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<HeroSlideDTO | null>(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hero");
      if (!res.ok) throw new Error("Failed to load hero slides");
      const data = await res.json();
      setSlides(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching hero slides");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleSave = async (formData: CreateHeroSlideInput) => {
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      setModalError("Slide title and image URL are required");
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      const url = editingSlide ? `/api/admin/hero/${editingSlide.id}` : "/api/admin/hero";
      const method = editingSlide ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save hero slide");
      setIsModalOpen(false);
      fetchSlides();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (slide: HeroSlideDTO) => {
    try {
      const res = await fetch(`/api/admin/hero/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !slide.active }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      fetchSlides();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    try {
      const res = await fetch(`/api/admin/hero/${deleteConfirm.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete hero slide");
      setDeleteConfirm(null);
      fetchSlides();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-600 uppercase tracking-wider mb-1 font-semibold">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Homepage Marketing</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">
            Hero Slides Carousel
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage high-impact hero carousel images, banners, and headline typography.</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditingSlide(null); setModalError(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Slide</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader className="w-7 h-7 text-red-600 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">Loading Hero Slides...</span>
        </div>
      ) : (
        <HeroSlideTable
          slides={slides}
          onEdit={(s: HeroSlideDTO) => { setEditingSlide(s); setModalError(null); setIsModalOpen(true); }}
          onDelete={(s: HeroSlideDTO) => setDeleteConfirm(s)}
          onToggleActive={toggleActive}
        />
      )}

      <HeroSlideModal
        isOpen={isModalOpen} slide={editingSlide} onClose={() => setIsModalOpen(false)}
        onSave={handleSave} saving={saving} error={modalError} totalSlidesCount={slides.length}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 font-sans mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Confirm Slide Deletion</span>
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to delete slide <strong>&quot;{deleteConfirm.title}&quot;</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button" onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg text-xs font-sans"
              >
                Cancel
              </button>
              <button
                type="button" onClick={handleDelete} disabled={Boolean(deletingId)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 font-sans"
              >
                {deletingId && <Loader className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Slide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
