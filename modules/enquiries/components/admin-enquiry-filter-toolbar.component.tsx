'use client';

/**
 * modules/enquiries/components/admin-enquiry-filter-toolbar.component.tsx
 * Top header toolbar with status tabs and search bar for admin enquiries.
 * Strictly under 200 lines.
 */

import React from 'react';
import { Mail, Search } from 'lucide-react';

export interface AdminEnquiryFilterToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  totalFiltered: number;
}

export function AdminEnquiryFilterToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalFiltered,
}: AdminEnquiryFilterToolbarProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>RFQ INQUIRIES INBOX</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            Customer Enquiries & RFQ Leads
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Manage inbound quotation requests, review product specifications, and update lead status.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg border border-gray-200">
            {['ALL', 'PENDING', 'CONTACTED', 'QUOTED', 'CLOSED'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusFilterChange(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200 font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => window.location.href = '/admin/enquiries/new'}
            className="self-end px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
          >
            + Create Quote
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client name, email, company, or phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-500 placeholder:text-gray-400"
          />
        </div>
        <div className="text-xs text-gray-600">
          Showing <strong className="text-gray-900 font-semibold">{totalFiltered}</strong> enquiries
        </div>
      </div>
    </div>
  );
}
