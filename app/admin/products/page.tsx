"use client";

import React, { useState, useEffect, useCallback } from "react";
import ImageUpload from "@/components/ImageUpload";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  PlusCircle,
  FolderTree,
  Layers,
  Sparkles,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface UseCase {
  id: string;
  title: string;
}

interface ProductUseCase {
  productId: string;
  useCaseId: string;
  useCase: UseCase;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  specifications: string | null;
  imageUrl: string | null;
  galleryImages: string | null;
  categoryId: string;
  category: Category;
  useCases: ProductUseCase[];
  createdAt: string;
}

interface SpecRow {
  key: string;
  value: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categoryId: "",
    shortDesc: "",
    description: "",
    imageUrl: "",
    selectedUseCaseIds: [] as string[],
  });
  const [specRows, setSpecRows] = useState<SpecRow[]>([
    { key: "Adhesion to Steel", value: "" },
    { key: "Tensile Strength", value: "" },
    { key: "Operating Temperature", value: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes, uRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/use-cases"),
      ]);

      if (!pRes.ok || !cRes.ok || !uRes.ok) {
        throw new Error("Failed to load catalog data");
      }

      const [pData, cData, uData] = await Promise.all([
        pRes.json(),
        cRes.json(),
        uRes.json(),
      ]);

      setProducts(pData);
      setCategories(cData);
      setUseCases(uData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading products";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      categoryId: categories[0]?.id || "",
      shortDesc: "",
      description: "",
      imageUrl: "",
      selectedUseCaseIds: [],
    });
    setSpecRows([
      { key: "Adhesion to Steel", value: "" },
      { key: "Tensile Strength", value: "" },
      { key: "Operating Temperature", value: "" },
      { key: "Total Thickness", value: "" },
    ]);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);

    // Parse specifications JSON into array of key-value rows
    let parsedSpecs: SpecRow[] = [];
    if (p.specifications) {
      try {
        const obj = JSON.parse(p.specifications);
        parsedSpecs = Object.entries(obj).map(([key, value]) => ({
          key,
          value: String(value),
        }));
      } catch {
        parsedSpecs = [{ key: "Details", value: p.specifications }];
      }
    }
    if (parsedSpecs.length === 0) {
      parsedSpecs = [
        { key: "Adhesion to Steel", value: "" },
        { key: "Tensile Strength", value: "" },
      ];
    }

    setFormData({
      name: p.name,
      slug: p.slug,
      categoryId: p.categoryId,
      shortDesc: p.shortDesc || "",
      description: p.description,
      imageUrl: p.imageUrl || "",
      selectedUseCaseIds: p.useCases.map((uc) => uc.useCaseId),
    });
    setSpecRows(parsedSpecs);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !editingProduct
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
        : prev.slug,
    }));
  };

  const toggleUseCase = (ucId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedUseCaseIds.includes(ucId);
      return {
        ...prev,
        selectedUseCaseIds: exists
          ? prev.selectedUseCaseIds.filter((id) => id !== ucId)
          : [...prev.selectedUseCaseIds, ucId],
      };
    });
  };

  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    setSpecRows((prev) => {
      const next = [...prev];
      next[index][field] = val;
      return next;
    });
  };

  const addSpecRow = () => {
    setSpecRows((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId || !formData.description.trim()) {
      setModalError("Product name, category, and description are required");
      return;
    }

    setSaving(true);
    setModalError(null);

    // Build specs record object
    const specsRecord: Record<string, string> = {};
    specRows.forEach((row) => {
      if (row.key.trim() && row.value.trim()) {
        specsRecord[row.key.trim()] = row.value.trim();
      }
    });

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      categoryId: formData.categoryId,
      shortDesc: formData.shortDesc.trim() || null,
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim() || null,
      specifications: specsRecord,
      useCaseIds: formData.selectedUseCaseIds,
    };

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to save product");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setModalError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);

    try {
      const res = await fetch(`/api/admin/products/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
      }

      setDeleteConfirm(null);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !selectedCategoryFilter || p.categoryId === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-600 uppercase tracking-wider mb-1 font-semibold">
            <Package className="w-3.5 h-3.5" />
            <span>Industrial Catalog</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">
            Product Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Full specification, category mapping, R2 image synchronization, and use-case tagging.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, SKU, category..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-red-600"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="text-xs text-gray-500 hidden sm:block">
            Showing <strong>{filteredProducts.length}</strong> items
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Loading Catalog Products...
          </span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs">
          No products found. Click &quot;Add Product&quot; to create your first industrial adhesive or sealant product.
        </div>
      ) : (
        <div
          data-testid="product-list"
          className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase text-gray-600">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Product Name & URL</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Use-Cases</th>
                <th className="py-3 px-4">Specs</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {filteredProducts.map((p) => {
                let specCount = 0;
                if (p.specifications) {
                  try {
                    specCount = Object.keys(JSON.parse(p.specifications)).length;
                  } catch {
                    specCount = 1;
                  }
                }

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-[11px] text-red-600">/{p.slug}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] border border-gray-200">
                        <FolderTree className="w-3 h-3 text-red-600" />
                        {p.category.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {p.useCases.length > 0 ? (
                          p.useCases.map((uc) => (
                            <span
                              key={uc.useCaseId}
                              className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] border border-red-200"
                            >
                              {uc.useCase.title}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-gray-500">
                      {specCount} attributes
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(p)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto font-sans">
          <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-red-600" />
                <span>{editingProduct ? "Edit Product" : "New Industrial Product"}</span>
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

            <form onSubmit={handleSave} className="space-y-5">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
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
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
                      }))
                    }
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
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
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
                    value={formData.shortDesc}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, shortDesc: e.target.value }))
                    }
                    placeholder="e.g. Extreme shear resistance for automotive exteriors"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Use Cases Multi-Select */}
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
                      const isChecked = formData.selectedUseCaseIds.includes(uc.id);
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
                            onChange={() => toggleUseCase(uc.id)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="truncate">{uc.title}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Detailed breakdown of polymer composition, adhesive chemistry, surface compatibility..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              {/* Cloudflare R2 Image Upload */}
              <ImageUpload
                label="Primary Product Image (Cloudflare R2)"
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                folder="products"
              />

              {/* Technical Specifications Key-Value Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    <span>Technical Specifications Table (Key-Value Builder)</span>
                  </label>
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Attribute</span>
                  </button>
                </div>

                <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {specRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                        placeholder="Property (e.g. Tensile Strength)"
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600"
                      />
                      <input
                        type="text"
                        value={row.value}
                        name={
                          row.key.toLowerCase().includes("tensile")
                            ? "spec_tensile"
                            : row.key.toLowerCase().includes("temp")
                            ? "spec_temp"
                            : row.key.toLowerCase().includes("thick")
                            ? "spec_thickness"
                            : undefined
                        }
                        data-spec={row.key.toLowerCase()}
                        onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                        placeholder="Value (e.g. 45 N/cm, -40°C to +150°C)"
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-red-600 placeholder:text-gray-400 focus:outline-none focus:border-red-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove attribute"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
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
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? "Update Product" : "Publish Product"}</span>
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
              <span>Confirm Product Deletion</span>
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to delete product <strong>&quot;{deleteConfirm.name}&quot;</strong>?
              This will remove the item from all public listings and RFQ carts.
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
                <span>Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
