# Project: Commercial Engineering Associates Website

## Architecture
- **Framework**: Next.js 16.4.0 (App Router), React 19.3.0, TypeScript
- **Styling & Design System**: Tailwind CSS v4, Lucide React icons, industrial tapes & sealants theme (slate-900, amber-500, industrial caution accents, technical grid patterns)
- **Database Engine**: SQLite (`prisma/dev.db`) managed via Prisma ORM 6.19.3
  - Enforced WAL Mode (`PRAGMA journal_mode = WAL;`, `PRAGMA busy_timeout = 5000;`, `PRAGMA synchronous = NORMAL;`)
- **Authentication**: NextAuth.js 4.24.15 (CredentialsProvider, session JWT, bcryptjs password hashing)
- **Object Storage**: Cloudflare R2 via `@aws-sdk/client-s3` (S3 API: `dea007631f3af58f9336129089cc2f14.r2.cloudflarestorage.com`, Bucket: `projects-bucket`, Public CDN: `https://pub-723d911c6a3442c78b2f69b731577d2b.r2.dev`)
- **Upload UI**: `react-dropzone` 20.1.2 with client-side drag-and-drop preview
- **Enquiry & Communications**:
  - Direct WhatsApp URL builder with pre-filled enquiry message
  - Direct Email modal / mailto trigger
  - Enquiry Cart drawer with client-side persistence (localStorage)
  - RFQ Cart Checkout submitting to `/api/enquiries`
  - Dynamic Nodemailer SMTP dispatch loading host/port/user/pass from DB `Setting` with fallback logger
