import React from 'react';
import type { Metadata } from 'next';
import { getHeroSlidesQuery, HeroSlider, ValuePillars } from '@/modules/hero';
import { getCategoriesQuery, HomeCategoriesSection } from '@/modules/categories';
import { getFeaturedProductsQuery, FeaturedProductsSection } from '@/modules/products';
import { getUseCasesQuery, HomeUseCasesSection } from '@/modules/use-cases';
import { HomeRfqCta } from '@/modules/enquiries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Commercial Engineering Associates | Industrial Tapes, Sealants & Adhesives',
  description:
    'Authorized distributor and technical solution provider for high-performance industrial tapes, structural adhesives, silicone sealants, and precision bonding materials.',
};

export default async function HomePage() {
  const [heroSlides, categories, products, useCases] = await Promise.all([
    getHeroSlidesQuery({ activeOnly: true }),
    getCategoriesQuery({ take: 4, orderBy: 'createdAt', orderDirection: 'desc' }),
    getFeaturedProductsQuery(6),
    getUseCasesQuery({ take: 4, orderBy: 'createdAt', orderDirection: 'desc' }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HeroSlider slides={heroSlides} />
      <ValuePillars />
      <HomeCategoriesSection categories={categories} />
      <FeaturedProductsSection products={products} />
      <HomeUseCasesSection useCases={useCases} />
      <HomeRfqCta />
    </div>
  );
}
