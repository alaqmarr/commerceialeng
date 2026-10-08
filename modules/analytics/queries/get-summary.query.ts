import { prisma } from "@/lib/prisma";

export interface SummaryQueryParams {
  startDate?: Date;
}

export interface SummaryQueryResult {
  totalEnquiries: number;
  pendingEnquiries: number;
  contactedEnquiries: number;
  closedEnquiries: number;
  totalEnquiryItems: number;
  totalRequestedQuantity: number;
}

/**
 * Fetches enquiry summary metrics: total count, status counts (PENDING,
 * CONTACTED, CLOSED), and total enquiry items and quantities.
 * Supports optional date window filtering (createdAt >= startDate).
 * Handles empty database states gracefully with zero counts.
 */
export async function getSummaryQuery(
  params?: SummaryQueryParams | Date
): Promise<SummaryQueryResult> {
  const startDate = params instanceof Date ? params : params?.startDate;
  const whereEnquiry = startDate ? { createdAt: { gte: startDate } } : {};
  const whereItem = startDate ? { enquiry: { createdAt: { gte: startDate } } } : {};

  const [
    totalEnquiries,
    pendingEnquiries,
    contactedEnquiries,
    closedEnquiries,
    itemsAgg,
  ] = await Promise.all([
    prisma.enquiry.count({ where: whereEnquiry }),
    prisma.enquiry.count({ where: { ...whereEnquiry, status: "PENDING" } }),
    prisma.enquiry.count({ where: { ...whereEnquiry, status: "CONTACTED" } }),
    prisma.enquiry.count({ where: { ...whereEnquiry, status: "CLOSED" } }),
    prisma.enquiryItem.aggregate({
      where: whereItem,
      _count: { id: true },
      _sum: { quantity: true },
    }),
  ]);

  return {
    totalEnquiries,
    pendingEnquiries,
    contactedEnquiries,
    closedEnquiries,
    totalEnquiryItems: itemsAgg._count.id ?? 0,
    totalRequestedQuantity: itemsAgg._sum.quantity ?? 0,
  };
}
