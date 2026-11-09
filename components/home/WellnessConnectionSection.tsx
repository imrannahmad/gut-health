"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="mb-8 sm:mb-16">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#666666] block mb-2">
            THE WELLNESS CONNECTION
          </span>
          <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111]">
            More Than Just Digestion.
          </h2>
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-[#666666] uppercase tracking-wider mb-3">
          <span>Swipe to explore</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        {/* Cards: Mobile Swipeable (snap-x) + Desktop 3-col Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible">
          {columns.map((col, index) => (
            <motion.div
              key={col.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="shrink-0 w-[84vw] max-w-[340px] snap-start sm:w-auto sm:max-w-none bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-7 sm:p-8 flex flex-col justify-between hover:border-[#111111] transition-colors"
            >
              <div>
                <span className="text-xs font-semibold text-[#666666] block mb-6 tracking-widest">
                  {col.number}
                </span>

                <h3 className="text-base font-bold text-[#111111] mb-2 tracking-wide">
                  {col.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed line-clamp-2">
                  {col.description}
                </p>
              </div>

              <div className="pt-8 mt-auto">
                <Link
                  href={col.link}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#666666] transition-colors group"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
