# Architecture Guide

## Overview

This project is built using a modern, strictly modular architecture on top of **Next.js 16+ (App Router)** and **React 19**. It utilizes a SQLite database (via Prisma ORM) with a custom WAL (Write-Ahead Logging) strategy to ensure fast, concurrent read/write operations for production environments.

Our architecture strictly adheres to a **Domain-Driven Design (DDD)** philosophy. The goal is to maximize maintainability, testability, and code readability by completely decoupling UI rendering routes from backend business logic.

---

## The Golden Rules of the Architecture

1. **Thin Routes**:
   Files inside the Next.js `app/` directory (`page.tsx`, `route.ts`) must never contain complex logic or massive UI trees. They are strictly "routers" and "orchestrators". They parse parameters, authenticate the user, call the relevant domain module, and return a response.
   _Rule of Thumb: No route or page file should exceed 90 lines of code._

2. **Domain Modules**:
   All business logic, database queries, and complex React components live inside the `modules/` directory. Each domain (e.g., `products`, `enquiries`, `auth`, `users`, `settings`, `analytics`) gets its own isolated folder.

3. **Strict Line Limits**:
   Every file across the entire repository (excluding standard configs like `tailwind.config.ts`) has a strict soft limit of 200 lines. If a file exceeds this, it means the module has taken on too many responsibilities and must be subdivided.

4. **Pure Logic Separation**:
   Files ending in `.lib.ts` contain purely functional business logic (data validation, calculation, text formatting). These files must **never** import React, and must **never** import the Database/Prisma client. This makes them 100% unit-testable.

---

## Directory Structure Breakdown

### 1. `app/` (The Orchestrator layer)

Contains the Next.js App Router definitions.

- `app/(public)/`: Public-facing marketing pages (Home, Products, Contact).
- `app/admin/`: Protected dashboard pages.
- `app/api/`: REST API endpoints used by the dashboard and public forms.
- **Role:** Handles HTTP requests, extracts parameters, verifies sessions, and orchestrates calls to the `modules/`.

### 2. `modules/` (The Domain layer)

The core of the application. Each feature is split into its own module folder.
A standard module folder looks like this (e.g., `modules/enquiries/`):

- `enquiries.types.ts`: TypeScript interfaces and DTOs (Data Transfer Objects).
- `enquiries.lib.ts`: Pure functions (e.g., validating payloads, parsing specs).
- `queries/`: Files that directly interact with Prisma (e.g., `get-enquiry-by-id.query.ts`).
- `components/`: React components specific to this domain (e.g., `contact-form.component.tsx`).
- `index.ts`: The "Barrel Export". This is the **only** file that other parts of the application should import from.

### 3. `components/` (The Global UI layer)

Contains generic, reusable UI components that do not belong to a specific business domain.

- `ui/`: Highly reusable atomic components (e.g., `ios-spinner.tsx`, `button.tsx`).
- `layout/`: Global layout components (e.g., `navbar.component.tsx`, `footer.component.tsx`).

### 4. `prisma/` (The Database layer)

- `schema.prisma`: The single source of truth for our database tables and relationships.
- We utilize SQLite with `PRAGMA journal_mode=WAL;` configured globally via our custom Prisma extension to prevent "Database is locked" errors during high concurrency.

### 5. `context/` (The Global State layer)

Contains global React context providers.

- `CartContext.tsx`: Manages the state of the Request For Quotation (RFQ) shopping cart across the site.

---

## Next.js 16+ Specifics

- **Promisified Params**: In Next.js 16+, `params` and `searchParams` passed to pages and route handlers are Asynchronous Promises. We strictly use `const { id } = await params;` to resolve them before usage to prevent build errors.
- **Server Actions vs API Routes**: We prefer native REST API routes (`app/api/...`) for complex mutations (like quote generation and email sending) rather than inline Server Actions. This keeps our client components pure and allows easy integration with external clients in the future.

## Conclusion

This modular, line-capped, domain-driven approach guarantees that as Commercial Engineering Associates scales, the codebase will remain organized, easily refactorable, and simple for new developers to understand.
