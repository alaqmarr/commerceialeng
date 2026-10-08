"use client";

/**
 * modules/auth/components/setup-form.component.tsx
 * Interactive form component for first-run administrator creation.
 * Strictly under 200 lines.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader,
  ArrowRight,
} from "lucide-react";
import { validateSetupInput } from "../auth.lib";

interface SetupFormProps {
  onLocked?: () => void;
}

export function SetupForm({ onLocked }: SetupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = validateSetupInput({ name, email, password }, confirmPassword);
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Please verify your input.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (res.status === 403) {
        if (onLocked) onLocked();
        setErrorMessage(data.error || "Setup is already locked.");
      } else if (!res.ok) {
        setErrorMessage(data.error || "Failed to initialize admin account.");
      } else {
        setSuccessMessage("Admin account initialized successfully! Redirecting to login...");
        setTimeout(() => { router.push("/admin/login?setup=success"); }, 1500);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage("Network error occurred during initialization. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="setup-form-container" className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xl relative">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Create Primary Administrator</h2>
          <p className="text-xs text-gray-500">First-run configuration — account will be permanently bound</p>
        </div>
      </div>

      {errorMessage && (
        <div data-testid="setup-error-msg" className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div data-testid="setup-success-msg" className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Administrator Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="name" name="name" type="text" required data-testid="setup-name"
              value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chief Operating Engineer"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Admin Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email" name="email" type="email" required data-testid="setup-email"
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@commercialeng.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Master Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="password" name="password" type="password" required minLength={8} data-testid="setup-password"
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="confirmPassword" name="confirmPassword" type="password" required minLength={8} data-testid="setup-confirm-password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600">
          Notice: Completing this step permanently locks the setup gate and initializes default company settings.
        </div>

        <button
          type="submit" disabled={submitting} data-testid="setup-submit-btn"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {submitting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Initializing System...</span>
            </>
          ) : (
            <>
              <span>Initialize System & Create Admin</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
