"use client";

import React, { useState, useEffect, useCallback } from "react";
import ImageUpload from "@/components/ImageUpload";
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  ArrowUpDown,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface HeroImage {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
  active: boolean;
  createdAt: string;
}

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroImage | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    order: 0,
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<HeroImage | null>(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hero");
      if (!res.ok) throw new Error("Failed to load hero slides");
      const data = await res.json();
      setSlides(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching hero slides";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const openCreateModal = () => {
    setEditingSlide(null);
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "/products",
      order: slides.length,
      active: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroImage) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || "",
      imageUrl: slide.imageUrl,
      linkUrl: slide.linkUrl || "",
      order: slide.order,
      active: slide.active,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      setModalError("Slide title and image URL are required");
      return;
    }

    setSaving(true);
    setModalError(null);

    try {
      const url = editingSlide
        ? `/api/admin/hero/${editingSlide.id}`
        : "/api/admin/hero";
      const method = editingSlide ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to save hero slide");
      }

      setIsModalOpen(false);
      fetchSlides();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setModalError(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (slide: HeroImage) => {
    try {
      const res = await fetch(`/api/admin/hero/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !slide.active }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      fetchSlides();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      alert(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);

    try {
      const res = await fetch(`/api/admin/hero/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete hero slide");
      }

      setDeleteConfirm(null);
      fetchSlides();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-600 uppercase tracking-wider mb-1 font-semibold">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Homepage Marketing</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">
            Hero Slides Carousel
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage high-impact hero carousel images, banners, and headline typography.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Slide</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Slides Grid / List */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Loading Hero Slides...
          </span>
        </div>
      ) : slides.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs">
          No hero carousel slides created yet. Add slides to populate the homepage banner.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    Order #{s.order}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      s.active
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-700"
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
                    onClick={() => toggleActive(s)}
                    className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {s.active ? "Deactivate" : "Activate"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(s)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors"
                      title="Edit Slide"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(s)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-colors"
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
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto font-sans">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>{editingSlide ? "Edit Hero Slide" : "New Hero Slide"}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Engineered Bonding & High-Temperature Sealants"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Subheading Teaser
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  placeholder="e.g. Precision adhesive tapes for automotive, electronics, and aerospace"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Call-to-Action Link
                  </label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))
                    }
                    placeholder="/products"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-red-600 font-mono text-sm focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Cloudflare R2 Image Upload */}
              <ImageUpload
                label="Slide Background Banner (Cloudflare R2) *"
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                folder="hero"
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, active: e.target.checked }))
                  }
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="active" className="text-xs text-gray-700 cursor-pointer">
                  Active (Display on Homepage Slider)
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingSlide ? "Update Slide" : "Create Slide"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg text-xs font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 font-sans"
              >
                {deletingId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Slide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
