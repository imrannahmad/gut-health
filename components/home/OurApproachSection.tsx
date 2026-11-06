"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Understand Your Wellness",
    eyebrow: "Listen To Your Body's Cues",
    description:
      "Every individual's gut microbiome is as unique as a fingerprint. Sustainable wellness begins by understanding how daily diet, hydration, sleep, and stress influence your digestive comfort and vitality.",
  },
  {
    step: "02",
    title: "Make Thoughtful Choices",
    eyebrow: "Quality Over Complexity",
    description:
      "Rather than chasing rapid detoxes or aggressive cleanses, choose clean, bioavailable nutrients and gentle prebiotics that support your digestive enzymes and epithelial barrier integrity.",
  },
  {
    step: "03",
    title: "Build Consistent Habits",
    eyebrow: "The Power Of Daily Ritual",
    description:
      "Microbial ecosystems adapt gradually. Integrating one focused scoop of GutGlow into your quiet morning routine creates compounding digestive stability and holistic well-being over time.",
  },
];

export function OurApproachSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#F8F6EF] border-b border-[#E6E1D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16 lg:mb-20 space-y-4">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#173D32]">
            OUR METHODOLOGY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#173D32]">
            A Thoughtful Path Forward
          </h2>
          <p className="text-sm sm:text-base text-[#575D52] leading-relaxed">
            True wellness is not a 3-day miracle or an aggressive cleanse. It is a
            calm, mindful dialogue between your nutrition and your inner physiology.
          </p>
        </div>

        {/* 3 Step Editorial Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((stepItem, idx) => (
            <motion.div
              key={stepItem.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative p-8 rounded-3xl bg-[#EEEBDD]/50 border border-[#E6E1D3] flex flex-col justify-between"
            >
              <div>
                <span className="font-serif text-5xl font-light text-[#173D32]/30 block mb-6">
                  {stepItem.step}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B99A63] block mb-2">
                  {stepItem.eyebrow}
                </span>
                <h3 className="text-xl font-serif text-[#173D32] mb-4">
                  {stepItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#575D52] leading-relaxed font-normal">
                  {stepItem.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E6E1D3]/60 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#173D32]" />
                <span className="text-[11px] text-[#173D32] uppercase tracking-wider font-medium">
                  Step {stepItem.step} of 03
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