- **Deployment Artifacts**: Production `Dockerfile` and `docker-compose.yml` for VPS hosting

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | App Foundation & Next.js 16 Setup | Next.js 16 App Router scaffold, Tailwind CSS, TypeScript config, layout & metadata | M1 | ORIGINAL_REQUEST §R1 |
| 2 | SQLite Prisma WAL Database Engine | Prisma schema with 8 models, WAL mode pragma enforcement (`lib/prisma.ts`), migrations | M1 | ORIGINAL_REQUEST §R1 |
| 3 | NextAuth & Bcrypt Authentication | Credentials authentication, bcryptjs password hashing, JWT session, protected admin routes | M1 | ORIGINAL_REQUEST §R1 |
| 4 | One-Time `/setup` Admin Initialization | Public setup route to create initial admin account, self-locking once admin exists | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Cloudflare R2 Storage Infrastructure | S3 client service (`lib/r2.ts`), image upload API `/api/admin/upload`, R2 credentials integration | M2 | ORIGINAL_REQUEST §R4, R5 |
| 6 | Image Upload Component | Drag-and-drop file upload using `react-dropzone` with progress preview and R2 CDN URL output | M2 | ORIGINAL_REQUEST §R4 |
| 7 | Admin Categories & Use-Cases CRUD | Management UI and API routes for categories and industrial use-cases | M2 | ORIGINAL_REQUEST §R4 |
| 8 | Admin Product Catalog CRUD | Full product management with category assignment, use-case mapping, technical specs, and R2 images | M2 | ORIGINAL_REQUEST §R4 |
| 9 | Admin Hero Slides & Settings CRUD | CRUD for homepage hero carousel slides and dynamic contact/SMTP settings | M2 | ORIGINAL_REQUEST §R4 |
| 10 | Industrial Visual Identity & Theme | Industrial tapes/sealants motifs, technical grid accents, professional engineering aesthetic | M3 | ORIGINAL_REQUEST §R2 |
| 11 | Homepage with Dynamic Hero Slider | Database-controlled scrolling image carousel (`HeroImage`), featured products, categories, use-cases | M3 | ORIGINAL_REQUEST §R2 |
| 12 | Public Product Catalog & Detail Pages | `/products` with filtering/search, and `/products/[id]` with technical specification table & images | M3 | ORIGINAL_REQUEST §R2 |
| 13 | Public Categories & Detail Pages | `/categories` and `/categories/[id]` listing associated products | M3 | ORIGINAL_REQUEST §R2 |
| 14 | Public Use-Cases & Detail Pages | `/use-cases` and `/use-cases/[id]` listing relevant engineering applications and products | M3 | ORIGINAL_REQUEST §R2 |
| 15 | Dynamic Contact Page | `/contact` displaying dynamic phone, email, WhatsApp, and physical address from DB `Setting` | M3 | ORIGINAL_REQUEST §R2 |
| 16 | Direct Enquiry Actions | "Enquire on WhatsApp" pre-filled link and "Email Enquiry" modal on product detail pages | M4 | ORIGINAL_REQUEST §R3 |
| 17 | Persistent Enquiry Cart System | "Add to Cart", sliding drawer, localStorage persistence, quantity adjustments, RFQ summary | M4 | ORIGINAL_REQUEST §R3 |
| 18 | Enquiry Submission API & Persistence | `/api/enquiries` endpoint saving enquiry and item lines to SQLite database (`Enquiry`, `EnquiryItem`) | M4 | ORIGINAL_REQUEST §R3 |
| 19 | Dynamic SMTP Notification Service | Nodemailer email dispatch to sales email using dynamic DB SMTP configuration with fallback | M4 | ORIGINAL_REQUEST §R3 |
| 20 | E2E Testing Infrastructure | Playwright test harness, webServer configuration, test runner scripts | T-E2E | ORIGINAL_REQUEST §Testing |
| 21 | E2E Test Suite (Tiers 1-4) | Comprehensive opaque-box test suites covering setup, auth, CRUD, R2, cart, crawl, and WAL | T-E2E | ORIGINAL_REQUEST §Testing |
| 22 | Final Verification & Hardening | 100% E2E test pass across all tiers, adversarial coverage hardening, and forensic audit | M5 | ORIGINAL_REQUEST §Acceptance |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | App Foundation, Prisma WAL & Auth | Next.js 16 app scaffold, Tailwind, Prisma schema, SQLite WAL pragma, NextAuth bcryptjs, `/setup` route & lock | none | DONE |
| M2 | Cloudflare R2 Media & Admin Dashboard | S3 client (`lib/r2.ts`), `/api/admin/upload`, `react-dropzone`, Admin CRUD for Products, Categories, Use-Cases, Hero Slides, Settings, Enquiries | M1 | DONE |
| M3 | Public Engineering Website & Theme | Industrial tapes/sealants theme, Homepage hero carousel, `/products`, `/products/[id]`, `/categories`, `/categories/[id]`, `/use-cases`, `/use-cases/[id]`, `/contact` | M1, M2 | DONE |
| M4 | Enquiry Cart & Dynamic SMTP System | Direct WhatsApp button, Email modal, Enquiry Cart drawer, `/api/enquiries` DB persistence, Nodemailer dynamic SMTP dispatch | M1, M2, M3 | DONE |
| T-E2E | E2E Testing Track (Playwright Suite) | Playwright harness, Tiers 1-4 tests (setup, auth, CRUD, R2 upload, public navigation, cart RFQ, crawler 200 checks, WAL verification), publish `TEST_READY.md` | M1 | DONE |
| M5 | Final Milestone: 100% E2E Pass & Hardening | Phase 1: Pass 100% of E2E test suite (Tiers 1-4); Phase 2: Adversarial coverage hardening (Tier 5) with Challenger, Reviewer, and Forensic Auditor verification | M4, T-E2E | IN_PROGRESS |

---

## Interface Contracts

### 1. Database Entities (`prisma/schema.prisma`)
```prisma
model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  imageUrl    String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model UseCase {
  id          String           @id @default(cuid())
  title       String           @unique
  slug        String           @unique
  description String
  imageUrl    String?
  products    ProductUseCase[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model Product {
  id             String           @id @default(cuid())
  name           String
  slug           String           @unique
  description    String
  shortDesc      String?
  specifications String?          // JSON string: Record<string, string> e.g. {"Adhesion": "25 N/25mm"}
  imageUrl       String?
  galleryImages  String?          // JSON string: string[]
  categoryId     String
  category       Category         @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  useCases       ProductUseCase[]
  enquiryItems   EnquiryItem[]
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

model ProductUseCase {
  productId String
  useCaseId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  useCase   UseCase @relation(fields: [useCaseId], references: [id], onDelete: Cascade)

  @@id([productId, useCaseId])
}

model HeroImage {
  id        String   @id @default(cuid())
  title     String
  subtitle  String?
  imageUrl  String
  linkUrl   String?
  order     Int      @default(0)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Setting {
  key         String   @id // e.g. "COMPANY_PHONE", "WHATSAPP_NUMBER", "SALES_EMAIL", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"
  value       String
  description String?
  updatedAt   DateTime @updatedAt
}

model Enquiry {
  id          String        @id @default(cuid())
  name        String
  email       String
  phone       String?
  company     String?
  message     String?
  status      String        @default("PENDING") // PENDING, CONTACTED, CLOSED
  items       EnquiryItem[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model EnquiryItem {
  id        String   @id @default(cuid())
  enquiryId String
  productId String
  quantity  Int      @default(1)
  notes     String?
  enquiry   Enquiry  @relation(fields: [enquiryId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

### 2. Cloudflare R2 Storage Interface (`lib/r2.ts`)
```typescript
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; key: string }>

