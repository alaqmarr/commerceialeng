import React from 'react';
import Link from 'next/link';
import { ArrowRight, PhoneCall, CheckCircle } from 'lucide-react';

export function HomeRfqCta() {
  return (
    <section className="py-16 bg-gray-50 border-b border-gray-200 relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-sans font-medium text-red-600">
          <CheckCircle className="h-4 w-4" />
          <span>CUSTOM SIZING • TECHNICAL SUPPORT • BULK QUOTES</span>
        </div>

        <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
          Need Custom Specifications or Bulk Quotation?
        </h2>

        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Our technical sales engineers assist in matching substrates, evaluating peel and shear stress parameters, and supplying certified sample rolls for qualification testing.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-red-700 transition-all shadow-md active:scale-95"
          >
            <span>View Enquiry Cart</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/contact?from=home"
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3.5 text-sm font-medium text-gray-800 hover:border-red-500 hover:text-red-600 transition-colors shadow-sm"
          >
            <PhoneCall className="h-4 w-4 text-red-600" />
            <span>Contact Sales Team</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
