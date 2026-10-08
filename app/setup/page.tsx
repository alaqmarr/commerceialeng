"use client";
import React, { useState, useEffect } from "react";
import { Loader, Building2 } from "lucide-react";
import { SetupForm, SetupLocked } from "@/modules/auth";

export default function SetupPage() {
  const [checking, setChecking] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  useEffect(() => {
    let mounted = true, retries = 3;
    const verify = () => {
      fetch("/api/setup/status", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
        .then((data) => { if (mounted) { setIsLocked(Boolean(data?.isSetup)); setChecking(false); } })
        .catch(() => {
          if (!mounted) return;
          retries-- > 0 ? setTimeout(verify, 250) : (setIsLocked(true), setChecking(false));
        });
    };
    verify();
    return () => { mounted = false; };
  }, []);
  if (checking) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-gray-500">
      <Loader className="w-8 h-8 animate-spin text-red-600" />
      <p className="text-xs uppercase tracking-wider font-semibold text-gray-600">Verifying System Status...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-75 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700" />
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full mb-3">
            <Building2 className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Commercial Engineering Associates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">System Initialization</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Industrial Tapes & Sealants Solutions Control Console</p>
        </div>
        {isLocked ? <SetupLocked /> : <SetupForm onLocked={() => setIsLocked(true)} />}
      </div>
    </div>
  );
}
