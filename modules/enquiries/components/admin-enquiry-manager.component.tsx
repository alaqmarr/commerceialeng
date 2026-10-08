'use client';

/**
 * modules/enquiries/components/admin-enquiry-manager.component.tsx
 * Admin management orchestrator composed of hook and presentation subcomponents.
 * Strictly under 200 lines.
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAdminEnquiries } from './use-admin-enquiries.hook';
import { AdminEnquiryFilterToolbar } from './admin-enquiry-filter-toolbar.component';
import { AdminEnquiryTable } from './admin-enquiry-table.component';
import { AdminEnquiryDetailModal } from './admin-enquiry-detail-modal.component';
import { AdminEnquiryDeleteModal } from './admin-enquiry-delete-modal.component';

export function AdminEnquiryManager() {
  const {
    filteredEnquiries,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    selectedEnquiry,
    setSelectedEnquiry,
    statusUpdating,
    deleteConfirm,
    setDeleteConfirm,
    deletingId,
    updateStatus,
    handleDelete,
    handleDeleteTrigger,
  } = useAdminEnquiries();

  return (
    <div className="space-y-6">
      <AdminEnquiryFilterToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalFiltered={filteredEnquiries.length}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <AdminEnquiryTable
        enquiries={filteredEnquiries}
        loading={loading}
        onView={(e) => {
          window.location.href = `/admin/enquiries/${e.id}`;
        }}
        onDelete={setDeleteConfirm}
      />
      <AdminEnquiryDeleteModal
        enquiry={deleteConfirm}
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirmDelete={handleDelete}
        isDeleting={Boolean(deletingId)}
      />
    </div>
  );
}
