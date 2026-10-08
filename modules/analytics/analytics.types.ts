/**
 * modules/analytics/analytics.types.ts
 * Domain contracts, DTOs, and raw input types for the Analytics module.
 * Strictly under 200 lines.
 */

// -------------------------------------------------------------
// 1. Core Analytics Output DTO Contracts
// -------------------------------------------------------------

export interface AnalyticsSummary {
  totalEnquiries: number;
  totalEnquiryItems: number;
  pendingEnquiries: number;
  contactedEnquiries: number;
  closedEnquiries: number;
  responseRate: number; // percentage (0 - 100)
}

export interface TopProductMetric {
  productId: string;
  productName: string;
  categoryName: string;
  enquiryCount: number;
  totalQuantity: number;
  percentageOfTotal: number; // percentage (0 - 100)
}

export interface CategoryDistributionMetric {
  categoryId: string;
  categoryName: string;
  productCount: number;
  enquiryItemCount: number;
  sharePercentage: number; // percentage (0 - 100)
}

export interface ActivityTrendPoint {
  date: string; // YYYY-MM-DD (UTC continuous series)
  enquiries: number;
  items: number;
}

export interface StatusBreakdownMetric {
  status: string; // PENDING | CONTACTED | CLOSED
  count: number;
  percentage: number; // percentage (0 - 100)
}

export interface DateRangeInfo {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  days: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  topProducts: TopProductMetric[];
  categoryDistribution: CategoryDistributionMetric[];
  activityTrends: ActivityTrendPoint[];
  statusBreakdown: StatusBreakdownMetric[];
  dateRange: DateRangeInfo;
}

export interface AnalyticsFilterParams {
  days?: number; // e.g. 7, 30, 90 (default: 30)
}

// -------------------------------------------------------------
// 2. Raw Input Types (Used by Queries & Calculation Library)
// -------------------------------------------------------------

export type EnquiryStatusType = "PENDING" | "CONTACTED" | "CLOSED" | string;

export interface RawEnquiryItem {
  id?: string;
  enquiryId?: string;
  productId: string;
  quantity: number;
  notes?: string | null;
  product?: {
    id: string;
    name: string;
    categoryId?: string;
    category?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export interface RawEnquiry {
  id: string;
  status: EnquiryStatusType;
  createdAt: Date | string;
  items?: RawEnquiryItem[];
}

export interface RawProduct {
  id: string;
  name: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

export interface RawCategory {
  id: string;
  name: string;
  products?: Array<{ id: string }>;
  _count?: {
    products?: number;
    enquiryItems?: number;
  };
}

export type SummaryCalcInput = RawEnquiry[] | {
  totalEnquiries: number;
  pendingEnquiries?: number;
  contactedEnquiries?: number;
  closedEnquiries?: number;
  totalEnquiryItems?: number;
  totalRequestedQuantity?: number;
};

export type CategoryCalcInput = RawEnquiryItem[] | Array<{
  categoryId: string;
  categoryName: string;
  productCount: number;
  enquiryItemCount: number;
  totalQuantity?: number;
}>;

export interface RecentEnquiryOverview {
  id: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  status: string;
  itemCount: number;
  createdAt: string;
}

export interface AdminOverviewMetrics {
  totalProducts: number;
  totalCategories: number;
  totalUseCases: number;
  totalHeroSlides: number;
  totalEnquiries: number;
  pendingEnquiries: number;
  recentEnquiries: RecentEnquiryOverview[];
}

