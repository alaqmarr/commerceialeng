import React from 'react';
import Link from 'next/link';
import { Wrench, ArrowRight } from 'lucide-react';
import type { UseCaseDTO } from '../use-cases.types';

interface HomeUseCasesSectionProps {
  useCases: UseCaseDTO[];
}

export function HomeUseCasesSection({ useCases }: HomeUseCasesSectionProps) {
  return (
    <section className="py-16 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-red-600 font-semibold mb-1">
              <span>Applications</span>
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold uppercase text-gray-900 tracking-tight">
              Industrial Use Cases
            </h2>
          </div>
          <Link
            href="/use-cases?from=home"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            <span>View All Applications</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((uc) => (
            <Link
              key={uc.id}
              href={`/use-cases/${uc.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-red-500/50 hover:shadow-md"
            >
              <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                {uc.imageUrl ? (
                  <img
                    src={uc.imageUrl}
                    alt={uc.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                    <Wrench className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-red-600 backdrop-blur-sm border border-red-200 shadow-sm">
                  Application
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-sans text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                    {uc.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {uc.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-sans font-semibold text-red-600 pt-2 border-t border-gray-100">
                  <span>Engineering Details</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
