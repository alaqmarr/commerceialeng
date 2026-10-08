import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getEnquiryByIdQuery } from '@/modules/enquiries/queries/get-enquiry-by-id.query';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { isQuote, items, bankDetails, subtotal, gstTotal, grandTotal } = body;

    await prisma.$transaction(async (tx) => {
      await tx.enquiry.update({
        where: { id },
        data: {
          isQuote,
          quoteSubtotal: subtotal,
          quoteGstTotal: gstTotal,
          quoteGrandTotal: grandTotal,
          bankDetails,
          status: 'QUOTED',
        },
      });

      for (const item of items) {
        await tx.enquiryItem.update({
          where: { id: item.id },
          data: {
            rate: item.rate,
            gstRate: item.gstRate,
          },
        });
      }
    });

    const updatedEnquiry = await getEnquiryByIdQuery(id);
    return NextResponse.json({ success: true, enquiry: updatedEnquiry });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
