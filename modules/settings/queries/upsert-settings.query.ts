/**
 * modules/settings/queries/upsert-settings.query.ts
 * Query to upsert system settings (bulk map or single key/value pair).
 * Batched via prisma.$transaction to prevent LibSQL WAL lock timeouts.
 * Strictly under 200 lines.
 */

import prisma from "@/lib/prisma";
import { parseSettingsMap } from "../settings.lib";
import type { SettingDTO, SettingsMap, UpdateSettingsInput } from "../settings.types";

/**
 * Execute database operation with retry for transient LibSQL WAL / lock busy states.
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 150
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const isRetryable =
        message.includes("timed out") ||
        message.includes("busy") ||
        message.includes("BUSY") ||
        message.includes("locked") ||
        message.includes("P2034") ||
        message.includes("P2028");

      if (isRetryable && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function upsertSettingsQuery(
  input: UpdateSettingsInput
): Promise<{ settings: SettingDTO[]; settingsMap: SettingsMap }> {
  return withRetry(async () => {
    let updatedList: SettingDTO[];

    if (input.settings && typeof input.settings === "object") {
      const entries = Object.entries(input.settings).filter(
        ([, val]) => typeof val === "string"
      );

      if (entries.length > 0) {
        const operations = entries.map(([key, val]) =>
          prisma.setting.upsert({
            where: { key },
            update: { value: val as string },
            create: { key, value: val as string },
          })
        );

        // Execute batch writes and retrieve fresh settings atomically
        const results = await prisma.$transaction(
          [...operations, prisma.setting.findMany()],
          { maxWait: 5000, timeout: 10000 }
        );
        updatedList = results[results.length - 1] as SettingDTO[];
      } else {
        updatedList = await prisma.setting.findMany();
      }
    } else if (input.key && typeof input.key === "string") {
      const val = input.value !== undefined ? String(input.value) : "";
      const results = await prisma.$transaction(
        [
          prisma.setting.upsert({
            where: { key: input.key },
            update: {
              value: val,
              description: input.description || undefined,
            },
            create: {
              key: input.key,
              value: val,
              description: input.description || null,
            },
          }),
          prisma.setting.findMany(),
        ],
        { maxWait: 5000, timeout: 10000 }
      );
      updatedList = results[1] as SettingDTO[];
    } else {
      throw new Error(
        "Invalid payload format. Expected { settings: {...} } or { key, value }"
      );
    }

    const updatedMap = parseSettingsMap(updatedList);
    return { settings: updatedList, settingsMap: updatedMap };
  });
}

export const upsertSettings = upsertSettingsQuery;

