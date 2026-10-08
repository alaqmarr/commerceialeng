/**
 * modules/enquiries/enquiries.lib.ts
 * Pure business logic, URL builders, formatters, and validation helpers.
 * ZERO database/Prisma imports. ZERO React imports.
 * Strictly under 200 lines.
 */

import type {
  CreateEnquiryInput,
  CreateEnquiryItemInput,
  EnquiryDTO,
  EnquiryValidationResult,
  WhatsAppEnquiryOptions,
} from './enquiries.types';

export function validateEnquiryPayload(payload: unknown): EnquiryValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Invalid enquiry payload' };
  }

  const p = payload as Partial<CreateEnquiryInput>;

  if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }

  if (!p.email || typeof p.email !== 'string' || !p.email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  return { isValid: true, error: null };
}

export function sanitizeEnquiryItems(items: unknown): CreateEnquiryItemInput[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter(
      (it): it is Record<string, unknown> =>
        typeof it === 'object' && it !== null && Boolean(it.productId)
    )
    .map((it) => ({
      productId: String(it.productId),
      quantity: Math.max(1, Number(it.quantity) || 1),
      notes: it.notes ? String(it.notes).trim() : null,
    }));
}

export function cleanPhoneNumber(phone?: string | null): string {
  if (!phone) return '+919876543210';
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned || '+919876543210';
}

export function buildWhatsAppUrl(
  productName: string,
  productSlug?: string,
  whatsappNumber: string = '+919876543210'
): string {
  const cleanNumber = cleanPhoneNumber(whatsappNumber);
  const pName = productName || 'Catalog Product';
  const pSlug = productSlug ? ` (${productSlug})` : ' (Catalog Item)';

  const messageText = `Hello Commercial Engineering Associates, I would like to enquire about ${pName}${pSlug}. Please share pricing, technical data sheet, and minimum order quantity.`;
  const encodedText = encodeURIComponent(messageText);

  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

export function generateWhatsAppUrl(options: WhatsAppEnquiryOptions): string {
  return buildWhatsAppUrl(options.productName, options.productSlug, options.whatsappNumber);
}

export function formatEnquiryDate(date: string | Date | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  } catch {
    return typeof date === 'string' ? date : '-';
  }
}

export function filterEnquiries(enquiries: EnquiryDTO[], search: string): EnquiryDTO[] {
  const q = search.trim().toLowerCase();
  if (!q) return enquiries;

  return enquiries.filter((e) => {
    const nameMatch = e.name.toLowerCase().includes(q);
    const emailMatch = e.email.toLowerCase().includes(q);
    const companyMatch = Boolean(e.company && e.company.toLowerCase().includes(q));
    const phoneMatch = Boolean(e.phone && e.phone.includes(q));
    return nameMatch || emailMatch || companyMatch || phoneMatch;
  });
}

export function getEnquiryStatusBadgeClasses(status: string): string {
  const s = status.toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'bg-red-50 text-red-700 border border-red-200';
    case 'CONTACTED':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'CLOSED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
}
