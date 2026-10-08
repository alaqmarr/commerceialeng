/**
 * modules/analytics/analytics.lib.ts
 * Pure mathematical aggregation and transformation functions for Analytics.
 * Strict constraint: ZERO database or React imports. 100% pure TypeScript.
 * Strictly under 200 lines.
 */

import type {
  AnalyticsSummary, TopProductMetric, CategoryDistributionMetric,
  ActivityTrendPoint, StatusBreakdownMetric, RawEnquiry, RawEnquiryItem,
  RawProduct, RawCategory, SummaryCalcInput, CategoryCalcInput,
} from "./analytics.types";

export function safePercentage(num: number, den: number, decimals: number = 1): number {
  return (!den || den <= 0) ? 0 : Number(((num / den) * 100).toFixed(decimals));
}

export function calculateSummary(enquiries: SummaryCalcInput, items?: RawEnquiryItem[] | number): AnalyticsSummary {
  if (enquiries && !Array.isArray(enquiries) && typeof enquiries === "object") {
    const total = enquiries.totalEnquiries || 0;
    const contacted = enquiries.contactedEnquiries || 0;
    const closed = enquiries.closedEnquiries || 0;
    return {
      totalEnquiries: total,
      totalEnquiryItems: enquiries.totalRequestedQuantity ?? enquiries.totalEnquiryItems ?? 0,
      pendingEnquiries: enquiries.pendingEnquiries || 0,
      contactedEnquiries: contacted,
      closedEnquiries: closed,
      responseRate: safePercentage(contacted + closed, total),
    };
  }

  const list = Array.isArray(enquiries) ? enquiries : [];
  let pending = 0, contacted = 0, closed = 0, totalItems = 0;

  for (const enq of list) {
    const s = (enq.status || "").toUpperCase();
    if (s === "PENDING") pending++;
    else if (s === "CONTACTED") contacted++;
    else if (s === "CLOSED") closed++;
    if (!items && Array.isArray(enq.items)) {
      totalItems += enq.items.reduce((acc, it) => acc + (it.quantity > 0 ? it.quantity : 1), 0);
    }
  }

  if (typeof items === "number") totalItems = Math.max(0, items);
  else if (Array.isArray(items)) totalItems = items.reduce((acc, it) => acc + (it.quantity > 0 ? it.quantity : 1), 0);

  return {
    totalEnquiries: list.length,
    totalEnquiryItems: totalItems,
    pendingEnquiries: pending,
    contactedEnquiries: contacted,
    closedEnquiries: closed,
    responseRate: safePercentage(contacted + closed, list.length),
  };
}

export function calculateTopProducts(items: RawEnquiryItem[], products?: RawProduct[], limit: number = 5): TopProductMetric[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  const pMap = new Map<string, RawProduct>();
  if (Array.isArray(products)) for (const p of products) if (p.id) pMap.set(p.id, p);

  const map = new Map<string, { productId: string; productName: string; categoryName: string; enquiryCount: number; totalQuantity: number }>();
  let grandTotal = 0;
  for (const item of items) {
    const pid = item.productId || item.product?.id || "unknown";
    const qty = typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1;
    grandTotal += qty;
    const existing = map.get(pid);
    if (existing) {
      existing.totalQuantity += qty;
      existing.enquiryCount += 1;
    } else {
      const fb = pMap.get(pid);
      const name = item.product?.name || fb?.name || "Deleted / Unknown Product";
      const cat = item.product?.category?.name || fb?.category?.name || "Uncategorized";
      map.set(pid, { productId: pid, productName: name, categoryName: cat, enquiryCount: 1, totalQuantity: qty });
    }
  }

  const result: TopProductMetric[] = Array.from(map.values()).map((entry) => ({
    ...entry,
    percentageOfTotal: safePercentage(entry.totalQuantity, grandTotal),
  }));
  result.sort((a, b) => b.totalQuantity - a.totalQuantity || b.enquiryCount - a.enquiryCount);
  return limit > 0 ? result.slice(0, limit) : result;
}

