"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Quality Focused",
    description: "Crafted in certified facilities under strict batch standards.",
  },
  {
    title: "Thoughtful Formulation",
    description: "Carefully chosen botanicals selected for tolerability.",
  },
  {
    title: "Transparent Information",
    description: "Zero proprietary matrices or hidden artificial additives.",
  },
  {
    title: "Everyday Wellness",
    description: "Effortlessly integrates into your morning water routine.",
  },
];

export function WhyGutGlowSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#F5F5F5] border-b border-[#E5E5E5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-8 sm:mb-16">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#666666] block mb-2">
            OUR PRINCIPLES
          </span>
          <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111]">
            Thoughtful By Design.
          </h2>
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-[#666666] uppercase tracking-wider mb-3">
          <span>Swipe to explore</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        {/* Cards: Mobile Swipeable (snap-x) + Desktop 4-col Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="shrink-0 w-[84vw] max-w-[300px] snap-start sm:w-auto sm:max-w-none bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-7 flex flex-col justify-between hover:border-[#111111] transition-colors"
            >
              <div>
                <span className="text-[11px] font-medium text-[#666666] uppercase tracking-widest block mb-4">
                  0{idx + 1}
                </span>

                <h3 className="text-base font-bold text-[#111111] mb-2">
                  {feature.title}
                </h3>

                <p className="text-xs text-[#666666] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
