'use client';

/**
 * modules/enquiries/components/cart-checkout-form.component.tsx
 * Customer contact form and submission trigger for RFQ checkout.
 * Strictly under 200 lines.
 */

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Send, AlertCircle } from 'lucide-react';
import { IosSpinner } from '@/components/ui/ios-spinner';

interface CartCheckoutFormProps {
  onSuccess: (submissionId: string) => void;
}

export function CartCheckoutForm({ onSuccess }: CartCheckoutFormProps) {
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    gstNumber: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        gstNumber: formData.gstNumber,
        message: formData.message,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || null,
        })),
      };

      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit RFQ enquiry');
      }

      clearCart();
      onSuccess(data.enquiryId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-6 sm:p-8 shadow-sm space-y-6">
      <div>
        <h3 className="font-sans text-base font-bold uppercase tracking-wider text-gray-900">
          Customer Details
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          Please provide your contact information to receive our formal proposal.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Vikram Malhotra"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="vikram@apexindustries.in"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98200 12345"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-xs font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Apex Automotive Engineering"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="gstNumber" className="block text-xs font-medium text-gray-700 mb-1">
            GST Number (if applicable)
          </label>
          <input
            id="gstNumber"
            name="gstNumber"
            type="text"
            value={formData.gstNumber}
            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
            placeholder="e.g. 27AAAAA0000A1Z5"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1">
            Project Requirements / Notes
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Specify target substrates, thickness requirements, or required roll widths..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          data-testid="submit-rfq-btn"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3.5 text-sm font-semibold text-white hover:bg-red-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <IosSpinner className="h-4 w-4 text-white" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>Submit Request for Quotation</span>
        </button>

        <p className="text-[11px] text-gray-500 text-center font-sans">
          Our sales engineering team typically responds within 24 business hours.
        </p>
      </form>
    </div>
  );
}
