import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Wrench, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Industrial Use Cases & Applications | Commercial Engineering Associates',
  description:
    'Explore engineering bonding, sealing, and thermal dissipation applications across automotive, EV batteries, architectural facades, and electronics manufacturing.',
};

export default async function UseCasesPage() {
  const useCases = await prisma.useCase.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex-1 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
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

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((uc) => (
            <Link
              key={uc.id}
              href={`/use-cases/${uc.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-red-500/50 hover:shadow-lg"
            >
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                {uc.imageUrl ? (
                  <img
                    src={uc.imageUrl}
                    alt={uc.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                    <Wrench className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-red-600 backdrop-blur-sm border border-red-200 shadow-sm">
                  {uc._count.products} Engineered Solutions
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-sans text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                    {uc.title}
                  </h3>
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {uc.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-sans font-semibold text-red-600">
                  <span>Explore Application Solutions</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
