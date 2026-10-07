import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEnquiryNotificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, message, items } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const cleanItems = Array.isArray(items) ? items : [];

    // Atomic transaction: Create Enquiry and child EnquiryItems
    const newEnquiry = await prisma.$transaction(async (tx) => {
      const enquiryRecord = await tx.enquiry.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone ? String(phone).trim() : null,
          company: company ? String(company).trim() : null,
          message: message ? String(message).trim() : null,
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

      return enquiryRecord;
    });

    // Fetch complete enquiry record with populated product details for email dispatch
    const populatedEnquiry = await prisma.enquiry.findUnique({
      where: { id: newEnquiry.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (populatedEnquiry) {
      // Trigger dynamic SMTP email notification asynchronously
      await sendEnquiryNotificationEmail({
        id: populatedEnquiry.id,
        name: populatedEnquiry.name,
        email: populatedEnquiry.email,
        phone: populatedEnquiry.phone,
        company: populatedEnquiry.company,
        message: populatedEnquiry.message,
        items: populatedEnquiry.items.map((i) => ({
          quantity: i.quantity,
          notes: i.notes,
          product: {
            name: i.product.name,
            slug: i.product.slug,
          },
        })),
      });
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
