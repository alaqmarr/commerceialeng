'use client';

/**
 * modules/enquiries/components/cart-drawer.component.tsx
 * Slide-over drawer displaying selected RFQ items and checkout link.
 * Strictly under 200 lines.
 */

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, isDrawerOpen, closeDrawer, totalCount } =
    useCart();

  if (!isDrawerOpen) return null;

  return (
    <div
      data-testid="enquiry-cart-drawer"
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm transition-opacity"
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-gray-200 bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-red-600" />
              <h2 className="font-sans text-base font-bold text-gray-900 uppercase tracking-wider">
                Enquiry Cart ({totalCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              data-testid="close-cart-drawer-btn"
              className="rounded-lg p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200"
              aria-label="Close Enquiry Drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-600">Your enquiry cart is empty.</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Browse our technical catalog to add industrial tapes, adhesives, and sealants to your RFQ.
                </p>
                <Link
                  href="/products"
                  onClick={closeDrawer}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                      {item.categoryName && (
                        <span className="font-sans text-[11px] uppercase text-red-600 font-medium">
                          {item.categoryName}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      aria-label="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
                    <span>Enquiry Quantity:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-6 w-6 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-sans"
                      >
                        -
                      </button>
                      <span className="font-sans font-bold text-red-600 px-1">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-6 w-6 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-sans"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer Actions */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-3">
              <Link
                href="/cart"
                onClick={closeDrawer}
                data-testid="proceed-to-checkout-btn"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-all shadow-md"
              >
                <span>Proceed to RFQ Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
              >
                Clear All Items
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const EnquiryCartDrawer = CartDrawer;
