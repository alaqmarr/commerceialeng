/**
 * modules/settings/queries/get-smtp-settings.query.ts
 * Query to retrieve typed Nodemailer SMTP settings.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import { parseSettingsMap, formatSmtpSettings } from "../settings.lib";
import type { SMTPSettingsDTO } from "../settings.types";

export async function getSmtpSettingsQuery(): Promise<SMTPSettingsDTO> {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          "SMTP_HOST",
          "SMTP_PORT",
          "SMTP_USER",
          "SMTP_PASS",
          "SMTP_FROM",
          "SALES_EMAIL",
        ],
      },
    },
  });
  const map = parseSettingsMap(settings);
  return formatSmtpSettings(map);
}

export const getSmtpSettings = getSmtpSettingsQuery;
