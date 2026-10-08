/**
 * modules/enquiries/index.ts
 * Public entrypoint and contracts for the Enquiries & Cart domain.
 * Strictly under 200 lines.
 */

// Types & DTOs
export * from './enquiries.types';

// Pure Business Logic (Zero DB, Zero React)
export * from './enquiries.lib';

// Prisma Queries
export * from './queries';

// Server Actions
export * from './enquiry.actions';

// Presentation Components
export * from './components';
