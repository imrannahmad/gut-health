"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function CustomerFeedbackSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#F8F6EF] border-b border-[#E6E1D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 space-y-4">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#173D32]">
              COMMUNITY TRANSPARENCY
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#173D32]">
              Verified Feedback Only
            </h2>
            <p className="text-sm sm:text-base text-[#575D52] leading-relaxed">
              We hold a zero-tolerance policy for fabricated testimonials, purchased
              reviews, or exaggerated before-and-after results.
            </p>
          </div>

          {/* Editorial Clean Empty State Box */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-[#E6E1D3] rounded-3xl p-8 sm:p-12 bg-[#EEEBDD]/50 text-center space-y-6 shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-[#F8F6EF] border border-[#E6E1D3] flex items-center justify-center text-[#173D32] mx-auto">
              <ShieldCheck className="w-6 h-6 stroke-[1.5] text-[#7D9273]" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl font-serif text-[#173D32]">
                Inaugural Batch Feedback Forthcoming
              </h3>
              <p className="text-xs sm:text-sm text-[#575D52] leading-relaxed">
                As our founding production batch is delivered to early community
                subscribers, verified customer experiences and clinical feedback
                will be published right here without editorial filtration.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E6E1D3] flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
              <Link
                href="/product"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#173D32] text-[#F8F6EF] px-6 py-3 rounded-full uppercase tracking-wider font-medium hover:bg-[#122e26] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B99A63]" />
                <span>Join The Founding Cohort</span>
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#173D32]/30 text-[#173D32] px-6 py-3 rounded-full uppercase tracking-wider font-medium hover:bg-[#EEEBDD] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Submit Experience</span>
              </Link>
            </div>

            <div className="text-[11px] text-[#A9B9A0] tracking-wider uppercase font-medium">
              100% Verified Buyer Submissions Only
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
