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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; padding: 24px; text-align: center; border-bottom: 4px solid #b91c1c;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Commercial Engineering Associates</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8;">Industrial Quotation / Commercial Offer</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Official Quotation</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">Dear ${enquiry.name},</p>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">Thank you for your interest in our products. Please find our commercial quotation below based on your requirements:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #475569; text-align: left;">
                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; border-top-left-radius: 4px;">Item Description</th>
                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; text-align: right;">Qty</th>
                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; text-align: right;">Rate (INR)</th>
                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; text-align: right;">GST (%)</th>
                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; text-align: right; border-top-right-radius: 4px;">Total (INR)</th>
              </tr>
            </thead>
            <tbody>
    `;

    enquiry.items.forEach(item => {
      const lineTotal = ((item.rate || 0) * item.quantity) * (1 + (item.gstRate || 0) / 100);
      html += `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 500;">${item.product?.name || 'Product'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">${item.rate?.toFixed(2) || '0.00'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">${item.gstRate?.toFixed(2) || '0.00'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: 600;">${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>

          <div style="text-align: right; margin-bottom: 24px; padding-right: 12px;">
            <p style="margin: 4px 0; color: #475569;"><strong>Subtotal:</strong> INR ${(enquiry.quoteSubtotal || 0).toFixed(2)}</p>
            <p style="margin: 4px 0; color: #475569;"><strong>GST Total:</strong> INR ${(enquiry.quoteGstTotal || 0).toFixed(2)}</p>
            <h3 style="margin: 12px 0 0 0; color: #b91c1c; font-size: 20px;">Grand Total: INR ${(enquiry.quoteGrandTotal || 0).toFixed(2)}</h3>
          </div>

          ${enquiry.bankDetails ? `
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 24px;">
            <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; display: flex; align-items: center;">Bank Account Details for Payment</h4>
            <pre style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; color: #475569; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">${enquiry.bankDetails}</pre>
          </div>
          ` : ''}
          ${enquiry.termsAndConditions ? `
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 6px; border: 1px solid #fcd34d; margin-top: 24px;">
            <h4 style="margin: 0 0 12px 0; color: #92400e; font-size: 15px; display: flex; align-items: center;">Terms & Conditions</h4>
            <pre style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; color: #92400e; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">${enquiry.termsAndConditions}</pre>
          </div>
          ` : ''}
        </div>
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">
            This quotation is generated electronically.<br/>For any clarifications, please reply directly to this email.<br/>
            <strong>Commercial Engineering Associates</strong>
          </p>
        </div>
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
