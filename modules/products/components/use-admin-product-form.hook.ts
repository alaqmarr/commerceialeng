"use client";

/**
 * modules/products/components/use-admin-product-form.hook.ts
 * Form state management hook for admin product create/edit modal.
 * Strictly under 200 lines.
 */

import { useState, useEffect } from "react";
import type {
  ProductDTO,
  ProductFormData,
  CategoryRef,
  SpecRow,
  CreateProductInput,
} from "../products.types";
import {
  generateProductSlug,
  parseSpecifications,
  serializeSpecifications,
  getDefaultSpecRows,
} from "../products.lib";

export function useAdminProductForm(
  isOpen: boolean,
  editingProduct: ProductDTO | null,
  categories: CategoryRef[]
) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    categoryId: "",
    shortDesc: "",
    description: "",
    imageUrl: "",
    selectedUseCaseIds: [],
  });
  const [specRows, setSpecRows] = useState<SpecRow[]>(getDefaultSpecRows());
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLocalError(null);
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        slug: editingProduct.slug,
        categoryId: editingProduct.categoryId,
        shortDesc: editingProduct.shortDesc || "",
        description: editingProduct.description,
        imageUrl: editingProduct.imageUrl || "",
        selectedUseCaseIds: editingProduct.useCases
          ? editingProduct.useCases.map((u) => u.useCaseId)
          : [],
      });
      setSpecRows(parseSpecifications(editingProduct.specifications));
    } else {
      setFormData({
        name: "",
        slug: "",
        categoryId: categories[0]?.id || "",
        shortDesc: "",
        description: "",
        imageUrl: "",
        selectedUseCaseIds: [],
      });
      setSpecRows(getDefaultSpecRows());
    }
  }, [isOpen, editingProduct, categories]);

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !editingProduct ? generateProductSlug(val) : prev.slug,
    }));
  };

  const handleSpecChange = (idx: number, field: "key" | "value", val: string) => {
    setSpecRows((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const addSpecRow = () => {
    setSpecRows((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeSpecRow = (idx: number) => {
    setSpecRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleUseCase = (ucId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedUseCaseIds: prev.selectedUseCaseIds.includes(ucId)
        ? prev.selectedUseCaseIds.filter((id) => id !== ucId)
        : [...prev.selectedUseCaseIds, ucId],
    }));
  };

  const preparePayload = (): CreateProductInput | null => {
    if (!formData.name.trim() || !formData.categoryId || !formData.description.trim()) {
      setLocalError("Product name, category, and description are required");
      return null;
    }
    setLocalError(null);
    return {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      categoryId: formData.categoryId,
      shortDesc: formData.shortDesc.trim() || null,
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim() || null,
      specifications: serializeSpecifications(specRows),
      useCaseIds: formData.selectedUseCaseIds,
    };
  };

  return {
    formData,
    setFormData,
    specRows,
    localError,
    handleNameChange,
    handleSpecChange,
    addSpecRow,
    removeSpecRow,
    toggleUseCase,
    preparePayload,
  };
}
