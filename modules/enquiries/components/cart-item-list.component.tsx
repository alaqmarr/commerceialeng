'use client';

/**
 * modules/enquiries/components/cart-item-list.component.tsx
 * Cart line items list displaying product thumbnails, quantities, and removals.
 * Strictly under 200 lines.
 */

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Trash2, FileText } from 'lucide-react';

export function CartItemList() {
  const { items, removeItem, updateQuantity } = useCart();

  return (
    <div className="space-y-4">
      <h3 className="font-sans text-base font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-red-600" />
        <span>Selected Items ({items.length})</span>
      </h3>

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500 font-sans">
          No products selected. Items added from product pages will appear here.
        </div>
      ) : (
        <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {items.map((item) => (
            <div key={item.productId} className="p-4 sm:p-5 flex items-start gap-4">
              {/* Thumbnail */}
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <FileText className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {item.categoryName && (
                      <span className="font-sans text-[11px] uppercase text-red-600 block font-medium">
                        {item.categoryName}
                      </span>
                    )}
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-sans text-sm font-bold text-gray-900 hover:text-red-600 transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs text-gray-600 font-sans">Quantity:</span>
                  <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2.5 py-1 text-gray-500 hover:text-gray-900 font-sans text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-sans text-xs font-bold text-red-600">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2.5 py-1 text-gray-500 hover:text-gray-900 font-sans text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
