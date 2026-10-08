"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FolderTree, Plus, Search, AlertCircle } from "lucide-react";
import type { CategoryDTO, CreateCategoryInput } from "../categories.types";
import { filterCategories } from "../categories.lib";
import { AdminCategoryTable } from "./admin-category-table.component";
import { AdminCategoryModal } from "./admin-category-modal.component";
import { AdminCategoryDeleteModal } from "./admin-category-delete-modal.component";

export function AdminCategoryManager() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CategoryDTO | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryDTO) => {
    setEditingCategory(cat);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: CreateCategoryInput) => {
    if (!formData.name.trim()) {
      setModalError("Category name is required");
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const res = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save category");
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    try {
      const res = await fetch(`/api/admin/categories/${deleteConfirm.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete category");
      }
      setDeleteConfirm(null);
      await fetchCategories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = filterCategories(categories, search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-600 uppercase tracking-wider mb-1 font-semibold">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Product Taxonomy</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">
            Category Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize adhesive tapes, sealants, and industrial bonding solutions.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name, slug, description..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>
        <div className="text-xs text-gray-500">
          Showing <strong>{filteredCategories.length}</strong> categories
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <AdminCategoryTable
        categories={filteredCategories}
        loading={loading}
        onEdit={openEditModal}
        onDelete={(cat) => setDeleteConfirm(cat)}
      />

      <AdminCategoryModal
        isOpen={isModalOpen}
        editingCategory={editingCategory}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        saving={saving}
        error={modalError}
      />

      <AdminCategoryDeleteModal
        category={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        deleting={Boolean(deletingId)}
      />
    </div>
  );
}
