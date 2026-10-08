/**
 * modules/hero/index.ts
 * Public facade barrel export for the Hero Carousel module.
 * Strictly under 200 lines.
 */

// 1. Domain Types & DTOs
export * from "./hero.types";

// 2. Pure Calculation Library & Fallbacks (Zero DB/React imports)
export * from "./hero.lib";

// 3. Database Queries
export * from "./queries";

// 4. Server Actions
export * from "./hero-slides.action";

// 5. Presentation Components
export * from "./components";
export { AdminHeroManager as default } from "./components/admin-hero-manager.component";
