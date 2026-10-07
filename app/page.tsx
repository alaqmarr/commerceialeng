import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { HeroSlider } from '@/components/HeroSlider';
import { ProductCard } from '@/components/ProductCard';
import {
  ArrowRight,
  Shield,
  Layers,
  Wrench,
  Database,
  CheckCircle,
  ExternalLink,
  PhoneCall,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Query Hero Images from SQLite
  const heroSlides = await prisma.heroImage.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });

  // Query Featured Categories
  const categories = await prisma.category.findMany({
    take: 4,
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Query Flagship Products
  const products = await prisma.product.findMany({
    take: 6,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Query Industrial Use Cases
  const useCases = await prisma.useCase.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Database-Controlled Hero Carousel Slider */}
      <HeroSlider
        slides={heroSlides.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          imageUrl: s.imageUrl,
          linkUrl: s.linkUrl,
          order: s.order,
        }))}
      />

      {/* 2. Engineering Value Pillars / Industrial Theme Bar */}
      <section className="border-b border-gray-200 bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-sans text-base font-bold text-gray-900">
                Industrial Tapes & Sealants
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                VHB acrylic foam tapes, structural bonding films, neutral-cure silicone sealants, and elastomeric polyurethane facade solutions engineered for durability.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="font-sans text-base font-bold text-gray-900">
                Engineered Bonding & Fastener Replacement
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Toughened two-part epoxies, anaerobic threadlockers, and cyanoacrylates providing superior shear, peel, and vibration resistance.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="font-sans text-base font-bold text-gray-900">
                Fast Enquiry & Quotations
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Quick quotations via WhatsApp, direct email, or our online enquiry cart with prompt response from our sales engineering team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories Directory */}
      <section className="py-16 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-red-600 font-semibold mb-1">
                <span>Product Categories</span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold uppercase text-gray-900 tracking-tight">
                Featured Categories
              </h2>
            </div>
            <Link
              href="/categories?from=home"
              className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              <span>View All Categories</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-red-500/50 hover:shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                      <Layers className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-red-600 backdrop-blur-sm border border-red-200 shadow-sm">
                    {cat._count.products} Products
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {cat.description || 'Engineered industrial substrates and bonding media.'}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-sans font-semibold text-red-600 pt-2 border-t border-gray-100">
                    <span>Explore Products</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Flagship Industrial Products Catalog */}
      <section className="py-16 border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-red-600 font-semibold mb-1">
                <span>Featured Products</span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold uppercase text-gray-900 tracking-tight">
                Flagship Catalog Products
              </h2>
            </div>
            <Link
              href="/products?from=home"
              className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              <span>Browse Full Catalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  shortDesc: p.shortDesc,
                  description: p.description,
                  imageUrl: p.imageUrl,
                  specifications: p.specifications,
                  category: p.category,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Industrial Use Cases & Applications */}
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

      {/* 6. Quick RFQ Consultation Call-to-Action */}
      <section className="py-16 bg-gray-50 border-b border-gray-200 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-sans font-medium text-red-600">
            <CheckCircle className="h-4 w-4" />
            <span>CUSTOM SIZING • TECHNICAL SUPPORT • BULK QUOTES</span>
          </div>

          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
            Need Custom Specifications or Bulk Quotation?
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our technical sales engineers assist in matching substrates, evaluating peel and shear stress parameters, and supplying certified sample rolls for qualification testing.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-red-700 transition-all shadow-md active:scale-95"
            >
              <span>View Enquiry Cart</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/contact?from=home"
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3.5 text-sm font-medium text-gray-800 hover:border-red-500 hover:text-red-600 transition-colors shadow-sm"
            >
              <PhoneCall className="h-4 w-4 text-red-600" />
              <span>Contact Sales Team</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
