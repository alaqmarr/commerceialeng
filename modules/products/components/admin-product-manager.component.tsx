"use client";

/**
 * modules/products/components/admin-product-manager.component.tsx
 * Top-level coordinator for admin product catalog, search, and CRUD lifecycle.
 * Strictly under 200 lines.
 */

import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import type {
  ProductDTO,
  CategoryRef,
  UseCaseRef,
  CreateProductInput,
} from "../products.types";
import { filterProducts } from "../products.lib";
import { AdminProductHeader } from "./admin-product-header.component";
import { AdminProductFilterToolbar } from "./admin-product-filter-toolbar.component";
import { AdminProductTable } from "./admin-product-table.component";
import { AdminProductModal } from "./admin-product-modal.component";
import { AdminProductDeleteModal } from "./admin-product-delete-modal.component";

export function AdminProductManager() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [useCases, setUseCases] = useState<UseCaseRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ProductDTO | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes, uRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/use-cases"),
      ]);
      if (!pRes.ok || !cRes.ok || !uRes.ok) throw new Error("Failed to load catalog data");

      const [pData, cData, uData] = await Promise.all([
        pRes.json(),
        cRes.json(),
        uRes.json(),
      ]);
      setProducts(pData);
      setCategories(cData);
      setUseCases(uData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductDTO) => {
    setEditingProduct(p);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (payload: CreateProductInput) => {
    setSaving(true);
    setModalError(null);
    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save product");
      setIsModalOpen(false);
      await fetchData();
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
      const res = await fetch(`/api/admin/products/${deleteConfirm.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
      }
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = filterProducts(products, search, selectedCategoryFilter);

  return (
    <div className="space-y-6">
      <AdminProductHeader onAddProduct={openCreateModal} />
      <AdminProductFilterToolbar
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategoryFilter}
        onCategoryChange={setSelectedCategoryFilter}
        categories={categories}
        totalFiltered={filteredProducts.length}
      />
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <AdminProductTable
        products={filteredProducts}
        loading={loading}
        onEdit={openEditModal}
        onDelete={setDeleteConfirm}
      />
      <AdminProductModal
        isOpen={isModalOpen}
        editingProduct={editingProduct}
        categories={categories}
        useCases={useCases}
        saving={saving}
        modalError={modalError}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
      <AdminProductDeleteModal
        product={deleteConfirm}
        deleting={Boolean(deletingId)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
