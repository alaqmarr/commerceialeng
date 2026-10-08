/**
 * modules/analytics/get.analytics.action.ts
 * Next.js Server Action orchestrator for Analytics.
 * Marked with "use server", coordinates queries and calls pure lib functions.
 * Strictly under 200 lines.
 */

"use server";

import {
  getSummaryQuery,
  getTopProductsQuery,
  getCategoryDistributionQuery,
  getActivityTrendsQuery,
  getStatusBreakdownQuery,
} from "./queries";
import {
  calculateSummary,
  calculateTopProducts,
  calculateCategoryDistribution,
  calculateActivityTrends,
  calculateStatusBreakdown,
} from "./analytics.lib";
import type {
  AnalyticsData,
  AnalyticsFilterParams,
  RawEnquiry,
  RawEnquiryItem,
} from "./analytics.types";

/**
 * Fetches and aggregates all analytics metrics for the requested time window.
 */
export async function getAnalytics(
  params?: AnalyticsFilterParams
): Promise<AnalyticsData> {
  const days = params?.days && params.days > 0 ? params.days : 30;
  const now = new Date();
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1))
  );

  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = now.toISOString().slice(0, 10);

  try {
    const [
      summaryRaw,
      topProductsRaw,
      categoryDistributionRaw,
      activityTrendsRaw,
      statusBreakdownRaw,
    ] = await Promise.all([
      getSummaryQuery(startDate),
      getTopProductsQuery(startDate),
      getCategoryDistributionQuery(startDate),
      getActivityTrendsQuery(startDate, now),
      getStatusBreakdownQuery(startDate),
    ]);

    const summary = calculateSummary(summaryRaw);
    const topProducts = calculateTopProducts(
      (topProductsRaw as unknown as RawEnquiryItem[]) || [],
      undefined,
      5
    );
    const categoryDistribution = calculateCategoryDistribution(
      categoryDistributionRaw || []
    );
    const activityTrends = calculateActivityTrends(
      (activityTrendsRaw as unknown as RawEnquiry[]) || [],
      days,
      now
    );
    const statusBreakdown = calculateStatusBreakdown(statusBreakdownRaw);

    return {
      summary,
      topProducts,
      categoryDistribution,
      activityTrends,
      statusBreakdown,
      dateRange: {
        start: startStr,
        end: endStr,
        days,
      },
    };
  } catch (error) {
    console.error("[getAnalytics] Failed to aggregate analytics data:", error);

    // Fail-safe default return ensuring UI never crashes
    return {
      summary: {
        totalEnquiries: 0,
        totalEnquiryItems: 0,
        pendingEnquiries: 0,
        contactedEnquiries: 0,
        closedEnquiries: 0,
        responseRate: 0,
      },
      topProducts: [],
      categoryDistribution: [],
      activityTrends: calculateActivityTrends([], days, now),
      statusBreakdown: calculateStatusBreakdown([]),
      dateRange: {
        start: startStr,
        end: endStr,
        days,
      },
    };
  }
}
