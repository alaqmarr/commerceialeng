/**
 * modules/products/index.ts
 * Public facade barrel export for the Products module.
 * Strictly under 200 lines.
 */

// 1. Domain Types & DTOs
export * from "./products.types";

// 2. Pure Calculation Library & Validation (Zero DB / Zero React imports)
export * from "./products.lib";

// 3. Database Queries
export * from "./queries";

// 4. Server Actions
export * from "./product.actions";

// 5. Presentation Components
export * from "./components";
export { AdminProductManager as default } from "./components/admin-product-manager.component";
