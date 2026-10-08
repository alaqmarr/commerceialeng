/**
 * lib/auth.ts
 * Backward-compatibility shim re-exporting NextAuth configuration from modules/auth.
 * Preserves compatibility with external scripts, middleware, and route handlers.
 */
export { authOptions, getAuthSession } from "@/modules/auth";
