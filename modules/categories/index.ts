/**
 * modules/categories/index.ts
 * Public facade barrel export for the Categories module.
 * Strictly under 200 lines.
 */

// 1. Domain Types & DTOs
export * from "./categories.types";

// 2. Pure Calculation Library & Validation (Zero DB / Zero React imports)
export * from "./categories.lib";

// 3. Database Queries
export * from "./queries";

// 4. Server Actions
export * from "./category.actions";

// 5. Presentation Components
export * from "./components";
export { AdminCategoryManager as default } from "./components/admin-category-manager.component";
