/**
 * modules/enquiries/queries/update-enquiry-status.query.ts
 * Query to update enquiry status and message.
 * Strictly under 200 lines.
 */

import prisma from '@/lib/prisma';
import type { UpdateEnquiryStatusInput, EnquiryDTO } from '../enquiries.types';

export async function updateEnquiryStatusQuery(input: UpdateEnquiryStatusInput): Promise<EnquiryDTO> {
  const result = await prisma.enquiry.update({
    where: { id: input.id },
    data: {
      ...(input.status && { status: input.status.toUpperCase() }),
      ...(input.message !== undefined && { message: input.message }),
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  return result as unknown as EnquiryDTO;
}
