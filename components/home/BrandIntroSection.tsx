"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function BrandIntroSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E8E8E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Large Editorial Image */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F7F7F7] border border-[#E8E8E8]">
              <Image
                src="/images/product-lifestyle-routine.jpg"
                alt="GutGlow Morning Ritual"
                fill
                sizes="(max-width: 1024px) 100vw, 550px"
                className="object-cover object-center grayscale contrast-110"
              />
            </div>
          </motion.div>

          {/* Right: Concise Text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#777777]">
              OUR PHILOSOPHY
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111] leading-tight">
              Wellness Starts Within.
            </h2>

            <p className="text-base sm:text-lg text-[#777777] leading-relaxed font-normal">
              Your everyday wellness begins with the choices you make. GutGlow brings
              a thoughtful approach to digestive wellness and overall well-being.
            </p>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-semibold text-[#111111] hover:text-[#333333] transition-colors group"
              >
                <span>Discover Our Story</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