export async function deleteFromR2(key: string): Promise<void>
```
- Endpoint: `https://dea007631f3af58f9336129089cc2f14.r2.cloudflarestorage.com`
- Bucket: `projects-bucket`
- Public CDN URL output: `https://pub-723d911c6a3442c78b2f69b731577d2b.r2.dev/${key}`

### 3. Database Prisma Client & WAL Pragma (`lib/prisma.ts`)
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = global.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

// Enforce WAL mode on startup
prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;').catch(console.error)
prisma.$executeRawUnsafe('PRAGMA busy_timeout = 5000;').catch(console.error)
prisma.$executeRawUnsafe('PRAGMA synchronous = NORMAL;').catch(console.error)

export default prisma
```

### 4. API Endpoints
- `POST /api/setup`: `{ email, password, name }` -> returns `{ success: true }` or `{ error: "Setup already completed" }` (403)
- `GET /api/setup/status`: returns `{ isSetup: boolean }`
- `POST /api/auth/[...nextauth]`: NextAuth credentials sign-in
- `POST /api/admin/upload`: `multipart/form-data` with `file` -> returns `{ url, key }` (Protected)
- `POST /api/enquiries`: `{ name, email, phone, company, message, items: [{ productId, quantity, notes }] }` -> persists to DB, triggers SMTP email, returns `{ success: true, enquiryId }`
- `GET /api/settings/public`: returns public contact details (`whatsapp`, `phone`, `email`, `address`)

---

## Code Layout
```
c:\Users\DELL\Downloads\commerceialeng\
├── app/
│   ├── layout.tsx
│   ├── page.tsx                           // Homepage with DB hero slider & industrial motif
│   ├── setup/page.tsx                     // First-run admin initialization
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── layout.tsx                     // Protected admin shell
│   │   ├── page.tsx                       // Overview & metric cards
│   │   ├── products/                      // Products list & edit/new modal
│   │   ├── categories/                    // Categories CRUD
│   │   ├── use-cases/                     // Use-cases CRUD
│   │   ├── hero/                          // Hero image slides CRUD
│   │   ├── settings/                      // Contact & SMTP settings CRUD
│   │   └── enquiries/                     // Enquiry inbox
│   ├── products/
│   │   ├── page.tsx                       // Catalog filter & search
│   │   └── [id]/page.tsx                  // Product detail & spec table
│   ├── categories/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── use-cases/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── contact/page.tsx                   // Dynamic contact page
│   ├── cart/page.tsx                      // Full cart & RFQ checkout page
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── setup/route.ts
│       ├── setup/status/route.ts
│       ├── enquiries/route.ts
│       ├── settings/public/route.ts
│       └── admin/
│           ├── upload/route.ts
│           ├── products/[id]/route.ts
│           ├── categories/[id]/route.ts
│           ├── use-cases/[id]/route.ts
│           ├── hero/[id]/route.ts
│           └── settings/route.ts
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── HeroSlider.tsx
│   ├── ProductCard.tsx
│   ├── ImageUpload.tsx                    // react-dropzone integration
│   ├── EnquiryCartDrawer.tsx              // Sliding drawer cart
│   ├── WhatsAppEnquiryButton.tsx
│   └── EmailEnquiryModal.tsx
├── context/
│   ├── CartContext.tsx
│   └── AuthProvider.tsx
├── lib/
│   ├── prisma.ts                          // Prisma client with WAL pragma
│   ├── r2.ts                              // Cloudflare R2 S3 SDK
│   ├── auth.ts                            // NextAuth options
│   └── email.ts                           // Nodemailer dynamic SMTP dispatcher
├── prisma/
│   ├── schema.prisma
│   └── dev.db
├── tests/
│   └── e2e/
│       ├── 01-setup-and-auth.spec.ts
│       ├── 02-admin-crud-r2.spec.ts
│       ├── 03-public-navigation.spec.ts
│       ├── 04-enquiry-cart.spec.ts
│       ├── 05-route-crawler.spec.ts
│       └── 06-wal-and-settings.spec.ts
├── playwright.config.ts
├── next.config.ts
├── Dockerfile
├── docker-compose.yml
└── package.json
```
