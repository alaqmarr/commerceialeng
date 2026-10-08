import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader } from 'lucide-react';
import { AdminEnquiryManager } from '@/modules/enquiries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Customer Enquiries & RFQ Leads | Admin Portal',
};

export default function AdminEnquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader className="w-7 h-7 text-red-600 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Loading Customer Enquiries...
          </span>
        </div>
      }
    >
      <AdminEnquiryManager />
    </Suspense>
  );
}
