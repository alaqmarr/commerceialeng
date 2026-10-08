'use client';

/**
 * modules/enquiries/components/admin-enquiry-detail-modal.component.tsx
 * Detail modal dialog inspecting customer RFQ specifications and line items.
 * Strictly under 200 lines.
 */

import React from 'react';
import { Mail, X, Phone, Building, Package, Trash2, Loader, CheckCircle2 } from 'lucide-react';
import type { EnquiryDTO } from '../enquiries.types';
import { AdminEnquiryStatusBadge } from './admin-enquiry-status-badge.component';

export interface AdminEnquiryDetailModalProps {
  enquiry: EnquiryDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (enquiryId: string, newStatus: string) => Promise<void>;
  statusUpdating: boolean;
  onDeleteClick: (enquiry: EnquiryDTO) => void;
}

export function AdminEnquiryDetailModal({
  enquiry,
  isOpen,
  onClose,
  onStatusChange,
  statusUpdating,
  onDeleteClick,
}: AdminEnquiryDetailModalProps) {
  if (!isOpen || !enquiry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-tight">
              Enquiry Details & Cart Items
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Client Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block">Client Name</span>
              <span className="text-sm font-bold text-gray-900">{enquiry.name}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block">Company</span>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-0.5">
                <Building className="w-3.5 h-3.5 text-red-600" />
                <span>{enquiry.company || 'Not Specified'}</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block">Email Address</span>
              <a href={`mailto:${enquiry.email}`} className="text-xs text-red-600 hover:underline break-all">
                {enquiry.email}
              </a>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block">Telephone / Mobile</span>
              <span className="text-xs text-gray-800">{enquiry.phone || 'Not Provided'}</span>
            </div>
          </div>

          {/* Status Updater */}
          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Enquiry Status</span>
              <AdminEnquiryStatusBadge status={enquiry.status} />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-500">Update to:</span>
              {(['PENDING', 'CONTACTED', 'CLOSED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={statusUpdating || enquiry.status === st}
                  onClick={() => onStatusChange(enquiry.id, st)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                    enquiry.status === st
                      ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:bg-red-50 hover:text-red-600 text-gray-700'
                  }`}
                >
                  {statusUpdating ? <Loader className="w-3 h-3 animate-spin inline mr-1" /> : null}
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Project Message */}
          {enquiry.message && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Project Requirements / Notes</span>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                {enquiry.message}
              </div>
            </div>
          )}

          {/* Requested Items Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
              Requested Cart Items ({enquiry.items.length})
            </span>
            {enquiry.items.length === 0 ? (
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-center text-xs text-gray-500">
                General consultation enquiry with no specific products attached.
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase text-gray-600">
                    <tr>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3">Notes / Specs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {enquiry.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {item.product?.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span className="font-semibold text-gray-900">{item.product?.name || item.productId}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-red-600">{item.quantity}</td>
                        <td className="py-3 px-3 text-gray-500 text-[11px]">{item.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onDeleteClick(enquiry)}
            className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Enquiry</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
