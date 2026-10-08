"use client";

/**
 * modules/auth/components/login-form.component.tsx
 * Admin login form component integrating with NextAuth credentials provider.
 * Strictly under 200 lines.
 */

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader,
  ArrowRight,
  Building2,
} from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const setupSuccess = searchParams.get("setup") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeSignIn = async (userEmail: string, userPass: string) => {
    return signIn("credentials", {
      email: userEmail,
      password: userPass,
      redirect: false,
      callbackUrl,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      let res = await executeSignIn(cleanEmail, password);

      // Retry once on transient server/callback errors (status >= 500 or error === 'Callback')
      if (!res?.ok && (res?.status === 500 || res?.error === "Callback")) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        res = await executeSignIn(cleanEmail, password);
      }

      if (res?.error) {
        setErrorMessage("Invalid email or password. Please verify your credentials.");
        setLoading(false);
      } else if (res?.ok) {
        const destination = res.url || callbackUrl;
        window.location.href = destination;
      } else {
        setErrorMessage("Authentication failed. Please verify your credentials.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login authentication error:", err);
      setErrorMessage("An unexpected authentication error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10 font-sans">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full mb-3">
          <Building2 className="w-4 h-4 text-red-600" />
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
            Commercial Engineering Associates
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
          Admin Console Login
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Authorized Engineering & Management Access</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-t-xl" />

        {setupSuccess && (
          <div data-testid="login-setup-success-msg" className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-emerald-700 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Setup completed successfully! Please sign in with your administrator credentials.</span>
          </div>
        )}

        {errorMessage && (
          <div data-testid="login-error-msg" className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email" name="email" type="email" required data-testid="login-email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@commercialeng.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="password" name="password" type={showPassword ? "text" : "password"} required data-testid="login-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading} data-testid="login-submit-btn"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <Link href="/setup" className="hover:text-red-600 transition-colors">First-Run Setup &rarr;</Link>
          <Link href="/" className="hover:text-gray-900 transition-colors">Public Website &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
