/**
 * modules/auth/auth.lib.ts
 * Pure business logic and input validation for Authentication.
 * ZERO DATABASE IMPORTS, ZERO REACT IMPORTS.
 * Strictly under 200 lines.
 */

import type { SetupAdminInput, PasswordValidationResult } from "./auth.types";

/**
 * Normalizes email by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  return email ? email.trim().toLowerCase() : "";
}

/**
 * Basic email format verification.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim();
  const atIndex = normalized.indexOf("@");
  if (atIndex < 1 || atIndex === normalized.length - 1) return false;
  return normalized.includes(".");
}

/**
 * Validates password meets minimum security criteria (minimum 8 characters).
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  if (!password || typeof password !== "string" || password.length < 8) {
    errors.push("Password must contain at least 8 characters");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates full setup form input.
 */
export function validateSetupInput(
  input: SetupAdminInput,
  confirmPassword?: string
): { isValid: boolean; error?: string } {
  if (!input.name || !input.name.trim()) {
    return { isValid: false, error: "Please enter an administrator name." };
  }
  if (!input.email || !isValidEmail(input.email)) {
    return { isValid: false, error: "Please provide a valid administrative email address." };
  }
  const passwordValidation = validatePasswordStrength(input.password);
  if (!passwordValidation.isValid) {
    return { isValid: false, error: passwordValidation.errors[0] };
  }
  if (confirmPassword !== undefined && input.password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match. Please re-enter." };
  }
  return { isValid: true };
}

/**
 * Removes sensitive fields (such as password hash) from admin user object.
 */
export function sanitizeAdminUser<T extends { password?: unknown }>(
  user: T
): Omit<T, "password"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return safeUser;
}
