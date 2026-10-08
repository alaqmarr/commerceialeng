/**
 * modules/auth/index.ts
 * Public facade barrel export for the Auth module.
 * Strictly under 200 lines.
 */

// 1. Domain Types & Contracts
export * from "./auth.types";

// 2. Pure Business Logic & Helpers (Zero DB/React imports)
export * from "./auth.lib";

// 3. Database Queries
export * from "./queries";

// 4. Server Actions
export * from "./actions";

// 5. NextAuth Configuration & Helpers
export * from "./auth.config";

// 6. Presentation Components
export * from "./components";
