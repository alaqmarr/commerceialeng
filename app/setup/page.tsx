"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowRight,
  User,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
} from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check setup status on load
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/setup/status", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.isSetup) {
            setIsLocked(true);
          }
        }
      } catch (err) {
        console.error("Status check failed:", err);
      } finally {
        setCheckingStatus(false);
      }
    }
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (!name.trim()) {
      setErrorMessage("Please enter an administrator name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid administrative email address.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
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
        setIsLocked(true);
        setErrorMessage(data.error || "Setup is already locked.");
      } else if (!res.ok) {
        setErrorMessage(data.error || "Failed to initialize admin account.");
      } else {
        setSuccessMessage("Admin account initialized successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/admin/login?setup=success");
        }, 1500);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage("Network error occurred during initialization. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading skeleton state
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <p className="text-xs uppercase tracking-wider font-semibold text-gray-600">Verifying System Status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Industrial Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-75 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700" />

      <div className="w-full max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full mb-3">
            <Building2 className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
              Commercial Engineering Associates
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
            System Initialization
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Industrial Tapes & Sealants Solutions Control Console
          </p>
        </div>

        {/* LOCKED STATE VIEW */}
        {isLocked ? (
          <div
            data-testid="setup-locked-container"
            className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-red-50 border-l border-b border-red-200 text-[10px] font-semibold text-red-700 uppercase tracking-wider">
              Security Lock Active
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-red-600">
                <Lock className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Setup Gate Locked
              </h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                The primary administrative account for this installation has already been initialized.
                For enterprise security, the setup gate is permanently locked against further registrations.
              </p>

              <div className="w-full space-y-3">
                <Link
                  href="/admin/login"
                  data-testid="proceed-to-login-btn"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-md"
                >
                  <span>Proceed to Admin Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/"
                  className="w-full block py-2.5 px-4 text-center text-xs text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Return to Public Portal
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* UNLOCKED SETUP FORM VIEW */
          <div
            data-testid="setup-form-container"
            className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xl relative"
          >
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create Primary Administrator</h2>
                <p className="text-xs text-gray-500">First-run configuration — account will be permanently bound</p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                data-testid="setup-error-msg"
                className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-xs"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div
                data-testid="setup-success-msg"
                className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-emerald-700 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Administrator Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    data-testid="setup-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chief Operating Engineer"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    data-testid="setup-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@commercialeng.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    data-testid="setup-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    data-testid="setup-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600">
                Notice: Completing this step permanently locks the setup gate and initializes default company settings.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                data-testid="setup-submit-btn"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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
        )}
      </div>
    </div>
  );
}
