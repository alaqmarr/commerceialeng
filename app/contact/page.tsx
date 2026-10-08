import React from 'react';
import type { Metadata } from 'next';
import { getContactSettingsQuery } from '@/modules/settings';
import { ContactView } from '@/modules/enquiries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact & Technical Consultation | Commercial Engineering Associates',
  description:
    'Contact our industrial bonding and sealant technical specialists for product selection, specifications, sample rolls, and quotations.',
};

export default async function ContactPage() {
  const settings = await getContactSettingsQuery();
  return <ContactView settings={settings} />;
}
