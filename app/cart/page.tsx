import React from 'react';
import type { Metadata } from 'next';
import { CartView } from '@/modules/enquiries';

export const metadata: Metadata = {
  title: 'Enquiry Cart & RFQ Checkout | Commercial Engineering Associates',
  description:
    'Review selected industrial tapes, adhesives, and sealants. Submit Request for Quotation for custom pricing.',
};

export default function CartCheckoutPage() {
  return <CartView />;
}
