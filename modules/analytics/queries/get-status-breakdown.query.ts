import { prisma } from "@/lib/prisma";

export interface StatusBreakdownQueryParams {
  startDate?: Date;
}

export interface StatusBreakdownRecord {
  status: string;
  count: number;
}

const STANDARD_STATUSES = ["PENDING", "CONTACTED", "CLOSED"] as const;

/**
 * Groups and counts enquiries by status string (PENDING, CONTACTED, CLOSED).
 * Guarantees all standard statuses are represented even if database count is 0.
 * Supports date filtering (createdAt >= startDate).
 */
export async function getStatusBreakdownQuery(
  params?: StatusBreakdownQueryParams | Date
): Promise<StatusBreakdownRecord[]> {
  const startDate = params instanceof Date ? params : params?.startDate;
  const where = startDate ? { createdAt: { gte: startDate } } : undefined;

  // Execute efficient single-roundtrip groupBy in SQLite
  const grouped = await prisma.enquiry.groupBy({
    by: ["status"],
    where,
    _count: {
      _all: true,
    },
  });

  const countMap = new Map<string, number>();
  for (const item of grouped) {
    if (item.status) {
      countMap.set(item.status.toUpperCase(), item._count._all);
    }
  }

  // Ensure standard statuses are always present in predictable order
  const result: StatusBreakdownRecord[] = STANDARD_STATUSES.map((status) => ({
    status,
    count: countMap.get(status) ?? 0,
  }));

  // Preserve any non-standard status values found in database
  for (const [status, count] of countMap.entries()) {
    if (!STANDARD_STATUSES.includes(status as (typeof STANDARD_STATUSES)[number])) {
      result.push({ status, count });
    }
  }

  return result;
}
