import React from 'react';
import { Layers, Wrench, Database } from 'lucide-react';

export function ValuePillars() {
  return (
    <section className="border-b border-gray-200 bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="font-sans text-base font-bold text-gray-900">
              Industrial Tapes & Sealants
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              VHB acrylic foam tapes, structural bonding films, neutral-cure silicone sealants, and elastomeric polyurethane facade solutions engineered for durability.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="font-sans text-base font-bold text-gray-900">
              Engineered Bonding & Fastener Replacement
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Toughened two-part epoxies, anaerobic threadlockers, and cyanoacrylates providing superior shear, peel, and vibration resistance.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-sans text-base font-bold text-gray-900">
              Fast Enquiry & Quotations
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Quick quotations via WhatsApp, direct email, or our online enquiry cart with prompt response from our sales engineering team.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
