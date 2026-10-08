import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

export interface EmailEnquiryPayload {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  items: Array<{
    quantity: number;
    notes?: string | null;
    product: {
      name: string;
      slug?: string;
    };
  }>;
}

/**
 * Sends an email notification for a new Request for Quotation (RFQ) / Enquiry.
 * Reads SMTP credentials dynamically from the database `Setting` table.
 * Includes graceful fallback logging if SMTP server is unavailable or placeholder credentials are in use.
 */
export async function sendEnquiryNotificationEmail(enquiry: EmailEnquiryPayload): Promise<{
  success: boolean;
  messageId?: string;
  fallback?: boolean;
}> {
  try {
    // 1. Load dynamic SMTP settings from database
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SALES_EMAIL'],
        },
      },
    });

    const settingsMap = settings.reduce<Record<string, string>>((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    const smtpHost = settingsMap['SMTP_HOST'] || process.env.SMTP_HOST;
    const smtpPort = Number(settingsMap['SMTP_PORT'] || process.env.SMTP_PORT || 587);
    const smtpUser = settingsMap['SMTP_USER'] || process.env.SMTP_USER;
    const smtpPass = settingsMap['SMTP_PASS'] || process.env.SMTP_PASS;
    const smtpFrom =
      settingsMap['SMTP_FROM'] ||
      process.env.SMTP_FROM ||
      'Commercial Engineering Associates <sales@commercialeng.com>';
    const salesEmail =
      settingsMap['SALES_EMAIL'] ||
      process.env.SALES_EMAIL ||
      'sales@commercialeng.com';

    // 2. Format HTML and Plaintext RFQ summary
    const itemsTableHtml = enquiry.items && enquiry.items.length > 0
      ? `
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-family: monospace, sans-serif; font-size: 13px;">
          <thead>
            <tr style="background-color: #0f172a; color: #f59e0b; text-align: left;">
              <th style="padding: 10px; border: 1px solid #334155;">#</th>
              <th style="padding: 10px; border: 1px solid #334155;">Product Name</th>
              <th style="padding: 10px; border: 1px solid #334155; text-align: center;">Qty</th>
              <th style="padding: 10px; border: 1px solid #334155;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${enquiry.items
              .map(
                (item, idx) => `
              <tr style="border-bottom: 1px solid #334155; color: #e2e8f0;">
                <td style="padding: 10px; border: 1px solid #334155;">${idx + 1}</td>
                <td style="padding: 10px; border: 1px solid #334155; font-weight: bold;">${item.product.name}</td>
                <td style="padding: 10px; border: 1px solid #334155; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border: 1px solid #334155; color: #94a3b8;">${item.notes || '-'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `
      : '<p style="color: #94a3b8; font-style: italic;">General technical consultation / inquiry (no specific catalog items selected).</p>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #090d16; color: #f8fafc; border: 1px solid #334155; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f59e0b; color: #090d16; padding: 18px 24px; font-weight: bold; font-size: 18px; font-family: monospace;">
          COMMERCIAL ENGINEERING ASSOCIATES — NEW RFQ ENQUIRY
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 15px; line-height: 1.5; color: #e2e8f0;">
            A new industrial enquiry / Request for Quotation has been received through the online portal.
          </p>

          <div style="background-color: #0f172a; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 4px 0;"><strong>Enquiry Reference ID:</strong> <span style="font-family: monospace; color: #f59e0b;">${enquiry.id}</span></p>
            <p style="margin: 4px 0;"><strong>Customer Name:</strong> ${enquiry.name}</p>
            <p style="margin: 4px 0;"><strong>Email Address:</strong> <a href="mailto:${enquiry.email}" style="color: #38bdf8;">${enquiry.email}</a></p>
            <p style="margin: 4px 0;"><strong>Phone Number:</strong> ${enquiry.phone || 'Not provided'}</p>
            <p style="margin: 4px 0;"><strong>Company / Organization:</strong> ${enquiry.company || 'Not provided'}</p>
            ${
              enquiry.message
                ? `<p style="margin: 8px 0 4px 0;"><strong>Project Requirements:</strong></p>
                   <blockquote style="margin: 4px 0; padding: 8px 12px; background: #1e293b; border-radius: 4px; color: #cbd5e1; font-style: italic;">${enquiry.message}</blockquote>`
                : ''
            }
          </div>

          <h3 style="color: #f59e0b; font-family: monospace; text-transform: uppercase; margin-top: 24px; font-size: 14px;">
            Enquired Industrial Items (${enquiry.items ? enquiry.items.length : 0})
          </h3>
          ${itemsTableHtml}

          <div style="margin-top: 24px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/enquiries/${enquiry.id}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #090d16; text-decoration: none; font-weight: bold; border-radius: 4px; font-family: sans-serif;">
              View / Manage Enquiry in Admin Panel
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #334155; font-size: 12px; color: #64748b;">
            This is an automated dispatch from the Commercial Engineering Associates B2B platform.
          </div>
        </div>
      </div>
    `;

    const plainTextContent = `
COMMERCIAL ENGINEERING ASSOCIATES — NEW RFQ ENQUIRY
Reference ID: ${enquiry.id}
Customer Name: ${enquiry.name}
Email: ${enquiry.email}
Phone: ${enquiry.phone || 'N/A'}
Company: ${enquiry.company || 'N/A'}
Message: ${enquiry.message || 'N/A'}

Enquired Items:
${enquiry.items.map((i, idx) => `${idx + 1}. ${i.product.name} (Qty: ${i.quantity}) - Notes: ${i.notes || 'None'}`).join('\n')}
    `.trim();

    // 3. Check if SMTP configuration is valid or placeholder
    const isPlaceholder =
      !smtpHost ||
      !smtpUser ||
      !smtpPass ||
      smtpPass === 'app_password_placeholder' ||
      smtpPass === 'placeholder';

    if (isPlaceholder) {
      console.log(
        `[Dynamic SMTP Service] Placeholder or missing credentials detected for ${salesEmail}. Logging enquiry notification to console fallback:`
      );
      console.log(`[RFQ Fallback Log] -> To: ${salesEmail} | Ref: ${enquiry.id} | From: ${enquiry.name} (${enquiry.email})`);
      return { success: true, fallback: true };
    }

    // 4. Initialize Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 5000,
    });

    const info = await transporter.sendMail({
      from: smtpFrom,
      to: salesEmail,
      replyTo: enquiry.email,
      subject: `[CEA RFQ #${enquiry.id.slice(-6)}] New Industrial Enquiry from ${enquiry.name}`,
      text: plainTextContent,
      html: htmlContent,
    });

    console.log(`[Dynamic SMTP Service] Successfully dispatched enquiry #${enquiry.id} to ${salesEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    console.warn('[Dynamic SMTP Service] Warning: Failed to deliver SMTP notification, falling back to logger:', err);
    // Non-blocking: never fail the user's enquiry submission if external SMTP fails
    return { success: true, fallback: true };
  }
}


export async function sendCustomerThankYouEmail(enquiry: EmailEnquiryPayload): Promise<void> {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SALES_EMAIL'] } }
    });
    const settingsMap = settings.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {} as Record<string, string>);
    const smtpHost = settingsMap['SMTP_HOST'] || process.env.SMTP_HOST;
    const smtpUser = settingsMap['SMTP_USER'] || process.env.SMTP_USER;
    const smtpPass = settingsMap['SMTP_PASS'] || process.env.SMTP_PASS;
    const smtpFrom = settingsMap['SMTP_FROM'] || process.env.SMTP_FROM || 'Commercial Engineering Associates <sales@commercialeng.com>';
    if (!smtpHost || !smtpUser || !smtpPass || smtpPass === 'placeholder' || smtpPass === 'app_password_placeholder') return;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(settingsMap['SMTP_PORT'] || process.env.SMTP_PORT || 587),
      secure: Number(settingsMap['SMTP_PORT']) === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%); color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Commercial Engineering Associates</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Industrial Tapes, Sealants & Adhesives</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Thank You for Your Enquiry!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Dear ${enquiry.name},<br/><br/>
            We have successfully received your request for quotation (Enquiry Reference: <strong>#${enquiry.id.slice(-6).toUpperCase()}</strong>).
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Our technical sales team is currently reviewing your requirements. We aim to respond within 24 hours with product recommendations, datasheets, or a formal commercial quotation.
          </p>
          <div style="margin-top: 32px; padding: 16px; background-color: #f8fafc; border-left: 4px solid #b91c1c; border-radius: 0 4px 4px 0;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #334155; text-transform: uppercase;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.6;">
              <li>A technical specialist will be assigned to your case.</li>
              <li>You may receive a call for any clarifications.</li>
              <li>A formal quotation will be sent to this email address.</li>
            </ul>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">
            Need immediate assistance? Reply to this email or call us directly.<br/>
            <strong>Commercial Engineering Associates</strong>
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: smtpFrom,
      to: enquiry.email,
      subject: `Enquiry Received - Commercial Engineering Associates (#${enquiry.id.slice(-6).toUpperCase()})`,
      html: htmlContent,
    });
    console.log(`[Dynamic SMTP] Sent thank you email to ${enquiry.email}`);
  } catch(e) { console.error('Failed to send thank you email:', e); }
}
