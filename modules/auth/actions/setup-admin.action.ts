"use server";

/**
 * modules/auth/actions/setup-admin.action.ts
 * Server Action for first-run administrator creation and setup initialization.
 * Strictly under 200 lines.
 */

import bcrypt from "bcryptjs";
import { countAdminsQuery, createAdminUserQuery, seedInitialSettingsQuery } from "../queries";
import { normalizeEmail, validateSetupInput } from "../auth.lib";
import type { SetupAdminInput, AuthResult, AdminUserDTO } from "../auth.types";

export async function setupAdminAction(
  input: SetupAdminInput
): Promise<AuthResult<AdminUserDTO>> {
  try {
    // 1. One-time setup lockout enforcement
    const adminCount = await countAdminsQuery();
    if (adminCount > 0) {
      return {
        success: false,
        status: 403,
        error: "Setup already completed. Initial setup is permanently locked.",
      };
    }

    // 2. Pure input validation
    const validation = validateSetupInput(input);
    if (!validation.isValid) {
      return {
        success: false,
        status: 400,
        error: validation.error || "Invalid administrator input",
      };
    }

    const normalizedEmail = normalizeEmail(input.email);
    const adminName = input.name && input.name.trim() ? input.name.trim() : "Administrator";

    // 3. Hash password with bcryptjs (12 rounds)
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // 4. Create primary administrator account
    const admin = await createAdminUserQuery({
      email: normalizedEmail,
      name: adminName,
      passwordHash: hashedPassword,
    });

    // 5. Seed default system settings in Setting table
    await seedInitialSettingsQuery(normalizedEmail);

    return {
      success: true,
      status: 201,
      message: "Admin account initialized successfully",
      data: admin,
    };
  } catch (error: any) {
    console.error("[setupAdminAction Error]:", error);
    if (error?.code === "P2002") {
      return {
        success: false,
        status: 409,
        error: "An admin account with this email already exists",
      };
    }
    return {
      success: false,
      status: 500,
      error: "Internal server error during setup initialization",
    };
  }
}
