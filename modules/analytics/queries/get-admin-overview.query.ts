/**
 * modules/analytics/queries/get-admin-overview.query.ts
 * Query to fetch high-level system overview counts and recent RFQs for Admin dashboard.
 * Strictly under 200 lines.
 */

import { prisma } from "@/lib/prisma";
import type { AdminOverviewMetrics } from "../analytics.types";

export async function getAdminOverviewQuery(): Promise<AdminOverviewMetrics> {
  const [
    totalProducts,
    totalCategories,
    totalUseCases,
    totalHeroSlides,
    totalEnquiries,
    pendingEnquiries,
    recentEnquiries,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.useCase.count(),
    prisma.heroImage.count(),
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "PENDING" } }),
    prisma.enquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { items: true },
        },
      },
    }),
  ]);

  return {
    totalProducts,
    totalCategories,
    totalUseCases,
    totalHeroSlides,
    totalEnquiries,
    pendingEnquiries,
    recentEnquiries: recentEnquiries.map((e) => ({
      id: e.id,
      name: e.name,
      company: e.company,
      email: e.email,
      phone: e.phone,
      status: e.status,
      itemCount: e._count.items,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}
