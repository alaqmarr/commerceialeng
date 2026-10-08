import React from "react";
import type { UseCaseDTO } from "../use-cases.types";
import { UseCaseCard } from "./use-case-card.component";

/**
 * modules/use-cases/components/use-case-grid.component.tsx
 * Public grid layout for presenting industrial use cases.
 * Strictly under 200 lines.
 */

interface UseCaseGridProps {
  useCases: UseCaseDTO[];
}

export function UseCaseGrid({ useCases }: UseCaseGridProps) {
  if (useCases.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center text-gray-500 text-sm">
        No industrial use-cases found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {useCases.map((uc) => (
        <UseCaseCard key={uc.id} useCase={uc} />
      ))}
    </div>
  );
}
