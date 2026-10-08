/**
 * modules/settings/queries/get-contact-settings.query.ts
 * Query to retrieve typed contact coordinates.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import { parseSettingsMap, formatContactSettings } from "../settings.lib";
import type { ContactSettingsDTO } from "../settings.types";

export async function getContactSettingsQuery(): Promise<ContactSettingsDTO> {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "COMPANY_NAME",
            "COMPANY_TAGLINE",
            "COMPANY_PHONE",
            "WHATSAPP_NUMBER",
            "SALES_EMAIL",
            "COMPANY_ADDRESS",
            "BUSINESS_HOURS",
            "DEPARTMENT_CONTACTS",
            "BANK_DETAILS",
            "MAP_LOCATION",
            "DEFAULT_TERMS",
          ],
        },
      },
    });
    const map = parseSettingsMap(settings);
    return formatContactSettings(map);
  } catch (err) {
    console.error("[getContactSettingsQuery Error]:", err);
    return formatContactSettings({});
  }
}

export const getContactSettings = getContactSettingsQuery;
