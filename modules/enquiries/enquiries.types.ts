/**
 * modules/enquiries/enquiries.types.ts
 * Domain contracts, DTOs, and action input interfaces for Enquiries & Cart.
 * Strictly under 200 lines.
 */

export type EnquiryStatus = 'PENDING' | 'CONTACTED' | 'CLOSED' | string;
export type EnquiryStatusFilter = 'ALL' | 'PENDING' | 'CONTACTED' | 'QUOTED' | 'CLOSED';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  categoryName?: string | null;
  quantity: number;
  notes?: string;
}

export interface CreateEnquiryItemInput {
  productId: string;
  quantity: number;
  notes?: string | null;
}

export interface CreateEnquiryInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  gstNumber?: string | null;
  message?: string | null;
  items?: CreateEnquiryItemInput[];
}

export interface EnquiryItemProductDTO {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export interface EnquiryItemDTO {
  id: string;
  enquiryId: string;
  productId: string;
  quantity: number;
  notes: string | null;
  rate?: number | null;
  gstRate?: number | null;
  product?: EnquiryItemProductDTO | null;
}

export interface EnquiryDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  gstNumber: string | null;
  message: string | null;
  status: EnquiryStatus;
  isQuote?: boolean;
  quoteSubtotal?: number | null;
  quoteGstTotal?: number | null;
  quoteGrandTotal?: number | null;
  bankDetails?: string | null;
  quoteSentAt?: string | Date | null;
  items: EnquiryItemDTO[];
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface UpdateEnquiryStatusInput {
  id: string;
  status?: string;
  message?: string | null;
}

export interface EnquiryActionResult<T = unknown> {
  success: boolean;
  data?: T;
  enquiryId?: string;
  error?: string;
  message?: string;
}

export interface EnquiryValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface GetEnquiriesQueryOptions {
  status?: string | null;
  search?: string | null;
  take?: number;
  skip?: number;
  orderDirection?: 'asc' | 'desc';
}

export interface WhatsAppEnquiryOptions {
  productName: string;
  productSlug?: string;
  whatsappNumber?: string;
  customMessage?: string;
}

export interface WhatsAppEnquiryButtonProps {
  productName: string;
  productSlug?: string;
  whatsappNumber?: string;
  className?: string;
}

export interface EmailEnquiryModalProps {
  productId: string;
  productName: string;
  productSlug?: string;
  className?: string;
}
