"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Phone,
  Mail,
  Building,
  Server,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  UploadCloud,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dbFile, setDbFile] = useState<File | null>(null);
  const [uploadingDb, setUploadingDb] = useState(false);
  const [dbSuccess, setDbSuccess] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const [uploadingJson, setUploadingJson] = useState(false);
  const [jsonSuccess, setJsonSuccess] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

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

  const handleDbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setDbFile(file);
    setUploadingDb(true);
    setDbSuccess(null);
    setDbError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(text || "Server returned a non-JSON error. The file might be too large.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process database");
      setDbSuccess(data.message || "Database imported successfully");
    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setUploadingDb(false);
      e.target.value = "";
    }
  };

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingJson(true);
    setJsonSuccess(null);
    setJsonError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/restore", {
        method: "POST",
        body: formData,
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(text || "Server returned a non-JSON error. The file might be too large.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import JSON data");
      setJsonSuccess(data.message || "JSON data imported successfully");
    } catch (err: any) {
      setJsonError(err.message);
    } finally {
      setUploadingJson(false);
      e.target.value = "";
    }
  };

  const handleJsonDownload = () => {
    window.location.href = "/api/admin/backup";
  };

  return (
    <div className="space-y-6 max-w-4xl">
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
          <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Loading System Settings...
          </span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8 font-sans">
          {/* Section 1: Contact Coordinates */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5">
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
                  onChange={(e) => handleChange("COMPANY_NAME", e.target.value)}
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
                  onChange={(e) => handleChange("COMPANY_PHONE", e.target.value)}
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
                  onChange={(e) => handleChange("WHATSAPP_NUMBER", e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-emerald-700 font-medium text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-red-600" />
                  <span>Sales & Quotation Email</span>
                </label>
                <input
                  type="email"
                  value={settings.SALES_EMAIL || ""}
                  onChange={(e) => handleChange("SALES_EMAIL", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Corporate Headquarters Address
              </label>
              <textarea
                rows={2}
                value={settings.COMPANY_ADDRESS || ""}
                onChange={(e) => handleChange("COMPANY_ADDRESS", e.target.value)}
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
                onChange={(e) => handleChange("BUSINESS_HOURS", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          {/* Section 2: SMTP Mailer Configuration */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5">
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
                  onChange={(e) => handleChange("SMTP_HOST", e.target.value)}
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
                  onChange={(e) => handleChange("SMTP_PORT", e.target.value)}
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
                  onChange={(e) => handleChange("SMTP_USER", e.target.value)}
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
                  onChange={(e) => handleChange("SMTP_PASS", e.target.value)}
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
                onChange={(e) => handleChange("SMTP_FROM", e.target.value)}
                placeholder="Commercial Engineering Associates <sales@commercialeng.com>"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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

      {/* Section 3: Database Import */}
      {!loading && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3">
            <Database className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Database Import (Products & Categories)
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Upload a standard SQLite database (.db or .sqlite) containing updated catalogs. Products, Categories, and Use-Cases will be instantly merged.
          </p>

          {dbSuccess && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg text-xs border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <p>{dbSuccess}</p>
            </div>
          )}
          
          {dbError && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 px-4 py-3 rounded-lg text-xs border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{dbError}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-within:ring-1 focus-within:ring-red-600 disabled:opacity-50">
              <UploadCloud className="w-4 h-4 text-red-600" />
              <span>Select .db File</span>
              <input 
                type="file" 
                accept=".db,.sqlite,.sqlite3" 
                className="sr-only" 
                onChange={handleDbUpload}
                disabled={uploadingDb}
              />
            </label>
            {uploadingDb && (
              <div className="flex items-center gap-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Upload...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 4: JSON Backup and Restore */}
      {!loading && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                JSON Backup & Add Data
              </h2>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Export a full backup of your catalog as a JSON file, or restore/add data from a JSON file. 
            When uploading, data is ONLY added. Existing data is NEVER replaced or deleted.
          </p>

          {jsonSuccess && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg text-xs border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <p>{jsonSuccess}</p>
            </div>
          )}
          
          {jsonError && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 px-4 py-3 rounded-lg text-xs border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{jsonError}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={handleJsonDownload}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <Save className="w-4 h-4 text-red-600" />
              <span>Download JSON Backup</span>
            </button>

            <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-within:ring-1 focus-within:ring-red-600 disabled:opacity-50">
              <UploadCloud className="w-4 h-4 text-red-600" />
              <span>Add Data from JSON</span>
              <input 
                type="file" 
                accept=".json" 
                className="sr-only" 
                onChange={handleJsonUpload}
                disabled={uploadingJson}
              />
            </label>
            {uploadingJson && (
              <div className="flex items-center gap-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Upload...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
