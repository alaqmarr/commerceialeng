import { prisma } from "@/lib/prisma";

export interface ActivityTrendsQueryParams {
  startDate?: Date;
  endDate?: Date;
}

export interface ActivityTrendItem {
  id: string;
  quantity: number;
  productId: string;
}

export interface ActivityTrendEnquiry {
  id: string;
  createdAt: Date;
  status: string;
  items: ActivityTrendItem[];
}

/**
 * Fetches enquiries within the requested date window (createdAt >= startDate),
 * selecting id, createdAt, status, and items (quantity, productId).
 * Defaults to 30 days window if startDate is omitted.
 * Returns records chronologically ordered (createdAt asc).
 */
export async function getActivityTrendsQuery(
  params?: ActivityTrendsQueryParams | Date,
  endDateParam?: Date
): Promise<ActivityTrendEnquiry[]> {
  const startDate =
    params instanceof Date
      ? params
      : params?.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const endDate =
    endDateParam instanceof Date
      ? endDateParam
      : params instanceof Date
      ? undefined
      : params?.endDate;

  const where: { createdAt: { gte: Date; lte?: Date } } = {
    createdAt: {
      gte: startDate,
      ...(endDate ? { lte: endDate } : {}),
    },
  };

  const enquiries = await prisma.enquiry.findMany({
    where,
    select: {
      id: true,
      createdAt: true,
      status: true,
      items: {
        select: {
          id: true,
          quantity: true,
          productId: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return enquiries;
}
