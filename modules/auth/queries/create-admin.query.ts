/**
 * modules/auth/queries/create-admin.query.ts
 * Queries to create administrator accounts and seed initial settings.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import type { AdminUserDTO } from "../auth.types";
import { sanitizeAdminUser } from "../auth.lib";

export async function createAdminUserQuery(data: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<AdminUserDTO> {
  const admin = await prisma.adminUser.create({
    data: {
      email: data.email,
      name: data.name,
      password: data.passwordHash,
    },
  });
  return sanitizeAdminUser(admin);
}

export async function seedInitialSettingsQuery(adminEmail: string): Promise<void> {
  const defaultSettings = [
    { key: "COMPANY_NAME", value: "Commercial Engineering Associates", description: "Company legal name" },
    { key: "COMPANY_PHONE", value: "+91 98765 43210", description: "Primary contact phone" },
    { key: "WHATSAPP_NUMBER", value: "919876543210", description: "WhatsApp international format" },
    { key: "SALES_EMAIL", value: adminEmail, description: "Sales notification email" },
    { key: "COMPANY_ADDRESS", value: "Plot 42, Phase II, Industrial Area, Sector 58, Industrial Corridors, 110020", description: "Head office address" },
    { key: "SMTP_HOST", value: "smtp.gmail.com", description: "SMTP server host" },
    { key: "SMTP_PORT", value: "587", description: "SMTP server port" },
    { key: "SMTP_USER", value: "", description: "SMTP username" },
    { key: "SMTP_PASS", value: "", description: "SMTP password" },
  ];

  await prisma.$transaction(
    defaultSettings.map((setting) =>
      prisma.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      })
    )
  );
}
