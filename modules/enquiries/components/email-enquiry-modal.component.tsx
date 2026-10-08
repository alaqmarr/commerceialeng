'use client';

/**
 * modules/enquiries/components/email-enquiry-modal.component.tsx
 * Direct single-product email RFQ modal dialog.
 * Strictly under 200 lines.
 */

import React, { useState } from 'react';
import { Mail, X, CheckCircle } from 'lucide-react';
import { IosSpinner } from '@/components/ui/ios-spinner';
import type { EmailEnquiryModalProps } from '../enquiries.types';

export function EmailEnquiryModal({
  productId,
  productName,
  productSlug,
  className = '',
}: EmailEnquiryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', gstNumber: '', quantity: 1, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          gstNumber: formData.gstNumber,
          items: [{ productId, quantity: formData.quantity, notes: `Direct RFQ for ${productName} (${productSlug || ''})` }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit enquiry');

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        setFormData({ name: '', email: '', phone: '', company: '', gstNumber: '', quantity: 1, message: '' });
      }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        data-testid="email-enquiry"
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:border-red-500 hover:text-red-600 transition-all shadow-sm ${className}`}
      >
        <Mail className="h-4 w-4 text-red-600" />
        <span>Email Enquiry</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="font-sans text-[11px] uppercase tracking-wider text-red-600 font-bold">Product Enquiry</span>
              <h3 className="font-sans text-lg font-bold text-gray-900 mt-0.5 line-clamp-1">{productName}</h3>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 animate-in zoom-in" />
                <h4 className="font-sans text-base font-bold text-gray-900">Enquiry Submitted!</h4>
                <p className="text-xs text-gray-600">Our sales engineering team will reach out with pricing shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 font-sans">
                {error && <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">{error}</div>}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none"
                    placeholder="Vikram Malhotra"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none"
                      placeholder="vikram@apex.in"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none"
                      placeholder="+91 98200 12345"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none"
                      placeholder="Apex Auto"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Requirements / Message</label>
                  <textarea
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none"
                    placeholder="Specify target substrates, thickness, or roll widths..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <IosSpinner className="h-4 w-4 text-white" />}
                  <span>Submit Product RFQ</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
