import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Package,
  FolderTree,
  Layers,
  Image as ImageIcon,
  Settings,
  Mail,
  PlusCircle,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch real metrics from Prisma
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

  const cards = [
    {
      title: "Products",
      count: totalProducts,
      href: "/admin/products",
      icon: Package,
      desc: "Manage catalog products & specs",
      createHref: "/admin/products",
    },
    {
      title: "Categories",
      count: totalCategories,
      href: "/admin/categories",
      icon: FolderTree,
      desc: "Product classifications",
      createHref: "/admin/categories",
    },
    {
      title: "Use Cases",
      count: totalUseCases,
      href: "/admin/use-cases",
      icon: Layers,
      desc: "Industrial applications",
      createHref: "/admin/use-cases",
    },
    {
      title: "Hero Slides",
      count: totalHeroSlides,
      href: "/admin/hero",
      icon: ImageIcon,
      desc: "Homepage carousel slides",
      createHref: "/admin/hero",
    },
    {
      title: "Enquiries",
      count: totalEnquiries,
      badge: pendingEnquiries > 0 ? `${pendingEnquiries} Pending` : undefined,
      href: "/admin/enquiries",
      icon: Mail,
      desc: "Incoming customer RFQs",
    },
    {
      title: "Settings",
      count: "Active",
      href: "/admin/settings",
      icon: Settings,
      desc: "Company & SMTP configuration",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-red-50 border border-red-200 rounded text-[11px] font-semibold text-red-600 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            OPERATIONAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            System Overview & Metrics
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Commercial Engineering Associates — Production Management Console
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-red-600" />
            <span>View Inbox ({pendingEnquiries})</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.href}
              className="rounded-xl border border-gray-200 bg-white p-5 hover:border-red-500/30 hover:shadow-md transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  {c.badge && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                      {c.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {c.count}
                  </span>
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    {c.title}
                  </h2>
                </div>
                <p className="text-xs text-gray-500">{c.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={c.href}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold"
                >
                  <span>Manage {c.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Enquiries Inbox Summary */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Recent Customer RFQ Inquiries
            </h3>
          </div>
          <Link
            href="/admin/enquiries"
            className="text-xs text-red-600 hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>View All ({totalEnquiries})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            No incoming customer enquiries yet. RFQ enquiries submitted through the cart will appear here.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="p-4 sm:px-6 hover:bg-gray-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-gray-900 font-medium">{enq.name}</strong>
                    {enq.company && (
                      <span className="text-gray-500">
                        ({enq.company})
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                        enq.status === "PENDING"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : enq.status === "CONTACTED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 text-[11px]">
                    <span>{enq.email}</span>
                    {enq.phone && <span>• {enq.phone}</span>}
                    <span>• {enq._count.items} line items</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-gray-500 font-sans text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/admin/enquiries?id=${enq.id}`}
                    className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-sans text-xs transition-colors"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
