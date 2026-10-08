"use server";

/**
 * modules/auth/actions/check-setup-status.action.ts
 * Server Action to check setup status.
 * Strictly under 200 lines.
 */

import { countAdminsQuery } from "../queries";
import type { SetupStatusDTO } from "../auth.types";

export async function checkSetupStatusAction(): Promise<SetupStatusDTO> {
  const adminCount = await countAdminsQuery();
  return {
    isSetup: adminCount > 0,
    adminCount,
    timestamp: new Date().toISOString(),
  };
}
