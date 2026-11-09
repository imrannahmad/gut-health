"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const fadeIn = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: shouldReduceMotion ? 0 : 0.6,
      ease: "easeOut" as const,
    },
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#FFFFFF] border-b border-[#E8E8E8]">
      
      {/* =========================================================================
          DESKTOP HERO (≥ 768px): Two-Column Editorial Layout Grounded on Pure White
          ========================================================================= */}
      <div className="hidden md:block relative w-full overflow-hidden bg-[#FFFFFF]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-12 min-h-[580px] lg:min-h-[640px] items-stretch">
            
            {/* Left Column: Brand Story (~45%) */}
            <motion.div
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              transition={fadeIn.transition}
              className="col-span-5 lg:col-span-5 flex flex-col justify-center py-12 lg:py-16 space-y-6 lg:space-y-8 z-10"
            >
              {/* Eyebrow in Deep Maroon */}
              <p className="text-xs lg:text-[13px] font-bold tracking-[0.22em] text-[#54232F] uppercase">
                GUTGLOW · DAILY WELLNESS
              </p>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-[46px] lg:text-[58px] xl:text-[68px] font-extrabold text-[#111111] tracking-[-0.03em] leading-[1.0] lg:leading-[0.96]">
                YOUR WELLNESS. <br />
                STARTS WITHIN.
              </h1>

              {/* Supporting Description */}
              <p className="text-base lg:text-lg text-[#555555] leading-relaxed max-w-md font-normal">
                A thoughtful approach to everyday gut wellness, designed around
                feeling better from within.
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-6 pt-2">
                <Link
                  href="/product"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#111111] text-[#FFFFFF] px-8 py-4 rounded-lg text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#333333] transition-colors duration-200 shadow-sm"
                >
                  <span>DISCOVER GUTGLOW</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/philosophy"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#54232F] transition-colors duration-200 py-1"
                >
                  <span>Our Philosophy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Desktop Brand Details */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-8 border-t border-[#E8E8E8] text-xs text-[#555555] tracking-wider uppercase font-semibold">
                <span>Thoughtful Wellness</span>
                <span className="text-[#CCCCCC] select-none">·</span>
                <span>Transparent Information</span>
                <span className="text-[#CCCCCC] select-none">·</span>
                <span>Quality Focused</span>
              </div>
            </motion.div>

            {/* Right Column: Physical Product Grounded on Side (~55%) */}
            <motion.div
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              transition={fadeIn.transition}
              className="col-span-7 lg:col-span-7 relative flex items-end justify-end self-end h-full"
            >
              <div className="relative w-full max-w-[680px] aspect-[736/618] self-end">
                <Image
                  src="/images/gutglow-hero-desktop.png"
                  alt="GutGlow Daily Wellness Formula jar on natural limestone pedestal"
                  fill
                  priority
                  sizes="(max-width: 1024px) 50vw, 680px"
                  className="object-contain object-bottom object-right"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE HERO (< 768px): Text FIRST, Grounded Product Arrangement BELOW
          ========================================================================= */}
      <div className="block md:hidden px-5 pt-6 pb-8">
        <motion.div
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={fadeIn.transition}
          className="flex flex-col space-y-6"
        >
          {/* 1. EDITORIAL TYPOGRAPHY & CTA (ON TOP) */}
          <div className="space-y-4">
            {/* Eyebrow */}
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#54232F] uppercase">
              GUTGLOW · DAILY WELLNESS
            </p>

            {/* Main Headline */}
            <h1 className="text-[32px] min-[360px]:text-[36px] sm:text-4xl font-extrabold text-[#111111] tracking-[-0.03em] leading-[1.04]">
              YOUR WELLNESS. <br />
              STARTS WITHIN.
            </h1>

            {/* Supporting Description */}
            <p className="text-sm text-[#555555] leading-relaxed font-normal">
              A thoughtful approach to everyday gut wellness, designed around
              feeling better from within.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/product"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-3.5 px-6 rounded-lg text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#333333] transition-colors shadow-sm text-center"
              >
                <span>DISCOVER GUTGLOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/philosophy"
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#54232F] transition-colors py-1.5 text-center"
              >
                <span>Our Philosophy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 2. PHYSICAL PRODUCT ON LIMESTONE PEDESTAL (SEAMLESS ON WHITE) */}
          <div className="relative w-full max-w-[440px] mx-auto aspect-[650/590] select-none pt-2">
            <Image
              src="/images/gutglow-hero-mobile.png"
              alt="GutGlow Daily Wellness Formula on natural limestone pedestal"
              fill
              priority
              sizes="(max-width: 767px) 100vw, 440px"
              className="object-contain object-bottom"
            />
          </div>

          {/* 3. Minimal Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-4 border-t border-[#E8E8E8] text-[11px] text-[#666666] tracking-wider uppercase font-semibold text-center">
            <span>Thoughtful Wellness</span>
            <span className="text-[#CCCCCC] select-none">·</span>
            <span>Transparent Information</span>
            <span className="text-[#CCCCCC] select-none">·</span>
            <span>Quality Focused</span>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
