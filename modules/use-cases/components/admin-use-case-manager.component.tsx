"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layers, Plus, Search, AlertCircle } from "lucide-react";
import type { UseCaseDTO, CreateUseCaseInput } from "../use-cases.types";
import { filterUseCasesBySearch } from "../use-cases.lib";
import { AdminUseCaseTable } from "./admin-use-case-table.component";
import { AdminUseCaseModal } from "./admin-use-case-modal.component";
import { AdminUseCaseDeleteModal } from "./admin-use-case-delete-modal.component";

export function AdminUseCaseManager() {
  const [useCases, setUseCases] = useState<UseCaseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUseCase, setEditingUseCase] = useState<UseCaseDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UseCaseDTO | null>(null);

  const fetchUseCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/use-cases");
      if (!res.ok) throw new Error("Failed to load use cases");
      const data = await res.json();
      setUseCases(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching use cases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUseCases();
  }, [fetchUseCases]);

  const openCreateModal = () => {
    setEditingUseCase(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (uc: UseCaseDTO) => {
    setEditingUseCase(uc);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: CreateUseCaseInput) => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setModalError("Title and description are required");
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      const url = editingUseCase ? `/api/admin/use-cases/${editingUseCase.id}` : "/api/admin/use-cases";
      const res = await fetch(url, {
        method: editingUseCase ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save use case");
      setIsModalOpen(false);
      await fetchUseCases();
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
      const res = await fetch(`/api/admin/use-cases/${deleteConfirm.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete use case");
      }
      setDeleteConfirm(null);
      await fetchUseCases();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUseCases = filterUseCasesBySearch(useCases, search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-600 uppercase tracking-wider mb-1 font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Industrial Applications</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">
            Use-Case Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure target industries (Automotive, HVAC, Electronics, Construction) and product associations.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Use-Case</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search use cases by title, slug, or application..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>
        <div className="text-xs text-gray-500">
          Showing <strong>{filteredUseCases.length}</strong> use cases
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <AdminUseCaseTable
        useCases={filteredUseCases}
        loading={loading}
        onEdit={openEditModal}
        onDelete={(uc) => setDeleteConfirm(uc)}
      />

      <AdminUseCaseModal
        isOpen={isModalOpen}
        editingUseCase={editingUseCase}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        saving={saving}
        error={modalError}
      />

      <AdminUseCaseDeleteModal
        useCase={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        deleting={Boolean(deletingId)}
      />
    </div>
  );
}
