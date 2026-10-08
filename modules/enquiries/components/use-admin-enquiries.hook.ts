'use client';

/**
 * modules/enquiries/components/use-admin-enquiries.hook.ts
 * Custom hook managing admin enquiries state, filters, mutations, and deep-linking.
 * Strictly under 200 lines.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { EnquiryDTO } from '../enquiries.types';
import { filterEnquiries } from '../enquiries.lib';

export function useAdminEnquiries() {
  const searchParams = useSearchParams();
  const directId = searchParams.get('id');

  const [enquiries, setEnquiries] = useState<EnquiryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryDTO | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<EnquiryDTO | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        statusFilter !== 'ALL'
          ? `/api/admin/enquiries?status=${statusFilter}`
          : '/api/admin/enquiries';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load customer enquiries');
      const data: EnquiryDTO[] = await res.json();
      setEnquiries(data);

      if (directId) {
        const found = data.find((e) => e.id === directId);
        if (found) setSelectedEnquiry(found);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching enquiries';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, directId]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const updateStatus = async (enquiryId: string, newStatus: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();

      setSelectedEnquiry((prev) => (prev?.id === enquiryId ? updated : prev));
      await fetchEnquiries();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating status';
      alert(msg);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    try {
      const res = await fetch(`/api/admin/enquiries/${deleteConfirm.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete enquiry');

      setDeleteConfirm(null);
      if (selectedEnquiry?.id === deleteConfirm.id) {
        setSelectedEnquiry(null);
      }
      await fetchEnquiries();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting enquiry';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteTrigger = (enquiry: EnquiryDTO) => {
    setSelectedEnquiry(null);
    setDeleteConfirm(enquiry);
  };

  const filteredEnquiries = useMemo(() => {
    return filterEnquiries(enquiries, search);
  }, [enquiries, search]);

  return {
    enquiries,
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
    fetchEnquiries,
  };
}
