# Project: Analytics Module for Commercial Engineering Associates

## Architecture
- **Root-level Module Boundary**: `modules/analytics/` encapsulates all domain models, data access queries, metric calculations, and visualization components for the analytics capability.
- **Strict File Segregation**:
  - `modules/analytics/index.ts`: Public API barrel facade.
  - `modules/analytics/analytics.types.ts`: Domain and DTO type definitions.
  - `modules/analytics/analytics.lib.ts`: Pure mathematical aggregations, date bucketing, percentage calculations (zero DB/React imports).
  - `modules/analytics/get.analytics.action.ts`: Server action orchestrator (`"use server"`).
  - `modules/analytics/queries/`: Granular data access queries importing `prisma` from `@/lib/prisma`.
  - `modules/analytics/components/`: Modular presentation components adhering to light red-and-white theme using pure Tailwind CSS and native SVG.
  - `modules/analytics/analytics.dashboard.tsx`: Main composite dashboard view.
- **Admin UI Integration Boundary**:
  - `app/admin/analytics/page.tsx`: Protected Server Component route rendering `<AnalyticsDashboard />`.
  - `app/admin/layout.tsx`: Navigation bar integration via `navLinks`.
  - `app/admin/page.tsx`: Quick-access analytics overview link.
  - `tailwind.config.ts`: Added `./modules/**/*.{js,ts,jsx,tsx,mdx}` content path.
- **Testing & Verification Boundary**:
  - `scripts/validate-analytics-architecture.ts`: Programmatic test enforcing strict segregation, line limits, and structural rules.
  - `tests/e2e/09-analytics-module.spec.ts`: Non-breaking Playwright test verifying the Analytics route, authentication, UI rendering, and light-theme compliance.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Analytics Contracts & Types | DTOs for Summary, Top Products, Categories, Trends, Statuses | M1 | ORIGINAL_REQUEST R1/R2 |
| 2 | Pure Calculation Library | Mathematical calculations, date bucketing, zero-division guards | M1 | ORIGINAL_REQUEST R1/R2 |
| 3 | Granular Prisma Queries | 5 dedicated query files under `modules/analytics/queries/` | M1 | ORIGINAL_REQUEST R1/R2 |
| 4 | Server Action & Public Facade | `get.analytics.action.ts` and `index.ts` public exports | M1 | ORIGINAL_REQUEST R2 |
| 5 | Segregated UI Components | Metric cards, product table, category breakdown, trend charts | M1 | ORIGINAL_REQUEST R1/R2 |
| 6 | Composite Dashboard Component | `analytics.dashboard.tsx` assembling modular UI components | M1 | ORIGINAL_REQUEST R1/R2 |
| 7 | Admin Route & Page | `app/admin/analytics/page.tsx` protected server route | M1 | ORIGINAL_REQUEST R1/R3 |
| 8 | Admin Navigation Tab | Add `{ href: "/admin/analytics", label: "Analytics" }` to `navLinks` | M1 | ORIGINAL_REQUEST R3 |
| 9 | Tailwind Content Path | Include `./modules/**` in `tailwind.config.ts` | M1 | Survey Explorer 2 |
| 10 | Programmatic Architecture Test | `scripts/validate-analytics-architecture.ts` validating modular rules | M2 | ORIGINAL_REQUEST Acceptance |
| 11 | Analytics E2E Playwright Suite | `tests/e2e/09-analytics-module.spec.ts` testing analytics portal | M2 | ORIGINAL_REQUEST Acceptance |
| 12 | Regression & Build Verification | 100% green on `npm run test:e2e`, `npm run build`, `npm run typecheck` | M2 | ORIGINAL_REQUEST Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Analytics Module & Admin Integration | Root `modules/analytics/` (types, lib, queries, action, components, index) + `app/admin/analytics/page.tsx`, `app/admin/layout.tsx` navLinks, `tailwind.config.ts` | none | IN_PROGRESS |
| 2 | M2: Final Milestone - Architecture Validator & E2E Verification | Programmatic architecture test script, Playwright E2E suite, 0 regressions on build/typecheck/existing 69 tests | M1 | PLANNED |

## Interface Contracts
### `modules/analytics/analytics.types.ts`
```typescript
export interface AnalyticsSummary {
  totalEnquiries: number;
  totalEnquiryItems: number;
  pendingEnquiries: number;
  contactedEnquiries: number;
  closedEnquiries: number;
  responseRate: number; // percentage
}

export interface TopProductMetric {
  productId: string;
  productName: string;
  categoryName: string;
  enquiryCount: number;
  totalQuantity: number;
  percentageOfTotal: number;
}

export interface CategoryDistributionMetric {
  categoryId: string;
  categoryName: string;
  productCount: number;
  enquiryItemCount: number;
  sharePercentage: number;
}

export interface ActivityTrendPoint {
  date: string; // YYYY-MM-DD
  enquiries: number;
  items: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  topProducts: TopProductMetric[];
  categoryDistribution: CategoryDistributionMetric[];
  activityTrends: ActivityTrendPoint[];
  statusBreakdown: { status: string; count: number; percentage: number }[];
  dateRange: { start: string; end: string; days: number };
}

export interface AnalyticsFilterParams {
  days?: number; // e.g. 7, 30, 90 (default 30)
}
```

### `modules/analytics/analytics.lib.ts`
- `calculateSummary(enquiries, items): AnalyticsSummary`
- `calculateTopProducts(items, products, limit?): TopProductMetric[]`
- `calculateCategoryDistribution(items, categories, products): CategoryDistributionMetric[]`
- `calculateActivityTrends(enquiries, days): ActivityTrendPoint[]`
- `calculateStatusBreakdown(enquiries): { status: string; count: number; percentage: number }[]`

### `modules/analytics/get.analytics.action.ts`
- `export async function getAnalytics(params?: AnalyticsFilterParams): Promise<AnalyticsData>`

## Code Layout
```
modules/analytics/
├── index.ts
├── analytics.types.ts
├── analytics.lib.ts
├── get.analytics.action.ts
├── analytics.dashboard.tsx
├── queries/
│   ├── index.ts
│   ├── get-summary.query.ts
│   ├── get-top-products.query.ts
│   ├── get-category-distribution.query.ts
│   ├── get-activity-trends.query.ts
│   └── get-status-breakdown.query.ts
└── components/
    ├── index.ts
    ├── summary-cards.component.tsx
    ├── top-products-table.component.tsx
    ├── category-distribution.component.tsx
    ├── activity-trends.component.tsx
    ├── status-breakdown.component.tsx
    └── date-filter.component.tsx

app/admin/analytics/
└── page.tsx

scripts/
└── validate-analytics-architecture.ts

tests/e2e/
└── 09-analytics-module.spec.ts
```
