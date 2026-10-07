'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Menu, X, Shield, PhoneCall } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { totalCount, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Products', href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'Use Cases', href: '/use-cases' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      {/* Top Brand Red Accent Line */}
      <div className="h-0.5 w-full brand-accent-line" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center min-w-0">
          <Link href="/" className="flex items-center gap-2.5 group min-w-0">
            <Image
              src="/logo.webp"
              alt="Commercial Engineering Associates"
              width={40}
              height={40}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-md object-contain shrink-0"
              priority
            />
            <div className="flex flex-col min-w-0">
              <span className="font-sans text-xs sm:text-sm font-bold tracking-tight text-gray-900 group-hover:text-red-600 transition-colors leading-none truncate">
                COMMERCIAL ENGINEERING
              </span>
              <span className="hidden sm:inline font-sans text-[10px] tracking-wider text-gray-500 uppercase truncate">
                Associates • Tapes & Sealants
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-red-600 ${
                  isActive ? 'text-red-600 border-b-2 border-red-600 py-1' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Action Icons: Cart & Admin */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Enquiry Cart Trigger Button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label="Open Enquiry Cart"
            data-testid="navbar-cart-btn"
            className="relative flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:border-red-500 hover:text-red-600 transition-all shadow-sm"
          >
            <ShoppingCart className="h-4 w-4 text-red-600 shrink-0" />
            <span className="hidden sm:inline">Enquiry Cart</span>
            <span
              data-testid="cart-badge-count"
              suppressHydrationWarning
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold font-sans ${
                totalCount > 0 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Admin Link (Desktop/Tablet) */}
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-100 transition-colors"
            title="Admin Portal"
          >
            <Shield className="h-3.5 w-3.5 text-gray-500" />
            <span className="hidden lg:inline">Admin</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
          >
            <PhoneCall className="h-4 w-4" />
            Get In Touch
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Shield className="h-4 w-4" />
            Admin Portal
          </Link>
        </div>
      )}
    </header>
  );
}
