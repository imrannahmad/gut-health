"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#173D32] text-[#F8F6EF] py-24 lg:py-36 selection:bg-[#F8F6EF] selection:text-[#173D32]">
      {/* Background Subtle Editorial Atmosphere */}
      <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
        <Image
          src="/images/product-botanicals.jpg"
          alt="Botanical background"
          fill
          className="object-cover"
        />
      </div>

      {/* Decorative gradient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#255547] rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0E2921] rounded-full blur-3xl opacity-70 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#255547] border border-[#A9B9A0]/20 text-[#A9B9A0]">
            <Sparkles className="w-3.5 h-3.5 text-[#B99A63]" />
            <span className="text-[11px] font-medium tracking-[0.22em] uppercase">
              YOUR MORNING RITUAL
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#F8F6EF] tracking-tight leading-[1.15]">
            Start Your Wellness Journey <br />
            <span className="italic font-light text-[#A9B9A0]">From Within.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#A9B9A0] max-w-xl mx-auto leading-relaxed font-light">
            Give your digestive system the consistent, gentle support it deserves.
            One daily scoop. Pure botanicals. Measurable ease.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/product"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#F8F6EF] text-[#173D32] hover:bg-[#EEEBDD] px-9 py-4 rounded-full text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-lg group"
            >
              <span>Explore GutGlow</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/philosophy"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-xs uppercase tracking-[0.2em] font-medium text-[#F8F6EF] border border-[#F8F6EF]/30 hover:border-[#F8F6EF] hover:bg-[#255547]/50 transition-colors"
            >
              Learn The Science
            </Link>
          </div>

          <div className="pt-8 text-xs text-[#A9B9A0]/80 tracking-widest uppercase">
            Complimentary Nationwide Shipping · 30-Day Happiness Guarantee
          </div>
        </motion.div>
      </div>
    </section>
  );
}
