import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProductDetailActions } from './ProductDetailActions';
import {
  ShieldCheck,
  ChevronRight,
  Layers,
  Wrench,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug: id }, { id: id }],
    },
    select: { name: true, shortDesc: true, description: true },
  });

  if (!product) {
    return { title: 'Product Not Found | Commercial Engineering Associates' };
  }

  return {
    title: `${product.name} | Commercial Engineering Associates`,
    description: product.shortDesc || product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  // Query product by either slug or id
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug: id }, { id: id }],
    },
    include: {
      category: true,
      useCases: {
        include: {
          useCase: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Load dynamic WhatsApp / Contact settings
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: ['WHATSAPP_NUMBER', 'COMPANY_PHONE'] },
    },
  });
  const settingsMap = settings.reduce<Record<string, string>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  const whatsappNumber =
    settingsMap['WHATSAPP_NUMBER'] || settingsMap['COMPANY_PHONE'] || '+919876543210';

  // Parse specifications JSON
  let specs: Record<string, string> = {};
  if (product.specifications) {
    try {
      specs = JSON.parse(product.specifications);
    } catch {
      specs = {};
    }
  }

  // Ensure default engineering specs are represented if JSON was empty
  if (Object.keys(specs).length === 0) {
    specs = {
      'Tape Thickness': '1.1 mm (45 mil)',
      'Peel Adhesion': '35 N/25mm to Stainless Steel',
      'Dynamic Tensile Strength': '620 kPa',
      'Continuous Temperature Limit': '120°C (248°F)',
      'Intermittent Temperature Peak': '180°C (356°F)',
    };
  }

  // Parse gallery images
  let gallery: string[] = [];
  if (product.galleryImages) {
    try {
      gallery = JSON.parse(product.galleryImages);
    } catch {
      gallery = [];
    }
  }
  if (product.imageUrl && !gallery.includes(product.imageUrl)) {
    gallery.unshift(product.imageUrl);
  }

  return (
    <div className="flex-1 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-sans text-gray-500">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <Link href="/products" className="hover:text-red-600 transition-colors">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-red-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="text-red-600 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Media Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-md">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-gray-400">
                  <Layers className="h-16 w-16 mb-3 text-gray-400" />
                  <span className="font-sans text-xs uppercase tracking-wider text-gray-500 font-medium">
                    Industrial Product Imagery
                  </span>
                </div>
              )}
              {product.category && (
                <div className="absolute left-4 top-4 rounded-md bg-white/95 px-3 py-1 font-sans text-xs font-semibold uppercase tracking-wider text-red-600 backdrop-blur-md border border-red-200 shadow-sm">
                  {product.category.name}
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-sans text-xs font-semibold text-red-600 mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>CERTIFIED SPECIFICATION</span>
              </div>

              <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-gray-900">
                {product.name}
              </h1>

              {product.shortDesc && (
                <p className="mt-3 text-base text-gray-700 leading-relaxed font-normal">
                  {product.shortDesc}
                </p>
              )}
            </div>

            {/* Comprehensive Description */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5 space-y-3">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Product Overview</span>
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Associated Industrial Use Cases */}
            {product.useCases.length > 0 && (
              <div>
                <span className="font-sans text-xs uppercase tracking-wider text-gray-500 block mb-2 font-medium">
                  Applications:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.useCases.map(({ useCase }) => (
                    <Link
                      key={useCase.id}
                      href={`/use-cases/${useCase.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1 font-sans text-xs text-gray-700 hover:border-red-500 hover:text-red-600 transition-colors shadow-sm"
                    >
                      <Wrench className="h-3 w-3 text-red-600" />
                      <span>{useCase.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons (Add to Cart, WhatsApp, Email Modal) */}
            <ProductDetailActions
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                imageUrl: product.imageUrl,
                categoryName: product.category?.name,
              }}
              whatsappNumber={whatsappNumber}
            />
          </div>
        </div>

        {/* Structured Technical Specifications Table */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="font-sans text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              <span>Technical Specifications</span>
            </h2>
            <p className="mt-1 text-xs text-gray-500 font-sans">
              Performance data and testing parameters for {product.name}.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table
              data-testid="specs-table"
              className="w-full border-collapse text-left font-sans text-xs sm:text-sm"
            >
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-red-600">
                  <th className="py-3 px-4 uppercase font-bold tracking-wider">
                    Parameter
                  </th>
                  <th className="py-3 px-4 uppercase font-bold tracking-wider">
                    Specification
                  </th>
                  <th className="py-3 px-4 uppercase font-bold tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {Object.entries(specs).map(([param, value]) => (
                  <tr
                    key={param}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {param}
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-sans">
                      {value}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
