"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#FFFFFF] border-b border-[#E8E8E8]">
      
      {/* =========================================================================
          DESKTOP HERO (≥ 900px): Balanced Editorial Layout with Prominent Product
          ========================================================================= */}
      <div className="hidden min-[900px]:block relative w-full overflow-hidden bg-[#FFFFFF]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-12 min-h-[520px] lg:min-h-[580px] xl:min-h-[620px] items-center">
            
            {/* Left Column: Brand Story (~45-48%) */}
            <div className="col-span-6 lg:col-span-5 min-w-0 flex flex-col justify-center py-8 lg:py-12 space-y-5 lg:space-y-6 z-10">
              {/* Eyebrow in Deep Maroon */}
              <p className="text-xs lg:text-[13px] font-bold tracking-[0.22em] text-[#54232F] uppercase">
                GUTGLOW · DAILY WELLNESS
              </p>

              {/* Main Headline with fluid clamp typography */}
              <h1
                className="font-extrabold text-[#111111] tracking-[-0.03em]"
                style={{
                  fontSize: "clamp(2.35rem, 4.4vw, 4.25rem)",
                  lineHeight: 1.0,
                }}
              >
                YOUR WELLNESS. <br />
                STARTS WITHIN.
              </h1>

              {/* Supporting Description */}
              <p className="text-sm lg:text-base xl:text-lg text-[#555555] leading-relaxed max-w-md font-normal">
                A thoughtful approach to everyday gut wellness, designed around
                feeling better from within.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-1">
                <Link
                  href="/product"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#111111] text-[#FFFFFF] px-6 lg:px-8 py-3.5 lg:py-4 rounded-lg text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#333333] transition-colors duration-200 shadow-sm whitespace-nowrap"
                >
                  <span>DISCOVER GUTGLOW</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/philosophy"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#54232F] transition-colors duration-200 py-1 whitespace-nowrap"
                >
                  <span>Our Philosophy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Desktop Brand Details */}
              <div className="flex flex-wrap items-center gap-x-4 lg:gap-x-6 gap-y-2 pt-6 lg:pt-8 border-t border-[#E8E8E8] text-[11px] lg:text-xs text-[#555555] tracking-wider uppercase font-semibold">
                <span>Thoughtful Wellness</span>
                <span className="text-[#CCCCCC] select-none">·</span>
                <span>Transparent Information</span>
                <span className="text-[#CCCCCC] select-none">·</span>
                <span>Quality Focused</span>
              </div>
            </div>

            {/* Right Column: Physical Product on Luxury Architectural Countertop (~52-55%) */}
            <div className="col-span-6 lg:col-span-7 relative flex items-center justify-center lg:justify-end h-full py-4 lg:py-6">
              <div className="relative w-full max-w-[620px] lg:max-w-[700px] xl:max-w-[760px] aspect-[836/638]">
                <Image
                  src="/images/gutglow-hero-desktop.webp"
                  alt="GutGlow Daily Wellness Formula jar on luxury architectural limestone countertop"
                  fill
                  priority
                  sizes="(max-width: 1024px) 50vw, 760px"
                  className="object-contain object-center lg:object-right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE & TABLET HERO (< 900px): Clean, Upward-Shifted, Balanced Layout
          ========================================================================= */}
      <div className="block min-[900px]:hidden pt-1 pb-6 sm:pb-8 max-w-xl mx-auto overflow-hidden">
        {/* 1. PRODUCT COMPOSITION (LARGER, FLUSH TO RIGHT SCREEN EDGE, NATURAL ARCHITECTURAL PERSPECTIVE) */}
        <div className="w-full flex justify-end overflow-visible">
          <div className="relative w-[96%] min-[360px]:w-[94%] sm:w-[88%] max-w-[460px] aspect-[1024/682] select-none ml-auto mr-0">
            <Image
              src="/images/gutglow-hero-mobile.webp"
              alt="GutGlow Daily Wellness Formula jar on natural limestone platform"
              fill
              priority
              sizes="(max-width: 640px) 95vw, 460px"
              className="object-contain object-right"
            />
          </div>
        </div>

        {/* 2. EDITORIAL TYPOGRAPHY & CTA (WITH CLEAN HORIZONTAL MARGINS) */}
        <div className="px-4 min-[360px]:px-5 sm:px-6 mt-2 space-y-3 sm:space-y-3.5">
          {/* Small Brand Eyebrow */}
          <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#54232F] uppercase">
            GUTGLOW · DAILY WELLNESS
          </p>

          {/* Main Headline with fluid clamp typography */}
          <h1
            className="font-extrabold text-[#111111] tracking-[-0.03em]"
            style={{
              fontSize: "clamp(1.75rem, 7.5vw, 2.35rem)",
              lineHeight: 1.05,
            }}
          >
            YOUR WELLNESS. <br />
            STARTS WITHIN.
          </h1>

          {/* Short Supporting Description */}
          <p className="text-xs min-[360px]:text-sm sm:text-base text-[#555555] leading-relaxed font-normal">
            A thoughtful approach to everyday gut wellness, designed around
            feeling better from within.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
            <Link
              href="/product"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-3.5 px-6 rounded-lg text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#333333] transition-colors shadow-sm text-center"
            >
              <span>DISCOVER GUTGLOW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/philosophy"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#54232F] transition-colors py-2 sm:py-3.5 sm:px-4 text-center"
            >
              <span>Our Philosophy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3. Minimal Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 min-[360px]:gap-x-3 gap-y-1 pt-3 border-t border-[#E8E8E8] text-[9px] min-[360px]:text-[10px] sm:text-[11px] text-[#666666] tracking-wider uppercase font-semibold text-center">
            <span>Thoughtful Wellness</span>
            <span className="text-[#CCCCCC] select-none">·</span>
            <span>Transparent Information</span>
            <span className="text-[#CCCCCC] select-none">·</span>
            <span>Quality Focused</span>
          </div>
        </div>
      </div>

    </section>
  );
}
