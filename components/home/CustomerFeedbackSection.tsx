"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CustomerFeedbackSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E5E5E5] overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Heading */}
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#666666] block mb-2">
          VERIFIED FEEDBACK
        </span>
        <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111] mb-6">
          Real Experiences. Real Voices.
        </h2>

        {/* Minimal Editorial Placeholder */}
        <div className="border border-[#E5E5E5] rounded-xl p-6 sm:p-10 lg:p-12 bg-[#F5F5F5] max-w-xl mx-auto space-y-5 shadow-xs">
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-md mx-auto">
            We do not publish fabricated reviews or synthetic star ratings.
            Verified customer feedback from our founding cohort will be published
            here unfiltered following batch dispatch.
          </p>

          <div className="pt-2">
            <Link
              href="/product"
              className="inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] px-7 py-3 rounded-lg text-xs uppercase tracking-wider font-medium hover:bg-[#333333] transition-colors"
            >
              <span>Join The Founding Cohort</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
