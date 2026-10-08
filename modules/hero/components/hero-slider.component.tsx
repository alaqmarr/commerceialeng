"use client";

/**
 * modules/hero/components/hero-slider.component.tsx
 * Presentation component for the homepage hero image carousel with cross-fade.
 * Strictly under 200 lines.
 */

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import type { HeroSlideDTO } from "../hero.types";
import { getFallbackHeroSlides } from "../hero.lib";

export interface HeroSliderProps {
  slides?: HeroSlideDTO[];
}

export function HeroSlider({ slides = [] }: HeroSliderProps) {
  const activeSlides = slides.length > 0 ? slides : getFallbackHeroSlides();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, activeSlides.length]);

  const currentSlide = activeSlides[currentIndex];

  return (
    <section
      className="relative overflow-hidden border-b border-gray-200 bg-gray-50 min-h-[520px] lg:min-h-[620px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Industrial Hero Carousel"
    >
      {/* Background Slides with Cross-Fade */}
      {activeSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/40" />
        </div>
      ))}

      {/* Top and Bottom Accent Lines */}
      <div className="absolute top-0 left-0 right-0 h-1 brand-accent-line z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 z-20" />

      {/* Slide Foreground Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/90 px-3.5 py-1.5 text-xs font-sans font-semibold text-red-600 shadow-sm backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-red-600" />
            <span>INDUSTRIAL TAPES & SEALANTS</span>
          </div>

          <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-gray-900 leading-tight">
            {currentSlide.title}
          </h1>

          {currentSlide.subtitle && (
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl font-normal">
              {currentSlide.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href={`${currentSlide.linkUrl || "/products"}?ref=hero`}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-red-700 transition-all shadow-md active:scale-95"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white/90 px-5 py-3.5 text-sm font-medium text-gray-800 hover:border-red-500 hover:text-red-600 backdrop-blur-sm transition-colors shadow-sm"
            >
              <ShoppingCart className="h-4 w-4 text-red-600" />
              <span>Request for Quotation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Arrows */}
      {activeSlides.length > 1 && (
        <div className="absolute inset-y-0 right-4 hidden md:flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Hero Slide"
            className="rounded-lg border border-gray-300 bg-white/90 p-2 text-gray-700 hover:border-red-500 hover:text-red-600 transition-colors backdrop-blur-sm shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Hero Slide"
            className="rounded-lg border border-gray-300 bg-white/90 p-2 text-gray-700 hover:border-red-500 hover:text-red-600 transition-colors backdrop-blur-sm shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Bottom Carousel Dot Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 transition-all rounded-full ${
                idx === currentIndex
                  ? "w-8 bg-red-600"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
