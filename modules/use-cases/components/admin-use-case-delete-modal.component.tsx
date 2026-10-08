"use client";

import React from "react";
import { AlertCircle, Loader } from "lucide-react";
import type { UseCaseDTO } from "../use-cases.types";

/**
 * modules/use-cases/components/admin-use-case-delete-modal.component.tsx
 * Admin confirmation dialog for deleting a use case.
 * Strictly under 200 lines.
 */

interface AdminUseCaseDeleteModalProps {
  useCase: UseCaseDTO | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}

export function AdminUseCaseDeleteModal({
  useCase,
  onClose,
  onConfirm,
  deleting,
}: AdminUseCaseDeleteModalProps) {
  if (!useCase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span>Confirm Use-Case Deletion</span>
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Are you sure you want to delete application <strong>&quot;{useCase.title}&quot;</strong>?
          Associated products will simply have this use-case tag unlinked.
        </p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {deleting && <Loader className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete Use-Case</span>
          </button>
        </div>
      </div>
    </div>
  );
}
