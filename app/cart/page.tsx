'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Trash2,
  Send,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export default function CartCheckoutPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
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

      setSubmissionId(data.enquiryId);
      setSubmitted(true);
      // Reset cart items upon successful persistence
      clearCart();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  // Confirmation view after submission
  if (submitted) {
    return (
      <div className="flex-1 bg-white py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <span className="font-sans text-xs uppercase tracking-wider text-emerald-600 font-bold">
              RFQ Confirmation
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold uppercase text-gray-900 tracking-tight">
              Enquiry Submitted Successfully!
            </h1>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Thank you for choosing Commercial Engineering Associates. Your Request for Quotation has been recorded in our engineering queue.
            </p>
          </div>

          {submissionId && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-sans text-xs text-gray-700">
              <span className="text-gray-500">Reference ID: </span>
              <span className="text-red-600 font-bold">{submissionId}</span>
            </div>
          )}

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-sans text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-md"
            >
              <span>Explore More Products</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-sans text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-sans text-xs text-red-600 mb-2 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>COMMERCIAL QUOTATION</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
              Enquiry Cart
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 font-sans">
              Review your selected items and submit your contact details for pricing and delivery timelines.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-sans text-red-600 hover:text-red-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Browsing</span>
          </Link>
        </div>

        {/* Empty Cart Notice (if 0 items, still permit general consultation submission) */}
        {items.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center space-y-3">
            <ShoppingBag className="mx-auto h-8 w-8 text-gray-400" />
            <p className="font-sans text-sm text-gray-800">
              Your enquiry cart is empty.
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              You can still submit a general enquiry below, or browse our catalog to add products.
            </p>
            <Link
              href="/products"
              className="mt-2 inline-block rounded-lg bg-red-600 px-4 py-2 font-sans text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-sans text-base font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-red-600" />
              <span>Selected Items ({items.length})</span>
            </h3>

            {items.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500 font-sans">
                No products selected. Items added from product pages will appear here.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                {items.map((item) => (
                  <div key={item.productId} className="p-4 sm:p-5 flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <FileText className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {item.categoryName && (
                            <span className="font-sans text-[11px] uppercase text-red-600 block font-medium">
                              {item.categoryName}
                            </span>
                          )}
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-sans text-sm font-bold text-gray-900 hover:text-red-600 transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center gap-4 pt-2">
                        <span className="text-xs text-gray-600 font-sans">Quantity:</span>
                        <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2.5 py-1 text-gray-500 hover:text-gray-900 font-sans text-xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-sans text-xs font-bold text-red-600">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2.5 py-1 text-gray-500 hover:text-gray-900 font-sans text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Customer Details & Submission Form */}
          <div className="lg:col-span-5">
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-sans font-medium text-gray-700 mb-1">
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
                  <label htmlFor="email" className="block text-xs font-sans font-medium text-gray-700 mb-1">
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
                  <label htmlFor="phone" className="block text-xs font-sans font-medium text-gray-700 mb-1">
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
                  <label htmlFor="company" className="block text-xs font-sans font-medium text-gray-700 mb-1">
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
                  <label htmlFor="message" className="block text-xs font-sans font-medium text-gray-700 mb-1">
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
                    <Loader2 className="h-4 w-4 animate-spin" />
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
          </div>
        </div>
      </div>
    </div>
  );
}
