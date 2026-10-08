import { NextRequest, NextResponse } from 'next/server';
import {
  validateEnquiryPayload,
  sanitizeEnquiryItems,
  createEnquiryQuery,
} from '@/modules/enquiries';
import { sendEnquiryNotificationEmail, sendCustomerThankYouEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = validateEnquiryPayload(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanItems = sanitizeEnquiryItems(body.items);

    const newEnquiry = await createEnquiryQuery({
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      gstNumber: body.gstNumber,
      message: body.message,
      items: cleanItems,
    });

    // Trigger dynamic SMTP email notification asynchronously
    try {
      const payload = {
        id: newEnquiry.id,
        name: newEnquiry.name,
        email: newEnquiry.email,
        phone: newEnquiry.phone,
        company: newEnquiry.company,
        message: newEnquiry.message,
        items: newEnquiry.items.map((i) => ({
          quantity: i.quantity,
          notes: i.notes,
          product: {
            name: i.product?.name || 'Product',
            slug: i.product?.slug || '',
          },
        })),
      };
      await sendEnquiryNotificationEmail(payload);
      await sendCustomerThankYouEmail(payload);
    } catch (emailErr) {
      console.warn('[Enquiries API] Non-blocking email dispatch notice:', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        enquiryId: newEnquiry.id,
        message: 'Enquiry submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[Enquiry Submission Error]:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Enquiries endpoint active. Submit POST requests with customer and RFQ details.' },
    { status: 200 }
  );
}
