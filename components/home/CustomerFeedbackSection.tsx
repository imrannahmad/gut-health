"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CustomerFeedbackSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E8E8E8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Heading */}
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#777777] block mb-2">
          VERIFIED FEEDBACK
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111] mb-6">
          Real Experiences. Real Voices.
        </h2>

        {/* Minimal Editorial Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border border-[#E8E8E8] rounded-2xl p-8 sm:p-12 bg-[#F7F7F7] max-w-2xl mx-auto space-y-5"
        >
          <p className="text-xs sm:text-sm text-[#777777] leading-relaxed max-w-lg mx-auto">
            We do not publish fabricated reviews or synthetic star ratings.
            Verified feedback from our founding cohort will be published here
            unfiltered following initial batch fulfillment.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/product"
              className="inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] px-6 py-3 rounded-full text-xs uppercase tracking-wider font-medium hover:bg-[#333333] transition-colors"
            >
              <span>Join The Founding Cohort</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs uppercase tracking-wider font-medium text-[#111111] border border-[#E8E8E8] hover:border-[#111111] transition-colors"
            >
              Share Experience
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
