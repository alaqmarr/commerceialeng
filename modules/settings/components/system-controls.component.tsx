"use client";

/**
 * modules/settings/components/system-controls.component.tsx
 * Database import (.db) and catalog JSON backup/restore actions.
 * Strictly under 200 lines.
 */

import React, { useState } from "react";
import {
  Database,
  UploadCloud,
  Save,
  Loader,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function SystemControlsComponent() {
  const [uploadingDb, setUploadingDb] = useState(false);
  const [dbSuccess, setDbSuccess] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const [uploadingJson, setUploadingJson] = useState(false);
  const [jsonSuccess, setJsonSuccess] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleDbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingDb(true);
    setDbSuccess(null);
    setDbError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import", { method: "POST", body: formData });
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
      const res = await fetch("/api/admin/restore", { method: "POST", body: formData });
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

  return (
    <div className="space-y-6 font-sans">
      {/* Section 3: Database Import */}
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
            <input type="file" accept=".db,.sqlite,.sqlite3" className="sr-only" onChange={handleDbUpload} disabled={uploadingDb} />
          </label>
          {uploadingDb && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Processing Upload...</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: JSON Backup and Restore */}
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
            onClick={() => { window.location.href = "/api/admin/backup"; }}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Save className="w-4 h-4 text-red-600" />
            <span>Download JSON Backup</span>
          </button>

          <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-within:ring-1 focus-within:ring-red-600 disabled:opacity-50">
            <UploadCloud className="w-4 h-4 text-red-600" />
            <span>Add Data from JSON</span>
            <input type="file" accept=".json" className="sr-only" onChange={handleJsonUpload} disabled={uploadingJson} />
          </label>
          {uploadingJson && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600 uppercase tracking-wider">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Processing Upload...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
