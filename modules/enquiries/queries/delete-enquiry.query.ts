/**
 * modules/enquiries/queries/delete-enquiry.query.ts
 * Query to delete an enquiry by its ID (cascade removes children).
 * Strictly under 200 lines.
 */

import prisma from '@/lib/prisma';

export async function deleteEnquiryQuery(id: string): Promise<boolean> {
  await prisma.enquiry.delete({
    where: { id },
  });
  return true;
}
