"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function FinalCtaSection() {
  return (
    <section className="bg-[#111111] text-[#FFFFFF] py-24 lg:py-36 selection:bg-[#FFFFFF] selection:text-[#111111]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Your Wellness. <br />
            Your Way.
          </h2>

          <p className="text-base sm:text-lg text-[#FFFFFF]/70 max-w-md mx-auto leading-relaxed">
            Discover a more thoughtful approach to everyday wellness.
          </p>

          <div className="pt-4">
            <Link
              href="/product"
              className="inline-flex items-center justify-center gap-2.5 bg-[#FFFFFF] text-[#111111] hover:bg-[#F7F7F7] px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.16em] font-medium transition-colors"
            >
              <span>Explore GutGlow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
