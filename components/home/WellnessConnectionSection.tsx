"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const columns = [
  {
    number: "01",
    title: "GUT HEALTH",
    description: "The core foundation of daily digestion, nutrient assimilation, and internal balance.",
    link: "/philosophy",
  },
  {
    number: "02",
    title: "SKIN WELLNESS",
    description: "The gut-skin axis connects internal equilibrium with everyday dermal comfort and barrier health.",
    link: "/philosophy",
  },
  {
    number: "03",
    title: "HAIR WELLNESS",
    description: "Effective cellular nutrient absorption provides the building blocks for normal follicle vitality.",
    link: "/philosophy",
  },
];

export function WellnessConnectionSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#F5F5F5] border-b border-[#E5E5E5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-8 sm:mb-12">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#666666] block mb-2">
            THE WELLNESS CONNECTION
          </span>
          <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111]">
            More Than Just Digestion.
          </h2>
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="md:hidden flex items-center justify-between text-[11px] text-[#666666] uppercase tracking-wider mb-3">
          <span>Swipe to explore</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        {/* Cards: Mobile Swipeable (snap-x) + Tablet/Desktop 3-col Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
          {columns.map((col) => (
            <div
              key={col.number}
              className="shrink-0 w-[82vw] max-w-[320px] snap-start md:w-auto md:max-w-none bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-7 lg:p-8 flex flex-col justify-between hover:border-[#111111] transition-all duration-200 shadow-xs"
            >
              <div>
                <span className="text-xs font-semibold text-[#666666] block mb-4 sm:mb-6 tracking-widest">
                  {col.number}
                </span>

                <h3 className="text-base font-bold text-[#111111] mb-2 tracking-wide">
                  {col.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  {col.description}
                </p>
              </div>

              <div className="pt-6 sm:pt-8 mt-auto">
                <Link
                  href={col.link}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#54232F] transition-colors group"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
