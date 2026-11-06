"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Leaf } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F8F6EF] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E6E1D3]">
      {/* Subtle organic background ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#A9B9A0]/15 rounded-full blur-3xl pointer-events-none -mr-40 -mt-20" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#EEEBDD] rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEEBDD] border border-[#E6E1D3] text-[#173D32]">
              <Sparkles className="w-3.5 h-3.5 text-[#B99A63]" />
              <span className="text-[11px] font-medium tracking-[0.22em] uppercase">
                YOUR WELLNESS, FROM WITHIN
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#173D32] tracking-tight leading-[1.12]">
              Feel Better <br />
              <span className="italic font-normal text-[#252923]">From Within.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#575D52] leading-relaxed max-w-xl font-normal">
              Discover a more thoughtful approach to everyday gut wellness. Because
              true comfort, natural vitality, and feeling good always start from
              within.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-3 bg-[#173D32] text-[#F8F6EF] px-8 py-4 rounded-full text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#122e26] transition-all duration-300 shadow-md hover:shadow-lg group"
              >
                <span>Discover GutGlow</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/philosophy"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full text-xs uppercase tracking-[0.18em] font-medium text-[#173D32] border border-[#173D32]/30 hover:border-[#173D32] hover:bg-[#EEEBDD]/50 transition-all duration-200"
              >
                Our Philosophy
              </Link>
            </div>

            {/* Subtle Editorial Trust Metrics */}
            <div className="pt-8 border-t border-[#E6E1D3] grid grid-cols-3 gap-6 text-left max-w-lg">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#A9B9A0] font-medium">
                  Category
                </p>
                <p className="text-sm font-serif font-medium text-[#173D32] mt-0.5">
                  Microbiome Care
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#A9B9A0] font-medium">
                  Ritual
                </p>
                <p className="text-sm font-serif font-medium text-[#173D32] mt-0.5">
                  1 Scoop / Morning
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#A9B9A0] font-medium">
                  Integrity
                </p>
                <p className="text-sm font-serif font-medium text-[#173D32] mt-0.5">
                  Zero Synthetics
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Premium Product Mockup Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Product Frame */}
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#EEEBDD] border border-[#E6E1D3] shadow-[0_20px_50px_rgba(23,61,50,0.08)] group">
                <Image
                  src="/images/product-jar-hero.jpg"
                  alt="GutGlow Daily Wellness Formula jar resting on a warm limestone pedestal"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Subtle Floating Label Badge */}
                <div className="absolute top-4 left-4 bg-[#F8F6EF]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E6E1D3] text-[10px] tracking-[0.18em] uppercase font-medium text-[#173D32] flex items-center gap-1.5 shadow-sm">
                  <Leaf className="w-3 h-3 text-[#7D9273]" />
                  <span>Flagship Daily Formula</span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 inset-x-4 bg-[#173D32]/90 backdrop-blur-md p-4 rounded-2xl border border-[#255547] text-[#F8F6EF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#A9B9A0] block">
                      Single Flagship Edition
                    </span>
                    <span className="text-sm font-serif text-[#F8F6EF]">
                      Daily Wellness Formula
                    </span>
                  </div>
                  <Link
                    href="/product"
                    className="text-xs uppercase tracking-wider bg-[#F8F6EF] text-[#173D32] px-3.5 py-1.5 rounded-full font-medium hover:bg-[#EEEBDD] transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>

              {/* Decorative Botanical Note */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#575D52] mt-4 px-2">
                <ShieldCheck className="w-4 h-4 text-[#7D9273]" />
                <span>Formulated for daily integration · Laboratory verified</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
