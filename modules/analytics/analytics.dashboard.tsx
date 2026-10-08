"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  BarChart3,
  RefreshCw,
  Mail,
  Package,
  ArrowRight,
} from "lucide-react";
import type { AnalyticsData } from "./analytics.types";
import { getAnalytics } from "./get.analytics.action";
import {
  SummaryCards,
  TopProductsTable,
  CategoryDistribution,
  ActivityTrends,
  StatusBreakdown,
  DateFilter,
} from "./components";

interface AnalyticsDashboardProps {
  initialData: AnalyticsData;
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [days, setDays] = useState<number>(initialData.dateRange.days || 30);
  const [isPending, startTransition] = useTransition();

  const handleDaysChange = (newDays: number) => {
    setDays(newDays);
    startTransition(async () => {
      try {
        const fresh = await getAnalytics({ days: newDays });
        setData(fresh);
      } catch (err) {
        console.error("Failed to refresh analytics:", err);
      }
    });
  };

  const handleRefresh = () => {
    handleDaysChange(days);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-red-50 border border-red-200 rounded text-[11px] font-semibold text-red-600 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>EXECUTIVE INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-gray-900">
            Analytics & RFQ Performance
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tracking customer quotation volume, top demanded products, and sales pipeline conversion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <DateFilter
            currentDays={days}
            onDaysChange={handleDaysChange}
            isPending={isPending}
          />

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            title="Refresh analytics data"
            className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 text-red-600 ${isPending ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Date Window Indicator */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 shadow-sm">
        <span>
          Showing metrics for <strong>{data.dateRange.days} days</strong>:{" "}
          <span className="font-mono text-gray-900">{data.dateRange.start}</span> to{" "}
          <span className="font-mono text-gray-900">{data.dateRange.end}</span>
        </span>
        <span className="text-[11px] text-gray-400">
          Auto-computed from SQLite WAL database
        </span>
      </div>

      {/* Row 1: KPI Summary Cards */}
      <SummaryCards summary={data.summary} isLoading={isPending} />

      {/* Row 2: Activity Trends & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityTrends
            activityTrends={data.activityTrends}
            days={days}
            isLoading={isPending}
          />
        </div>
        <div className="lg:col-span-1">
          <StatusBreakdown
            statusBreakdown={data.statusBreakdown}
            totalEnquiries={data.summary.totalEnquiries}
            isLoading={isPending}
          />
        </div>
      </div>

      {/* Row 3: Top Products Table & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopProductsTable
            topProducts={data.topProducts}
            isLoading={isPending}
          />
        </div>
        <div className="lg:col-span-1">
          <CategoryDistribution
            categoryDistribution={data.categoryDistribution}
            isLoading={isPending}
          />
        </div>
      </div>

      {/* Bottom Management Shortcuts */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-gray-600">
          Want to update product records or respond to incoming customer enquiries?
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 text-red-600" />
            <span>Manage Enquiries</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products Catalog</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
