/**
 * modules/settings/settings.types.ts
 * Domain DTOs and contracts for System, Contact, and SMTP Settings.
 * Strictly under 200 lines.
 */

export interface SettingDTO {
  key: string;
  value: string;
  description?: string | null;
  updatedAt?: Date | string;
}

export type SettingsMap = Record<string, string>;

export interface ContactSettingsDTO {
  companyName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  businessHours: string;
  cleanWhatsapp: string;
  cleanPhone: string;
  departmentContacts?: string;
  bankDetails?: string;
  mapLocation?: string;
  defaultTerms?: string;
}

export interface SMTPSettingsDTO {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  salesEmail: string;
  isPlaceholder: boolean;
}

export interface SystemSettingsDTO {
  contact: ContactSettingsDTO;
  smtp: SMTPSettingsDTO;
  rawMap: SettingsMap;
}

export interface UpdateSettingsInput {
  settings?: SettingsMap;
  key?: string;
  value?: string;
  description?: string;
}

export interface SettingsActionResult {
  success: boolean;
  settings?: SettingDTO[];
  settingsMap?: SettingsMap;
  error?: string;
}

export interface BackupDataDTO {
  categories: any[];
  useCases: any[];
  products: any[];
  heroImages: any[];
  exportedAt: string;
}
