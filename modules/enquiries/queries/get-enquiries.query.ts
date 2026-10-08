/**
 * modules/enquiries/queries/get-enquiries.query.ts
 * Query to list enquiries with item and product relations.
 * Strictly under 200 lines.
 */

import prisma from '@/lib/prisma';
import type { GetEnquiriesQueryOptions, EnquiryDTO } from '../enquiries.types';

export async function getEnquiriesQuery(options?: GetEnquiriesQueryOptions): Promise<EnquiryDTO[]> {
  const where: Record<string, unknown> = {};

  if (options?.status && options.status !== 'ALL') {
    where.status = options.status.toUpperCase();
  }

  const results = await prisma.enquiry.findMany({
    where,
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
    orderBy: { createdAt: options?.orderDirection || 'desc' },
    take: options?.take,
    skip: options?.skip,
  });

  return results as unknown as EnquiryDTO[];
}
