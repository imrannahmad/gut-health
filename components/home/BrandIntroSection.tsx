"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

export function BrandIntroSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E8E8E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left: Large Editorial Product & Ritual Photography */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/3.6] sm:aspect-[4/3.4] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF6F0] border border-[#EADBCA] shadow-[0_16px_40px_rgba(40,30,20,0.06)]">
              <Image
                src="/images/philosophy-ritual.webp"
                alt="GutGlow Daily Wellness Formula jar angled on limestone pedestal with wooden scoop"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover object-center"
                priority
              />

              {/* Floating Luxury Detail Pill */}
              <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 max-w-[calc(100%-1.5rem)] px-3 py-1.5 sm:px-4 sm:py-2.5 bg-[#FFFFFF]/95 backdrop-blur-md rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-[#E8E8E8] flex items-center gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#54232F] shrink-0" />
                <span className="text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-[#171717] truncate">
                  Daily Ritual · Targeted Microbiome Care
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: Refined Brand Story & Value Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 space-y-6 lg:pl-2"
          >
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4EBDD] rounded-full border border-[#E5DAC8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#54232F]" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#54232F]">
                OUR PHILOSOPHY
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] leading-[1.08] tracking-[-0.02em]">
              Wellness Starts Within.
            </h2>

            {/* Body Text */}
            <p className="text-base sm:text-lg text-[#555555] leading-relaxed font-normal">
              Your everyday wellness begins with the choices you make. GutGlow brings
              a thoughtful approach to digestive wellness and overall well-being — formulated
              with targeted prebiotic fibers and gentle botanicals to nourish your natural microbiome
              consistently from within, without harsh stimulants.
            </p>

            {/* Micro Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EADBCA] space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Gentle & Non-Laxative
                </p>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Formulated for calm, daily digestive rhythm without unexpected disruptions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EADBCA] space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Microbiome Nourishment
                </p>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Active prebiotics that feed beneficial flora to reinforce barrier health.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-5 pt-3">
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs"
              >
                <span>Discover Our Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/philosophy"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#54232F] transition-colors py-1"
              >
                <span>The Science</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
