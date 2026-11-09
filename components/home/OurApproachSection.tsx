"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Understand",
    description: "Listen to your body's digestive rhythms, hydration, and nutritional cues.",
  },
  {
    step: "02",
    title: "Choose Thoughtfully",
    description: "Focus on clean, bioavailable prebiotics rather than harsh instant purges.",
  },
  {
    step: "03",
    title: "Stay Consistent",
    description: "Build a compounding daily morning habit for sustained internal balance.",
  },
];

export function OurApproachSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E5E5E5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-8 sm:mb-16">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#666666] block mb-2">
            METHODOLOGY
          </span>
          <h2 className="text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111]">
            A Simpler Approach To Wellness.
          </h2>
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-[#666666] uppercase tracking-wider mb-3">
          <span>Swipe to explore steps</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        {/* Cards: Mobile Swipeable (snap-x) + Desktop 3-col Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="shrink-0 w-[84vw] max-w-[340px] snap-start sm:w-auto sm:max-w-none bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-7 sm:p-8 flex flex-col justify-between hover:border-[#111111] transition-colors"
            >
              <div>
                <span className="text-3xl font-bold text-[#111111] block mb-6">
                  {item.step}
                </span>

                <h3 className="text-lg font-bold text-[#111111] mb-2">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-8 mt-auto flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                <span className="text-[10px] uppercase tracking-widest text-[#666666] font-medium">
                  Phase {item.step} of 03
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
