import React from "react";
import type { Metadata } from "next";
import { Wrench } from "lucide-react";
import { getUseCasesQuery, UseCaseGrid } from "@/modules/use-cases";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Industrial Use Cases & Applications | Commercial Engineering Associates",
  description:
    "Explore engineering bonding, sealing, and thermal dissipation applications across automotive, EV batteries, architectural facades, and electronics manufacturing.",
};

export default async function UseCasesPage() {
  const useCases = await getUseCasesQuery({
    orderBy: "createdAt",
    orderDirection: "desc",
    includeProductCount: true,
  });

  return (
    <div className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-gray-200 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-sans text-xs font-semibold text-red-600 mb-3">
            <Wrench className="h-3.5 w-3.5" />
            <span>APPLICATIONS</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-gray-900">
            Industrial Use Cases
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl leading-relaxed">
            Specialized bonding, structural sealing, and thermal interface implementations engineered for demanding technical environments across major industries.
          </p>
        </div>

        <UseCaseGrid useCases={useCases} />
      </div>
    </div>
  );
}
