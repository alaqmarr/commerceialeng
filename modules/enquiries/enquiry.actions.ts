'use server';

/**
 * modules/enquiries/enquiry.actions.ts
 * Server actions for submitting and managing customer RFQs and enquiries.
 * Strictly under 200 lines.
 */

import { revalidatePath } from 'next/cache';
import type {
  CreateEnquiryInput,
  UpdateEnquiryStatusInput,
  EnquiryActionResult,
  EnquiryDTO,
  GetEnquiriesQueryOptions,
} from './enquiries.types';
import { validateEnquiryPayload, sanitizeEnquiryItems } from './enquiries.lib';
import {
  createEnquiryQuery,
  getEnquiriesQuery,
  getEnquiryByIdQuery,
  updateEnquiryStatusQuery,
  deleteEnquiryQuery,
} from './queries';
import { sendEnquiryNotificationEmail } from '@/lib/email';

export async function submitEnquiryAction(
  input: CreateEnquiryInput
): Promise<EnquiryActionResult<EnquiryDTO>> {
  try {
    const validation = validateEnquiryPayload(input);
    if (!validation.isValid) {
      return { success: false, error: validation.error || 'Validation failed' };
    }

    const cleanItems = sanitizeEnquiryItems(input.items);
    const enquiry = await createEnquiryQuery({
      ...input,
      items: cleanItems,
    });

    // Trigger SMTP email asynchronously
    try {
      await sendEnquiryNotificationEmail({
        id: enquiry.id,
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        company: enquiry.company,
        message: enquiry.message,
        items: enquiry.items.map((i) => ({
          quantity: i.quantity,
          notes: i.notes,
          product: {
            name: i.product?.name || 'Product',
            slug: i.product?.slug,
          },
        })),
      });
    } catch (e) {
      console.warn('[submitEnquiryAction] Email notification non-blocking failure:', e);
    }

    revalidatePath('/admin/enquiries');
    return {
      success: true,
      enquiryId: enquiry.id,
      data: enquiry,
      message: 'Enquiry submitted successfully',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to submit enquiry';
    return { success: false, error: msg };
  }
}

export async function updateEnquiryStatusAction(
  input: UpdateEnquiryStatusInput
): Promise<EnquiryActionResult<EnquiryDTO>> {
  try {
    const updated = await updateEnquiryStatusQuery(input);
    revalidatePath('/admin/enquiries');
    return { success: true, data: updated };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update enquiry status';
    return { success: false, error: msg };
  }
}

export async function deleteEnquiryAction(id: string): Promise<EnquiryActionResult> {
  try {
    await deleteEnquiryQuery(id);
    revalidatePath('/admin/enquiries');
    return { success: true, message: 'Enquiry deleted' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete enquiry';
    return { success: false, error: msg };
  }
}

export async function getEnquiriesAction(
  options?: GetEnquiriesQueryOptions
): Promise<EnquiryDTO[]> {
  return await getEnquiriesQuery(options);
}

export async function getEnquiryByIdAction(id: string): Promise<EnquiryDTO | null> {
  return await getEnquiryByIdQuery(id);
}
