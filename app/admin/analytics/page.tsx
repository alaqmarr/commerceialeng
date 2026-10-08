import React from "react";
import type { Metadata } from "next";
import { getAnalytics } from "@/modules/analytics/get.analytics.action";
import { AnalyticsDashboard } from "@/modules/analytics/analytics.dashboard";

export const metadata: Metadata = {
  title: "Analytics & Metrics | CEA Admin Console",
  description: "Executive e-commerce and enquiry analytics for Commercial Engineering Associates",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const initialData = await getAnalytics({ days: 30 });

  return (
    <div className="space-y-6">
      <AnalyticsDashboard initialData={initialData} />
    </div>
  );
}
