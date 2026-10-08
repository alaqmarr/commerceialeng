"use client";

/**
 * modules/settings/components/smtp-form.component.tsx
 * Form fields for Nodemailer SMTP mail relay configuration.
 * Strictly under 200 lines.
 */

import React from "react";
import { Server, KeyRound } from "lucide-react";

interface SmtpFormProps {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function SmtpFormComponent({ settings, onChange }: SmtpFormProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5 font-sans">
      <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3">
        <Server className="w-4 h-4 text-red-600" />
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Nodemailer SMTP Dispatch Configuration
        </h2>
      </div>
      <p className="text-xs text-gray-500">
        Outgoing quotation notifications and customer RFQ copies will be dispatched using this SMTP relay.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            SMTP Host Server
          </label>
          <input
            type="text"
            value={settings.SMTP_HOST || ""}
            onChange={(e) => onChange("SMTP_HOST", e.target.value)}
            placeholder="smtp.gmail.com"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            SMTP Port
          </label>
          <input
            type="text"
            value={settings.SMTP_PORT || ""}
            onChange={(e) => onChange("SMTP_PORT", e.target.value)}
            placeholder="587"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            SMTP Username / Email
          </label>
          <input
            type="text"
            value={settings.SMTP_USER || ""}
            onChange={(e) => onChange("SMTP_USER", e.target.value)}
            placeholder="sales@commercialeng.com"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <KeyRound className="w-3 h-3 text-red-600" />
            <span>SMTP Password / App Password</span>
          </label>
          <input
            type="password"
            value={settings.SMTP_PASS || ""}
            onChange={(e) => onChange("SMTP_PASS", e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          From Header Address
        </label>
        <input
          type="text"
          value={settings.SMTP_FROM || ""}
          onChange={(e) => onChange("SMTP_FROM", e.target.value)}
          placeholder="Commercial Engineering Associates <sales@commercialeng.com>"
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
        />
      </div>
    </div>
  );
}
