/**
 * modules/settings/index.ts
 * Public facade barrel export for the Settings module.
 * Strictly under 200 lines.
 */

// 1. Domain Types & DTOs
export * from "./settings.types";

// 2. Pure Business Logic & Helpers (Zero DB/React imports)
export * from "./settings.lib";

// 3. Database Queries
export * from "./queries";

// 4. Server Actions
export * from "./update-settings.action";

// 5. Presentation Components
export * from "./components";
export { AdminSettingsManager as default } from "./components/admin-settings-manager.component";

// 6. Hero Carousel Module Re-export (Milestone 1 Dual Compatibility)
export * from "@/modules/hero";
