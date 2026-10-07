import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export async function Footer() {
  let settingsMap: Record<string, string> = {};
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'COMPANY_NAME',
            'COMPANY_TAGLINE',
            'COMPANY_PHONE',
            'SALES_EMAIL',
            'COMPANY_ADDRESS',
          ],
        },
      },
    });
    settingsMap = settings.reduce<Record<string, string>>((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  } catch (err) {
    console.error('[Footer] Failed to load settings from DB:', err);
  }

  const companyName = settingsMap['COMPANY_NAME'] || 'COMMERCIAL ENGINEERING';
  const tagline =
    settingsMap['COMPANY_TAGLINE'] ||
    'Engineered adhesives, industrial tapes, high-performance sealants, and precision thermal materials for automotive, electronics, aerospace, and general fabrication industries.';
  const email = settingsMap['SALES_EMAIL'] || 'sales@commercialeng.com';
  const phone = settingsMap['COMPANY_PHONE'] || '+91 98765 43210';
  const address =
    settingsMap['COMPANY_ADDRESS'] ||
    'Plot 42, Phase II, Industrial Area, Sector 58, Industrial Corridors, 110020';

  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-600 text-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Company Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.webp"
                alt="Commercial Engineering Associates"
                width={36}
                height={36}
                className="h-8 w-8 rounded-md object-contain"
                loading="eager"
              />
              <span className="font-sans text-sm font-bold text-gray-900 uppercase">
                {companyName}
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {tagline}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-700 font-sans font-medium">
              <ShieldCheck className="h-4 w-4 text-red-600" />
              <span>Industrial Quality Standards</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-gray-900">
              Solutions & Catalog
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?src=footer" className="hover:text-red-600 transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/categories?src=footer" className="hover:text-red-600 transition-colors">
                  Product Categories
                </Link>
              </li>
              <li>
                <Link href="/use-cases?src=footer" className="hover:text-red-600 transition-colors">
                  Industrial Use Cases
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-red-600 transition-colors">
                  Request for Quotation (RFQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Coordinates */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-gray-900">
              Technical Support
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-red-600 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-red-600 transition-colors break-all">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-red-600 shrink-0" />
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:text-red-600 transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span className="leading-snug">{address}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Portals & Governance */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-gray-900">
              Internal Portals
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/setup" className="hover:text-red-600 transition-colors">
                  Admin Setup
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-red-600 transition-colors">
                  Admin Login
                </Link>
              </li>
              <li>
                <Link href="/contact?src=footer" className="hover:text-red-600 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Commercial Engineering Associates. All rights reserved.</p>
          <p className="font-sans text-[11px] text-gray-500 mt-2 sm:mt-0">
            Quality Industrial Tapes, Adhesives & Sealants
          </p>
        </div>
      </div>
    </footer>
  );
}
