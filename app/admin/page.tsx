import React from 'react';
import type { Metadata } from 'next';
import { getAdminOverviewQuery, AdminOverviewDashboard } from '@/modules/analytics';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'System Overview & Metrics | Admin Console',
  description: 'Production management console for Commercial Engineering Associates',
};

export default async function AdminDashboardPage() {
  const data = await getAdminOverviewQuery();
  return <AdminOverviewDashboard data={data} />;
}
