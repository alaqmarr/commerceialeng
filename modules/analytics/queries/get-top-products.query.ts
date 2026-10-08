import { prisma } from "@/lib/prisma";

export interface TopProductsQueryParams {
  startDate?: Date;
  limit?: number;
}

export interface TopProductItemResult {
  id: string;
  enquiryId: string;
  productId: string;
  quantity: number;
  notes: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    categoryId: string;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
  } | null;
  enquiry: {
    id: string;
    createdAt: Date;
    status: string;
  };
}

export interface TopProductAggregate {
  productId: string;
  productName: string;
  categoryName: string;
  enquiryCount: number;
  totalQuantity: number;
}

/**
 * Fetches enquiry line items populated with product and category relations.
 * Supports date filtering (createdAt >= startDate).
 */
export async function getTopProductsQuery(
  params?: TopProductsQueryParams | Date
): Promise<TopProductItemResult[]> {
  const startDate = params instanceof Date ? params : params?.startDate;
  const where = startDate ? { enquiry: { createdAt: { gte: startDate } } } : {};

  const items = await prisma.enquiryItem.findMany({
    where,
    select: {
      id: true,
      enquiryId: true,
      productId: true,
      quantity: true,
      notes: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      enquiry: {
        select: {
          id: true,
          createdAt: true,
          status: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  return items;
}

/**
 * Fetches and groups top enquired products with summed quantities and enquiry counts.
 */
export async function getTopProductsAggregatedQuery(
  params?: TopProductsQueryParams | Date
): Promise<TopProductAggregate[]> {
  const items = await getTopProductsQuery(params);
  if (items.length === 0) return [];

  const productMap = new Map<string, TopProductAggregate>();

  for (const item of items) {
    const pId = item.productId;
    const existing = productMap.get(pId);
    const pName = item.product?.name ?? "Archived Product";
    const cName = item.product?.category?.name ?? "Uncategorized";

    if (existing) {
      existing.enquiryCount += 1;
      existing.totalQuantity += item.quantity;
    } else {
      productMap.set(pId, {
        productId: pId,
        productName: pName,
        categoryName: cName,
        enquiryCount: 1,
        totalQuantity: item.quantity,
      });
    }
  }

  const sorted = Array.from(productMap.values()).sort(
    (a, b) => b.totalQuantity - a.totalQuantity
  );

  const limit =
    typeof params === "object" && !(params instanceof Date) ? params?.limit : undefined;
  return limit ? sorted.slice(0, limit) : sorted;
}
