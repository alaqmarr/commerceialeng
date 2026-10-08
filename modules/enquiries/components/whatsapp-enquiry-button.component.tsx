'use client';

/**
 * modules/enquiries/components/whatsapp-enquiry-button.component.tsx
 * Branded WhatsApp CTA button generating encoded pre-filled RFQ messages.
 * Strictly under 200 lines.
 */

import React from 'react';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';
import { buildWhatsAppUrl } from '../enquiries.lib';
import type { WhatsAppEnquiryButtonProps } from '../enquiries.types';

export function WhatsAppEnquiryButton({
  productName,
  productSlug = '',
  whatsappNumber = '+919876543210',
  className = '',
}: WhatsAppEnquiryButtonProps) {
  const waUrl = buildWhatsAppUrl(productName, productSlug, whatsappNumber);

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-enquiry"
      className={`inline-flex items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-all shadow-sm ${className}`}
    >
      <WhatsAppIcon className="h-4 w-4" />
      <span>Enquire on WhatsApp</span>
    </a>
  );
}
