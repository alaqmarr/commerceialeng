/**
 * modules/enquiries/queries/get-enquiry-by-id.query.ts
 * Query to find a single enquiry by its ID.
 * Strictly under 200 lines.
 */

import prisma from '@/lib/prisma';
import type { EnquiryDTO } from '../enquiries.types';

export async function getEnquiryByIdQuery(id: string): Promise<EnquiryDTO | null> {
  const result = await prisma.enquiry.findUnique({
    where: { id },
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

  return result as unknown as EnquiryDTO | null;
}
