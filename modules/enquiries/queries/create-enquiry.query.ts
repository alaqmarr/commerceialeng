/**
 * modules/enquiries/queries/create-enquiry.query.ts
 * Atomic transaction creating Enquiry and EnquiryItem children.
 * Strictly under 200 lines.
 */

import prisma from '@/lib/prisma';
import type { CreateEnquiryInput, EnquiryDTO } from '../enquiries.types';

export async function createEnquiryQuery(input: CreateEnquiryInput): Promise<EnquiryDTO> {
  const cleanItems = input.items || [];

  return await prisma.$transaction(async (tx) => {
    const enquiryRecord = await tx.enquiry.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone ? String(input.phone).trim() : null,
        company: input.company ? String(input.company).trim() : null,
        gstNumber: input.gstNumber ? String(input.gstNumber).trim() : null,
        message: input.message ? String(input.message).trim() : null,
        status: 'PENDING',
      },
    });

    if (cleanItems.length > 0) {
      for (const item of cleanItems) {
        if (item.productId) {
          await tx.enquiryItem.create({
            data: {
              enquiryId: enquiryRecord.id,
              productId: item.productId,
              quantity: Math.max(1, Number(item.quantity) || 1),
              notes: item.notes ? String(item.notes).trim() : null,
            },
          });
        }
      }
    }

    const populated = await tx.enquiry.findUniqueOrThrow({
      where: { id: enquiryRecord.id },
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

    return populated as unknown as EnquiryDTO;
  });
}
