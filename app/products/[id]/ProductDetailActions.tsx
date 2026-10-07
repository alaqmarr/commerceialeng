'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { WhatsAppEnquiryButton } from '@/components/WhatsAppEnquiryButton';
import { EmailEnquiryModal } from '@/components/EmailEnquiryModal';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';

interface ProductDetailActionsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string | null;
    categoryName?: string | null;
  };
  whatsappNumber?: string;
}

export function ProductDetailActions({
  product,
  whatsappNumber,
}: ProductDetailActionsProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrl,
        categoryName: product.categoryName,
      },
      quantity
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="font-sans text-xs uppercase tracking-wider text-gray-500 font-medium">
          Enquiry Quantity:
        </span>
        <div className="flex items-center rounded-lg border border-gray-300 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2 text-gray-500 hover:text-gray-900"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-sans text-sm font-bold text-red-600">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="p-2 text-gray-500 hover:text-gray-900"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Action Buttons Grid */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          data-testid="add-to-cart"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-red-700 transition-all shadow-md active:scale-95"
        >
          {isAdded ? (
            <>
              <Check className="h-4 w-4 text-white" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 text-white" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        {/* WhatsApp Button */}
        <WhatsAppEnquiryButton
          productName={product.name}
          productSlug={product.slug}
          whatsappNumber={whatsappNumber}
        />

        {/* Email Enquiry Modal Trigger */}
        <EmailEnquiryModal
          productId={product.id}
          productName={product.name}
          productSlug={product.slug}
        />
      </div>
    </div>
  );
}
