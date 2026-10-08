import { Suspense } from "react";
import { Loader } from "lucide-react";
import { LoginForm } from "@/modules/auth";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-75 pointer-events-none" />
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader className="w-8 h-8 animate-spin text-red-600" />
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-600">Loading Login Interface...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
