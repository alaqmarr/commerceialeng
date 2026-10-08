'use client';

/**
 * modules/enquiries/components/admin-enquiry-delete-modal.component.tsx
 * Confirmation modal for permanently deleting customer enquiries.
 * Strictly under 200 lines.
 */

import React from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import type { EnquiryDTO } from '../enquiries.types';

export interface AdminEnquiryDeleteModalProps {
  enquiry: EnquiryDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

export function AdminEnquiryDeleteModal({
  enquiry,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting,
}: AdminEnquiryDeleteModalProps) {
  if (!isOpen || !enquiry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <div className="p-2 rounded-full bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Delete Customer Enquiry?</h3>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          Are you sure you want to permanently delete the enquiry from{' '}
          <strong className="text-gray-900 font-semibold">{enquiry.name}</strong>?
          This will remove all associated line items and cannot be undone.
        </p>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirmDelete}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isDeleting && <Loader className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
}
