"use client";

/**
 * modules/settings/components/contact-form.component.tsx
 * Form fields for corporate contact details and enquiry routing.
 * Strictly under 200 lines.
 */

import React from "react";
import { Building, Phone, Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

interface ContactFormProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function ContactFormComponent({ settings, onChange }: ContactFormProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5 font-sans">
      <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3">
        <Building className="w-4 h-4 text-red-600" />
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Corporate Contact Coordinates
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Company Legal Name
          </label>
          <input
            type="text"
            value={settings.COMPANY_NAME || ""}
            onChange={(e) => onChange("COMPANY_NAME", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-red-600" />
            <span>Telephone Number</span>
          </label>
          <input
            type="text"
            value={settings.COMPANY_PHONE || ""}
            onChange={(e) => onChange("COMPANY_PHONE", e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <WhatsAppIcon className="w-3 h-3 text-emerald-600" />
            <span>WhatsApp Enquiry Number (with country code)</span>
          </label>
          <input
            type="text"
            value={settings.WHATSAPP_NUMBER || ""}
            onChange={(e) => onChange("WHATSAPP_NUMBER", e.target.value)}
            placeholder="e.g. 919876543210"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-emerald-700 font-medium text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-red-600" />
            <span>Sales & Quotation Emails</span>
          </label>
          <input
            type="text"
            value={settings.SALES_EMAIL || ""}
            onChange={(e) => onChange("SALES_EMAIL", e.target.value)}
            placeholder="e.g. sales@abc.com, manager@abc.com"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
          <p className="text-[10px] text-gray-500 mt-1">Separate multiple emails with commas</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Corporate Headquarters Address
        </label>
        <textarea
          rows={2}
          value={settings.COMPANY_ADDRESS || ""}
          onChange={(e) => onChange("COMPANY_ADDRESS", e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Operating Business Hours
        </label>
        <input
          type="text"
          value={settings.BUSINESS_HOURS || ""}
          onChange={(e) => onChange("BUSINESS_HOURS", e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Department-wise Contacts (Optional)
        </label>
        <textarea
          rows={3}
          value={settings.DEPARTMENT_CONTACTS || ""}
          onChange={(e) => onChange("DEPARTMENT_CONTACTS", e.target.value)}
          placeholder="e.g. Sales: +91 98765 43210, Tech Support: +91 98765 43211"
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 resize-none"
        />
        <p className="text-[10px] text-gray-500 mt-1">List any department specific numbers here (Call/WhatsApp). These will be displayed on the contact page.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Bank Account Details
        </label>
        <textarea
          rows={3}
          value={settings.BANK_DETAILS || ""}
          onChange={(e) => onChange("BANK_DETAILS", e.target.value)}
          placeholder="e.g. Bank Name: HDFC\nAccount No: 123456789\nIFSC: HDFC000123"
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 resize-none"
        />
        <p className="text-[10px] text-gray-500 mt-1">These will be pre-filled automatically on new quotations.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Default Terms and Conditions
        </label>
        <textarea
          rows={3}
          value={settings.DEFAULT_TERMS || ""}
          onChange={(e) => onChange("DEFAULT_TERMS", e.target.value)}
          placeholder="e.g. 1. Delivery within 15 days.\n2. Payment 100% advance."
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 resize-none"
        />
        <p className="text-[10px] text-gray-500 mt-1">Default T&Cs inserted into every new quote (can be edited per quote).</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Google Maps Embed Code / Link
        </label>
        <textarea
          rows={3}
          value={settings.MAP_LOCATION || ""}
          onChange={(e) => onChange("MAP_LOCATION", e.target.value)}
          placeholder="e.g. <iframe src='...'></iframe>"
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 resize-none"
        />
        <p className="text-[10px] text-gray-500 mt-1">Paste the Google Maps iframe snippet to display a map on the contact page.</p>
      </div>
    </div>
  );
}
