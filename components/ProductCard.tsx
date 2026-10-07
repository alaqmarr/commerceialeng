'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, ArrowRight, Layers, Check } from 'lucide-react';

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  description: string;
  imageUrl?: string | null;
  specifications?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ProductCardProps {
  product: ProductCardData;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = React.useState(false);

  // Parse specifications JSON safely
  let specsObj: Record<string, string> = {};
  if (product.specifications) {
    try {
      specsObj = JSON.parse(product.specifications);
    } catch {
      specsObj = {};
    }
  }

  const specKeys = Object.keys(specsObj).slice(0, 2);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      categoryName: product.category?.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      data-testid="product-card"
      className="product-card group relative flex flex-col justify-between overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 hover:border-red-500/50 hover:shadow-lg"
    >
      {/* Top accent on hover */}
      <div className="h-0.5 w-full bg-gray-200 transition-colors group-hover:bg-red-600" />

      {/* Product Image Area */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block h-48 w-full overflow-hidden bg-gray-100"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 p-4 text-center">
            <Layers className="h-10 w-10 text-gray-400 mb-2" />
            <span className="font-sans text-[11px] uppercase tracking-wider text-gray-500 font-medium">
              Commercial Engineering
            </span>
          </div>
        )}

        {/* Category Badge */}
        {product.category?.name && (
          <div className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-red-600 backdrop-blur-sm border border-red-200 shadow-sm">
            {product.category.name}
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/products/${product.slug}`} className="group-hover:text-red-600">
          <h3 className="font-sans text-base font-semibold text-gray-900 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {product.shortDesc || product.description}
        </p>

        {/* Technical Specification Snippets */}
        {specKeys.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
            {specKeys.map((key) => (
              <span
                key={key}
                className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-sans text-gray-700"
              >
                <span className="text-red-600 mr-1 font-medium">{key}:</span> {specsObj[key]}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleAddToCart}
            data-testid="add-to-cart"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-all shadow-sm active:scale-95"
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5 text-white" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5 text-white" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <Link
            href={`/products/${product.slug}`}
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="View Specifications"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
