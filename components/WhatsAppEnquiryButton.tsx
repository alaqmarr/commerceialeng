import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface WhatsAppEnquiryButtonProps {
  productName: string;
  productSlug?: string;
  whatsappNumber?: string;
  className?: string;
}

export function WhatsAppEnquiryButton({
  productName,
  productSlug = '',
  whatsappNumber = '+919876543210',
  className = '',
}: WhatsAppEnquiryButtonProps) {
  // Strip spaces, dashes, parentheses but keep leading '+' if present
  let cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
  if (!cleanNumber) {
    cleanNumber = '+919876543210';
  }

  const messageText = `Hello Commercial Engineering Associates, I would like to enquire about ${productName} (${productSlug || 'Catalog Item'}). Please share pricing, technical data sheet, and minimum order quantity.`;
  const encodedText = encodeURIComponent(messageText);
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

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
