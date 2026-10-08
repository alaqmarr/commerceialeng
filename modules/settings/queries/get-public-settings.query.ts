/**
 * modules/settings/queries/get-public-settings.query.ts
 * Query to fetch public company and contact settings.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";

export interface PublicSettingsDTO {
  companyName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  settingsMap: Record<string, string>;
}

export async function getPublicSettingsQuery(): Promise<PublicSettingsDTO> {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'COMPANY_NAME',
          'COMPANY_TAGLINE',
          'COMPANY_PHONE',
          'WHATSAPP_NUMBER',
          'SALES_EMAIL',
          'COMPANY_ADDRESS',
        ],
      },
    },
  });

  const settingsMap = settings.reduce<Record<string, string>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  return {
    companyName: settingsMap['COMPANY_NAME'] || 'Commercial Engineering Associates',
    tagline: settingsMap['COMPANY_TAGLINE'] || 'Engineered Precision in Industrial Tapes, Sealants & Adhesives',
    phone: settingsMap['COMPANY_PHONE'] || '+91 98765 43210',
    whatsapp: settingsMap['WHATSAPP_NUMBER'] || '+919876543210',
    email: settingsMap['SALES_EMAIL'] || 'sales@commercialeng.com',
    address: settingsMap['COMPANY_ADDRESS'] || 'Plot 42, Phase II, Industrial Area, Sector 58, Industrial Corridors, 110020',
    settingsMap,
  };
}
