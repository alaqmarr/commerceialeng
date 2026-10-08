/**
 * modules/analytics/index.ts
 * Public facade barrel export for the Analytics module.
 * Re-exports type contracts, pure calculation functions, server actions, and UI dashboard.
 * Strictly under 200 lines.
 */

// 1. Domain & DTO Contracts
export * from "./analytics.types";

// 2. Pure Calculation Library
export * from "./analytics.lib";

// 3. Server Actions
export { getAnalytics } from "./get.analytics.action";

// 4. Database Queries
export * from "./queries";

// 5. Presentation Dashboard Facade & Components
export { default as AnalyticsDashboard, AnalyticsDashboard as AnalyticsDashboardNamed } from "./analytics.dashboard";
export * from "./components";

