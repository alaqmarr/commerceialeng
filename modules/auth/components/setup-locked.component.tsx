"use client";

/**
 * modules/auth/components/setup-locked.component.tsx
 * Presentation component displayed when initial setup is permanently locked.
 * Strictly under 200 lines.
 */

import React from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

export function SetupLocked() {
  return (
    <div
      data-testid="setup-locked-container"
      className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xl relative overflow-hidden font-sans"
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
  );
}
