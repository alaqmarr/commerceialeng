import React from "react";
import {
  Mail,
  Package,
  Clock,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import type { AnalyticsSummary } from "../analytics.types";

interface SummaryCardsProps {
  summary: AnalyticsSummary;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div className="w-12 h-4 rounded bg-gray-200" />
            </div>
            <div className="w-16 h-7 rounded bg-gray-200" />
            <div className="w-24 h-3 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total RFQs",
      value: summary.totalEnquiries.toLocaleString(),
      icon: Mail,
      desc: "Customer enquiries",
      badge: "Total",
      badgeColor: "bg-gray-100 text-gray-700 border-gray-200",
    },
    {
      label: "Items Requested",
      value: summary.totalEnquiryItems.toLocaleString(),
      icon: Package,
      desc: "Cart line items",
      badge: "Products",
      badgeColor: "bg-gray-100 text-gray-700 border-gray-200",
    },
    {
      label: "Pending Action",
      value: summary.pendingEnquiries.toLocaleString(),
      icon: Clock,
      desc: "Awaiting outreach",
      badge: summary.pendingEnquiries > 0 ? "Action Req." : "Clear",
      badgeColor:
        summary.pendingEnquiries > 0
          ? "bg-red-50 text-red-600 border-red-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Contacted Leads",
      value: summary.contactedEnquiries.toLocaleString(),
      icon: PhoneCall,
      desc: "In communication",
      badge: "In Progress",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Closed / Won",
      value: summary.closedEnquiries.toLocaleString(),
      icon: CheckCircle2,
      desc: "Fulfilled / closed",
      badge: "Completed",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Response Rate",
      value: `${summary.responseRate}%`,
      icon: TrendingUp,
      desc: "Contacted + Closed",
      badge: "Rate",
      badgeColor: "bg-red-50 text-red-600 border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-red-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200">
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${c.badgeColor}`}
                >
                  {c.badge}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
                {c.value}
              </div>
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                {c.label}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-500">
              {c.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
}
