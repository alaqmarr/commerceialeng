import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { getEnquiryByIdQuery } from '@/modules/enquiries/queries/get-enquiry-by-id.query';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiry = await getEnquiryByIdQuery(id);
    if (!enquiry) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SALES_EMAIL'] }
      }
    });

    const config = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
      return NextResponse.json({ error: 'SMTP not configured properly in settings' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: Number(config.SMTP_PORT) || 587,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
      secure: Number(config.SMTP_PORT) === 465,
    });

    let html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #dc2626;">Quotation from Commercial Engineering Associates</h2>
        <p>Dear ${enquiry.name},</p>
        <p>Thank you for your enquiry. Please find our commercial quotation below:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: right;">Qty</th>
              <th style="padding: 10px; text-align: right;">Rate (₹)</th>
              <th style="padding: 10px; text-align: right;">GST (%)</th>
              <th style="padding: 10px; text-align: right;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
    `;

    enquiry.items.forEach(item => {
      const lineTotal = ((item.rate || 0) * item.quantity) * (1 + (item.gstRate || 0) / 100);
      html += `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px;">${item.product?.name || 'Product'}</td>
          <td style="padding: 10px; text-align: right;">${item.quantity}</td>
          <td style="padding: 10px; text-align: right;">${item.rate?.toFixed(2) || '0.00'}</td>
          <td style="padding: 10px; text-align: right;">${item.gstRate?.toFixed(2) || '0.00'}</td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 20px;">
          <p><strong>Subtotal:</strong> ₹${(enquiry.quoteSubtotal || 0).toFixed(2)}</p>
          <p><strong>GST Total:</strong> ₹${(enquiry.quoteGstTotal || 0).toFixed(2)}</p>
          <h3 style="color: #dc2626;">Grand Total: ₹${(enquiry.quoteGrandTotal || 0).toFixed(2)}</h3>
        </div>

        ${enquiry.bankDetails ? `
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h4 style="margin-top: 0;">Bank Details for Payment</h4>
          <pre style="font-family: inherit; margin: 0; white-space: pre-wrap;">${enquiry.bankDetails}</pre>
        </div>
        ` : ''}

        <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
          This is an automatically generated quotation. For any queries, please reply to this email.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: config.SALES_EMAIL || config.SMTP_USER,
      to: enquiry.email,
      subject: `Quotation: Commercial Engineering Associates - Enquiry #${enquiry.id.slice(-6).toUpperCase()}`,
      html,
    });

    await prisma.enquiry.update({
      where: { id },
      data: { quoteSentAt: new Date() }
    });

    const updatedEnquiry = await getEnquiryByIdQuery(id);
    return NextResponse.json({ success: true, enquiry: updatedEnquiry });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
