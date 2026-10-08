"use server";

/**
 * modules/settings/update-settings.action.ts
 * Server Action for updating system and contact/SMTP settings.
 * Strictly under 200 lines.
 */

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { upsertSettingsQuery } from "./queries";
import type { UpdateSettingsInput, SettingsActionResult } from "./settings.types";

export async function updateSettingsAction(
  input: UpdateSettingsInput
): Promise<SettingsActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { settings, settingsMap } = await upsertSettingsQuery(input);
    revalidatePath("/admin/settings");
    revalidatePath("/contact");
    revalidatePath("/");
    return { success: true, settings, settingsMap };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update settings";
    return { success: false, error: msg };
  }
}
