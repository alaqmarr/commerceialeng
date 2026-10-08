'use client';

/**
 * modules/enquiries/components/cart-view.component.tsx
 * Top-level view container for public /cart RFQ checkout.
 * Strictly under 200 lines.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShieldCheck, ArrowLeft, ShoppingBag } from 'lucide-react';
import { CartItemList } from './cart-item-list.component';
import { CartCheckoutForm } from './cart-checkout-form.component';
import { CartConfirmation } from './cart-confirmation.component';

export function CartView() {
  const { items } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const handleSuccess = (id: string) => {
    setSubmissionId(id);
    setSubmitted(true);
  };

  if (submitted) {
    return <CartConfirmation submissionId={submissionId} />;
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

        {/* Empty Cart Banner */}
        {items.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center space-y-3">
            <ShoppingBag className="mx-auto h-8 w-8 text-gray-400" />
            <p className="font-sans text-sm text-gray-800">Your enquiry cart is empty.</p>
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <CartItemList />
          </div>
          <div className="lg:col-span-5">
            <CartCheckoutForm onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
