/**
 * modules/auth/auth.types.ts
 * Domain contracts and DTOs for the Authentication & Setup domain.
 * Strictly under 200 lines.
 */

export interface AdminUserDTO {
  id: string;
  email: string;
  name: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface SetupAdminInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  callbackUrl?: string;
}

export interface SetupStatusDTO {
  isSetup: boolean;
  adminCount: number;
  timestamp?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AuthResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
  message?: string;
  status?: number;
}
