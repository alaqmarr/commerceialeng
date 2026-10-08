/**
 * modules/settings/settings.lib.ts
 * Pure business logic and calculation helpers for Settings.
 * ZERO DATABASE IMPORTS, ZERO REACT IMPORTS.
 * Strictly under 200 lines.
 */

import type { ContactSettingsDTO, SMTPSettingsDTO } from "./settings.types";

/**
 * Converts an array of key-value setting records into a dictionary map.
 */
export function parseSettingsMap(
  settingsList: Array<{ key: string; value: string }>
): Record<string, string> {
  const map: Record<string, string> = {};
  if (!Array.isArray(settingsList)) return map;
  for (const s of settingsList) {
    if (s && typeof s.key === "string") {
      map[s.key] = s.value;
    }
  }
  return map;
}

/**
 * Returns a masked representation of the SMTP password for secure display.
 */
export function maskSmtpPassword(password?: string): string {
  if (!password || password.trim() === "") return "";
  return "••••••••••••";
}

/**
 * Strips non-digits except '+' for tel: links.
 */
export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
}

/**
 * Normalizes digits for WhatsApp click-to-chat links (https://wa.me/...).
 */
export function cleanWhatsappNumber(whatsapp?: string): string {
  if (!whatsapp) return "";
  return whatsapp.replace(/\D/g, "");
}

/**
 * Formats raw settings map into typed contact settings DTO with corporate defaults.
 */
export function formatContactSettings(
  settingsMap: Record<string, string>
): ContactSettingsDTO {
  const companyName = settingsMap["COMPANY_NAME"] || "Commercial Engineering Associates";
  const tagline =
    settingsMap["COMPANY_TAGLINE"] ||
    "Engineered adhesives, industrial tapes, high-performance sealants, and precision thermal materials for automotive, electronics, aerospace, and general fabrication industries.";
  const phone = settingsMap["COMPANY_PHONE"] || "+91 98765 43210";
  const whatsapp = settingsMap["WHATSAPP_NUMBER"] || "919876543210";
  const email = settingsMap["SALES_EMAIL"] || "sales@commercialeng.com";
  const address =
    settingsMap["COMPANY_ADDRESS"] ||
    "Plot 42, Phase II, Industrial Area, Sector 58, Industrial Corridors, 110020";
  const businessHours =
    settingsMap["BUSINESS_HOURS"] || "Monday – Saturday: 9:00 AM – 6:30 PM";

  return {
    companyName,
    tagline,
    phone,
    whatsapp,
    email,
    address,
    businessHours,
    cleanWhatsapp: cleanWhatsappNumber(whatsapp),
    cleanPhone: cleanPhoneNumber(phone),
  };
}

/**
 * Formats raw settings map into typed SMTP settings DTO with detection of placeholders.
 */
export function formatSmtpSettings(
  settingsMap: Record<string, string>
): SMTPSettingsDTO {
  const host = settingsMap["SMTP_HOST"] || "smtp.gmail.com";
  const port = parseInt(settingsMap["SMTP_PORT"] || "587", 10) || 587;
  const user = settingsMap["SMTP_USER"] || "";
  const pass = settingsMap["SMTP_PASS"] || "";
  const from =
    settingsMap["SMTP_FROM"] ||
    "Commercial Engineering Associates <sales@commercialeng.com>";
  const salesEmail = settingsMap["SALES_EMAIL"] || "sales@commercialeng.com";

  const isPlaceholder =
    !pass ||
    pass === "app_password_placeholder" ||
    pass === "placeholder" ||
    pass.trim() === "";

  return {
    host,
    port,
    user,
    pass,
    from,
    salesEmail,
    isPlaceholder,
  };
}

/**
 * Pure validation helper for contact settings input.
 */
export function validateContactInput(
  data: Partial<ContactSettingsDTO>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (data.email && !data.email.includes("@")) {
    errors.push("Invalid email format");
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Pure validation helper for SMTP settings input.
 */
export function validateSmtpInput(
  data: Partial<SMTPSettingsDTO>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (data.port !== undefined && (data.port < 1 || data.port > 65535)) {
    errors.push("SMTP Port must be between 1 and 65535");
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
