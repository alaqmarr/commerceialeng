import React from "react";
import Link from "next/link";
import { Wrench, ChevronRight, ArrowLeft } from "lucide-react";
import type { UseCaseDTO } from "../use-cases.types";

/**
 * modules/use-cases/components/use-case-detail-header.component.tsx
 * Presentation component for use-case detail page breadcrumbs, badge, and header banner.
 * Strictly under 200 lines.
 */

interface UseCaseDetailHeaderProps {
  useCase: UseCaseDTO;
  productCount: number;
}

export function UseCaseDetailHeader({
  useCase,
  productCount,
}: UseCaseDetailHeaderProps) {
  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-sans text-gray-500">
        <Link href="/" className="hover:text-red-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <Link href="/use-cases" className="hover:text-red-600 transition-colors">
          Use Cases
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="text-red-600 font-bold">{useCase.title}</span>
      </nav>

      {/* Use-Case Header Card */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-sans text-xs font-semibold text-red-600">
              <Wrench className="h-3.5 w-3.5" />
              <span>APPLICATION</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-gray-900">
              {useCase.title}
            </h1>
          </div>

          <Link
            href="/use-cases"
            className="inline-flex items-center gap-2 text-xs font-sans text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Use Cases</span>
          </Link>
        </div>

        <p className="text-sm text-gray-700 max-w-3xl leading-relaxed whitespace-pre-line">
          {useCase.description}
        </p>

        <div className="pt-2 text-xs font-sans text-red-600 font-medium">
          {productCount} Products Available
        </div>
      </div>
    </div>
  );
}
