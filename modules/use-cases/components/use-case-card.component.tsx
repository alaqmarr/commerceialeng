import React from "react";
import Link from "next/link";
import { Wrench, ArrowRight } from "lucide-react";
import type { UseCaseDTO } from "../use-cases.types";
import { formatProductCountBadge } from "../use-cases.lib";

/**
 * modules/use-cases/components/use-case-card.component.tsx
 * Public presentation card for an individual industrial use-case.
 * Strictly under 200 lines.
 */

interface UseCaseCardProps {
  useCase: UseCaseDTO;
}

export function UseCaseCard({ useCase }: UseCaseCardProps) {
  const count = useCase._count?.products ?? 0;

  return (
    <Link
      href={`/use-cases/${useCase.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-red-500/50 hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {useCase.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={useCase.imageUrl}
            alt={useCase.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <Wrench className="h-12 w-12" />
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-red-600 backdrop-blur-sm border border-red-200 shadow-sm">
          {formatProductCountBadge(count)}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-sans text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
            {useCase.title}
          </h3>
          <p className="mt-2 text-xs text-gray-600 leading-relaxed line-clamp-3">
            {useCase.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-sans font-semibold text-red-600">
          <span>Explore Application Solutions</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
