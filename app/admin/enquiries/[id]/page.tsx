import React from 'react';
import { notFound } from 'next/navigation';
import { getEnquiryByIdQuery } from '@/modules/enquiries/queries/get-enquiry-by-id.query';
import { EnquiryQuoteManager } from '@/modules/enquiries/components/enquiry-quote-manager.component';

export default async function AdminEnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const enquiry = await getEnquiryByIdQuery(id);
    if (!enquiry) {
      notFound();
    }
    return <EnquiryQuoteManager initialEnquiry={enquiry} />;
  } catch (error) {
    notFound();
  }
}
