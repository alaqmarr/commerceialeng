"use client";

/**
 * modules/settings/components/admin-settings-manager.component.tsx
 * Client controller component managing Settings state, submission, and sub-forms.
 * Strictly under 200 lines.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader,
} from "lucide-react";
import { ContactFormComponent } from "./contact-form.component";
import { SmtpFormComponent } from "./smtp-form.component";
import { SystemControlsComponent } from "./system-controls.component";

export function AdminSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Record<string, string>>({
    COMPANY_NAME: "Commercial Engineering Associates",
    COMPANY_PHONE: "+91-11-23456789",
    WHATSAPP_NUMBER: "919876543210",
    SALES_EMAIL: "sales@commercialeng.com",
    COMPANY_ADDRESS: "Plot 42, Okhla Industrial Area, Phase III, New Delhi - 110020, India",
    BUSINESS_HOURS: "Monday – Saturday: 9:00 AM – 6:30 PM",
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "587",
    SMTP_USER: "",
    SMTP_PASS: "",
    SMTP_FROM: "Commercial Engineering Associates <sales@commercialeng.com>",
    BANK_DETAILS: "",
    MAP_LOCATION: "",
    DEFAULT_TERMS: "",
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      if (data.settingsMap) {
        setSettings((prev) => ({
          ...prev,
          ...data.settingsMap,
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching settings";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving settings";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-600 uppercase tracking-wider mb-1 font-semibold">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>System Configuration</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">
            Contact & SMTP Settings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Synchronize corporate contact coordinates, WhatsApp enquiry routing, and Nodemailer SMTP relay.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader className="w-7 h-7 text-red-600 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Loading System Settings...
          </span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8 font-sans">
          <ContactFormComponent settings={settings} onChange={handleChange} />
          <SmtpFormComponent settings={settings} onChange={handleChange} />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {!loading && <SystemControlsComponent />}
    </div>
  );
}
