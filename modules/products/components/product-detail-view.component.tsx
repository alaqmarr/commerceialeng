import React from "react";
import Link from "next/link";
import { ShieldCheck, ChevronRight, Layers, Wrench, FileText } from "lucide-react";
import type { ProductWithDetailsDTO } from "../products.types";
import {
  parseProductSpecifications,
  getDefaultEngineeringSpecs,
  parseGalleryImages,
} from "../products.lib";
import { ProductDetailActions } from "./product-detail-actions.component";
import { ProductDetailSpecsTable } from "./product-detail-specs-table.component";

export interface ProductDetailViewProps {
  product: ProductWithDetailsDTO;
  whatsappNumber?: string;
}

export function ProductDetailView({
  product,
  whatsappNumber,
}: ProductDetailViewProps) {
  let specs = parseProductSpecifications(product.specifications);
  if (Object.keys(specs).length === 0) {
    specs = getDefaultEngineeringSpecs();
  }

  const gallery = parseGalleryImages(product.galleryImages, product.imageUrl);

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
                // eslint-disable-next-line @next/next/no-img-element
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
            {product.useCases && product.useCases.length > 0 && (
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

            {/* Action Buttons */}
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
        <ProductDetailSpecsTable productName={product.name} specs={specs} />
      </div>
    </div>
  );
}