export function calculateCategoryDistribution(items: CategoryCalcInput, categories?: RawCategory[]): CategoryDistributionMetric[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  const first = items[0] as any;
  if (first && "categoryId" in first && "enquiryItemCount" in first) {
    const totalItems = items.reduce((sum: number, c: any) => sum + (c.enquiryItemCount || 0), 0);
    const result = (items as any[]).map((c) => ({
      categoryId: c.categoryId,
      categoryName: c.categoryName || "Uncategorized",
      productCount: c.productCount || 0,
      enquiryItemCount: c.enquiryItemCount || 0,
      sharePercentage: safePercentage(c.enquiryItemCount || 0, totalItems),
    }));
    result.sort((a, b) => b.enquiryItemCount - a.enquiryItemCount);
    return result;
  }

  const catMap = new Map<string, { categoryId: string; categoryName: string; productCount: number; enquiryItemCount: number }>();
  if (Array.isArray(categories)) {
    for (const cat of categories) {
      if (cat.id) catMap.set(cat.id, {
        categoryId: cat.id,
        categoryName: cat.name || "Unnamed Category",
        productCount: cat.products?.length ?? cat._count?.products ?? 0,
        enquiryItemCount: 0,
      });
    }
  }

  let totalItemCount = 0;
  for (const item of items as RawEnquiryItem[]) {
    const qty = typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1;
    totalItemCount += qty;
    const catId = item.product?.category?.id || "uncategorized";
    const existing = catMap.get(catId);
    if (existing) existing.enquiryItemCount += qty;
    else catMap.set(catId, {
      categoryId: catId,
      categoryName: item.product?.category?.name || "Uncategorized",
      productCount: 0,
      enquiryItemCount: qty,
    });
  }

  const result: CategoryDistributionMetric[] = Array.from(catMap.values()).map((entry) => ({
    ...entry,
    sharePercentage: safePercentage(entry.enquiryItemCount, totalItemCount),
  }));
  result.sort((a, b) => b.enquiryItemCount - a.enquiryItemCount);
  return result;
}

export function calculateActivityTrends(enquiries: RawEnquiry[], days: number = 30, endDate: Date = new Date()): ActivityTrendPoint[] {
  const windowDays = Math.max(1, Math.min(365, days || 30));
  const end = new Date(endDate);
  const dateMap = new Map<string, ActivityTrendPoint>();

  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    dateMap.set(key, { date: key, enquiries: 0, items: 0 });
  }

  if (Array.isArray(enquiries)) {
    for (const enq of enquiries) {
      if (!enq.createdAt) continue;
      const d = typeof enq.createdAt === "string" ? new Date(enq.createdAt) : enq.createdAt;
      if (isNaN(d.getTime())) continue;
      const point = dateMap.get(d.toISOString().slice(0, 10));
      if (point) {
        point.enquiries += 1;
        point.items += Array.isArray(enq.items) ? enq.items.reduce((s, it) => s + (it.quantity > 0 ? it.quantity : 1), 0) : 1;
      }
    }
  }
  return Array.from(dateMap.values());
}

export function calculateStatusBreakdown(enquiries: RawEnquiry[] | Array<{ status: string; count: number }>): StatusBreakdownMetric[] {
  const counts: Record<string, number> = { PENDING: 0, CONTACTED: 0, CLOSED: 0 };
  const safe = Array.isArray(enquiries) ? enquiries : [];
  let total = 0;

  if (safe.length > 0 && typeof (safe[0] as any).count === "number") {
    for (const item of safe as Array<{ status: string; count: number }>) {
      const s = (item.status || "").toUpperCase();
      counts[s] = item.count;
      total += item.count;
    }
  } else {
    total = safe.length;
    for (const enq of safe as RawEnquiry[]) {
      const s = (enq.status || "PENDING").toUpperCase();
      counts[s] = (counts[s] || 0) + 1;
    }
  }

  const statuses = ["PENDING", "CONTACTED", "CLOSED"];
  for (const k of Object.keys(counts)) if (!statuses.includes(k)) statuses.push(k);
  return statuses.map((status) => ({
    status,
    count: counts[status] || 0,
    percentage: safePercentage(counts[status] || 0, total),
  }));
}
