/**
 * modules/use-cases/index.ts
 * Public facade barrel export for the Use Cases module.
 * Strictly under 200 lines.
 */

// 1. Domain Types & DTOs
export * from "./use-cases.types";

// 2. Pure Calculation Library & Validation (Zero DB / Zero React imports)
export * from "./use-cases.lib";

// 3. Database Queries
export * from "./queries";

// 4. Server Actions
export * from "./use-case.actions";

// 5. Presentation Components
export * from "./components";
export { AdminUseCaseManager as default } from "./components/admin-use-case-manager.component";
