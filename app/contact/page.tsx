import React from 'react';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { ContactForm } from './ContactForm';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact & Technical Consultation | Commercial Engineering Associates',
  description:
    'Contact our industrial bonding and sealant technical specialists for product selection, specifications, sample rolls, and quotations.',
};

export default async function ContactPage() {
  // Query all dynamic contact settings directly from SQLite
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'COMPANY_PHONE',
          'SALES_EMAIL',
          'WHATSAPP_NUMBER',
          'COMPANY_ADDRESS',
          'COMPANY_NAME',
          'COMPANY_TAGLINE',
        ],
      },
    },
  });

  const settingsMap = settings.reduce<Record<string, string>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  const phone = settingsMap['COMPANY_PHONE'] || '+91 98765 43210';
  const email = settingsMap['SALES_EMAIL'] || 'sales@commercialeng.com';
  const address =
    settingsMap['COMPANY_ADDRESS'] ||
    'Plot 42, Phase II, Industrial Area, Sector 58, Industrial Corridors, 110020';
  const whatsapp = settingsMap['WHATSAPP_NUMBER'] || '+919876543210';

  const cleanWhatsapp = whatsapp.replace(/[^\d+]/g, '');

  return (
    <div className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-sans text-xs font-semibold text-red-600 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>GET IN TOUCH</span>
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-gray-900">
            Contact & Consultation
          </h1>

          <p className="mt-2 text-sm text-gray-600 max-w-2xl leading-relaxed">
            Get in touch with our team for product specifications, pricing quotations, or technical support.
          </p>
        </div>

        {/* Contact Coordinates & Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Direct Coordinates */}
          <div className="space-y-6 lg:col-span-1">
            {/* Phone Card */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-sans text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                    Phone
                  </span>
                  <p className="font-sans text-sm font-bold text-gray-900 mt-0.5 break-all">
                    {phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-sans text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                    Email
                  </span>
                  <p className="font-sans text-sm font-bold text-gray-900 mt-0.5 break-all">
                    <a
                      href={`mailto:${email}`}
                      className="hover:text-red-600 transition-colors"
                    >
                      {email}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Direct Action */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <WhatsAppIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-sans text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                    WhatsApp
                  </span>
                  <p className="font-sans text-sm font-bold text-emerald-700 mt-0.5 break-all">
                    <a
                      href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                        'Hello Commercial Engineering Associates, I am seeking technical assistance and product quotation.'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {whatsapp}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 mt-0.5 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-sans text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                    Office & Works Address
                  </span>
                  <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed break-words">
                    {address}
                  </p>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center gap-3 text-xs text-gray-600 font-sans">
              <Clock className="h-4 w-4 text-red-600 shrink-0" />
              <span>Monday – Saturday: 09:00 AM – 06:30 PM IST</span>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
