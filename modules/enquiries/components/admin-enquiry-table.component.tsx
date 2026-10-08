'use client';

/**
 * modules/enquiries/components/admin-enquiry-table.component.tsx
 * Tabular display of enquiries with actions and status badges.
 * Strictly under 200 lines.
 */

import React from 'react';
import { Mail, Phone, Building, Clock, Package, Eye, Trash2, Loader } from 'lucide-react';
import type { EnquiryDTO } from '../enquiries.types';
import { formatEnquiryDate } from '../enquiries.lib';
import { AdminEnquiryStatusBadge } from './admin-enquiry-status-badge.component';

export interface AdminEnquiryTableProps {
  enquiries: EnquiryDTO[];
  loading: boolean;
  onView: (enquiry: EnquiryDTO) => void;
  onDelete: (enquiry: EnquiryDTO) => void;
}

export function AdminEnquiryTable({
  enquiries,
  loading,
  onView,
  onDelete,
}: AdminEnquiryTableProps) {
  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
        <Loader className="w-7 h-7 text-red-600 animate-spin" />
        <span className="text-xs uppercase tracking-wider font-semibold">
          Loading Customer Enquiries...
        </span>
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs font-sans">
        No enquiries found matching filter criteria.
      </div>
    );
  }

  return (
    <div
      data-testid="enquiry-list"
      className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
    >
      <table className="w-full text-left border-collapse" data-testid="enquiry-list-table">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase text-gray-600 font-sans">
            <th className="py-3 px-4">Client & Company</th>
            <th className="py-3 px-4">Contact Coordinates</th>
            <th className="py-3 px-4">Cart Items</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-xs font-sans">
          {enquiries.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3.5 px-4">
                <div className="font-semibold text-gray-900">{e.name}</div>
                {e.company ? (
                  <div className="text-[11px] text-gray-600 flex items-center gap-1 mt-0.5">
                    <Building className="w-3 h-3 text-red-600" />
                    <span>{e.company}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400 italic">Individual</div>
                )}
              </td>

              <td className="py-3.5 px-4 text-[11px] text-gray-700 space-y-0.5">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span>{e.email}</span>
                </div>
                {e.phone && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{e.phone}</span>
                  </div>
                )}
              </td>

              <td className="py-3.5 px-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] border border-gray-200">
                  <Package className="w-3 h-3 text-red-600" />
                  <span>{e.items.length} items</span>
                </span>
              </td>

              <td className="py-3.5 px-4">
                <AdminEnquiryStatusBadge status={e.status} />
              </td>

              <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{formatEnquiryDate(e.createdAt)}</span>
                </div>
              </td>

              <td className="py-3.5 px-4 text-right">
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onView(e)}
                    className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs transition-colors flex items-center gap-1"
                    title="View Enquiry Details"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(e)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-colors"
                    title="Delete Enquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
