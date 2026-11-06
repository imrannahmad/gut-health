"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { motion } from "framer-motion";

export function BrandIntroSection() {
  return (
    <section className="py-20 lg:py-32 bg-[#EEEBDD]/40 border-b border-[#E6E1D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Editorial Lifestyle Imagery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative order-2 lg:order-1"
          >
            <div className="relative aspect-[4/3] sm:aspect-[5/4] rounded-3xl overflow-hidden bg-[#EEEBDD] border border-[#E6E1D3] shadow-[0_16px_40px_rgba(23,61,50,0.06)] group">
              <Image
                src="/images/product-lifestyle-routine.jpg"
                alt="Morning wellness ritual with fresh water and GutGlow formula"
                fill
                sizes="(max-width: 1024px) 100vw, 550px"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[11px] tracking-[0.2em] uppercase font-medium text-[#F8F6EF] bg-[#173D32]/80 backdrop-blur-md px-3 py-1 rounded-full">
                  The Daily Morning Ritual
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: Thoughtful Editorial Narrative */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#173D32]">
              <Compass className="w-3.5 h-3.5 text-[#B99A63]" />
              <span>THE GUTGLOW PHILOSOPHY</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#173D32] tracking-tight leading-[1.18]">
              Beauty Is More Than <br />
              <span className="italic font-normal text-[#252923]">Skin Deep.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#575D52] leading-relaxed font-normal">
              Your everyday wellness is connected to the choices you make from within.
              GutGlow is built around a simple philosophy: take care of yourself,
              inside and out.
            </p>

            <p className="text-sm text-[#575D52] leading-relaxed">
              In a wellness landscape flooded with quick fixes and artificial
              promises, we champion physiological patience. By supporting your gut
              microbiome with gentle prebiotics and targeted botanical extracts, we
              help create the foundational harmony where everyday lightness, natural
              energy, and biological balance thrive.
            </p>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-semibold text-[#173D32] hover:text-[#0E2921] group transition-colors"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
