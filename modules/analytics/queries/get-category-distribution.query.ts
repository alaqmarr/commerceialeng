import { prisma } from "@/lib/prisma";

export interface CategoryDistributionQueryParams {
  startDate?: Date;
}

export interface CategoryDistributionQueryResult {
  categoryId: string;
  categoryName: string;
  slug: string;
  productCount: number;
  enquiryItemCount: number;
  totalQuantity: number;
}

/**
 * Fetches all categories along with catalog product counts and date-filtered
 * enquiry counts. Handles empty categories and itemless products gracefully.
 */
export async function getCategoryDistributionQuery(
  params?: CategoryDistributionQueryParams | Date
): Promise<CategoryDistributionQueryResult[]> {
  const startDate = params instanceof Date ? params : params?.startDate;

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          products: true,
        },
      },
      products: {
        select: {
          id: true,
          enquiryItems: {
            where: startDate ? { enquiry: { createdAt: { gte: startDate } } } : undefined,
            select: {
              id: true,
              quantity: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((cat) => {
    let enquiryItemCount = 0;
    let totalQuantity = 0;

    for (const product of cat.products) {
      enquiryItemCount += product.enquiryItems.length;
      for (const item of product.enquiryItems) {
        totalQuantity += item.quantity;
      }
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      slug: cat.slug,
      productCount: cat._count.products,
      enquiryItemCount,
      totalQuantity,
    };
  });
}
