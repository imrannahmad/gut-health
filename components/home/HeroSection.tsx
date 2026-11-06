"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#FFFFFF] pt-12 pb-16 lg:pt-20 lg:pb-28 border-b border-[#E8E8E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-7"
          >
            {/* Small Eyebrow */}
            <p className="text-[11px] font-medium tracking-[0.24em] uppercase text-[#777777]">
              GUT HEALTH. EVERYDAY WELLNESS.
            </p>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#111111] tracking-tight leading-[1.05]">
              Feel Better. <br />
              From Within.
            </h1>

            {/* Short Description */}
            <p className="text-base sm:text-lg text-[#777777] leading-relaxed max-w-lg font-normal">
              Thoughtful gut wellness for a healthier approach to everyday living.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-2.5 bg-[#111111] text-[#FFFFFF] px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#333333] transition-colors"
              >
                <span>Discover GutGlow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/philosophy"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.16em] font-medium text-[#111111] border border-[#E8E8E8] hover:border-[#111111] hover:bg-[#F7F7F7] transition-colors"
              >
                Our Philosophy
              </Link>
            </div>

            {/* Minimal Metric Bar */}
            <div className="pt-8 border-t border-[#E8E8E8] grid grid-cols-3 gap-6 max-w-md">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#777777]">
                  Formula
                </p>
                <p className="text-sm font-semibold text-[#111111] mt-0.5">
                  1 Daily Scoop
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#777777]">
                  Purity
                </p>
                <p className="text-sm font-semibold text-[#111111] mt-0.5">
                  Zero Synthetics
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#777777]">
                  Packaging
                </p>
                <p className="text-sm font-semibold text-[#111111] mt-0.5">
                  Recyclable Glass
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Premium Studio Product Photograph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F7F7F7] border border-[#E8E8E8]">
                <Image
                  src="/images/product-jar-hero.jpg"
                  alt="GutGlow Daily Wellness Formula"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover object-center grayscale contrast-125"
                />

                {/* Minimal Label Badge */}
                <div className="absolute top-4 left-4 bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#E8E8E8] text-[10px] tracking-[0.16em] uppercase font-semibold text-[#111111]">
                  Flagship Formula
                </div>

                <div className="absolute bottom-4 inset-x-4 bg-[#FFFFFF]/95 backdrop-blur-sm p-4 rounded-xl border border-[#E8E8E8] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] tracking-[0.18em] uppercase text-[#777777] block">
                      Digestive Care
                    </span>
                    <span className="text-sm font-semibold text-[#111111]">
                      Daily Wellness Formula
                    </span>
                  </div>
                  <Link
                    href="/product"
                    className="text-[11px] uppercase tracking-wider bg-[#111111] text-[#FFFFFF] px-3.5 py-1.5 rounded-full font-medium hover:bg-[#333333] transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
