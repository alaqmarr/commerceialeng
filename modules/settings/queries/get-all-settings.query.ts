/**
 * modules/settings/queries/get-all-settings.query.ts
 * Query to retrieve all settings rows and format as a key-value map.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import { parseSettingsMap } from "../settings.lib";
import type { SettingDTO, SettingsMap } from "../settings.types";

export async function getAllSettingsQuery(): Promise<{
  settings: SettingDTO[];
  settingsMap: SettingsMap;
}> {
  const settings = await prisma.setting.findMany();
  const settingsMap = parseSettingsMap(settings);
  return { settings, settingsMap };
}
