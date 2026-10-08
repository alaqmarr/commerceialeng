'use client';

/**
 * modules/enquiries/components/cart-confirmation.component.tsx
 * Post-submission confirmation display for RFQ requests.
 * Strictly under 200 lines.
 */

import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface CartConfirmationProps {
  submissionId: string | null;
}

export function CartConfirmation({ submissionId }: CartConfirmationProps) {
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
