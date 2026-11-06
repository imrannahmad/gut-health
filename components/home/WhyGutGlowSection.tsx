"use client";

import React from "react";
import { Sparkles, ShieldCheck, FileText, Sun } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Sparkles,
    title: "Thoughtful Formulation",
    subtitle: "Physiological Balance, Not Overkill",
    description:
      "Rather than cramming mega-doses of unverified stimulants, we focus on synergistic prebiotic fibers and calming herbal extracts carefully selected for human gut tolerability and gentle, sustained efficacy.",
  },
  {
    icon: ShieldCheck,
    title: "Quality First",
    subtitle: "Purity & Good Manufacturing Practices",
    description:
      "Crafted exclusively in certified GMP and ISO-aligned manufacturing environments. Every ingredient batch undergoes strict microbiological screening and heavy-metal testing before encapsulation.",
  },
  {
    icon: FileText,
    title: "Transparent Information",
    subtitle: "No Proprietary Blends or Hidden Fillers",
    description:
      "We believe you have the right to know exactly what enters your body. We reject mysterious proprietary matrices, synthetic binders, maltodextrin, and artificial sweeteners.",
  },
  {
    icon: Sun,
    title: "Everyday Wellness",
    subtitle: "Built to Integrate Into Real Life",
    description:
      "A wellness routine only works if you can maintain it consistently. Our formula dissolves effortlessly into pure water with a subtle, clean natural herbal note that elevates your morning.",
  },
];

export function WhyGutGlowSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#EEEBDD]/40 border-b border-[#E6E1D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20 space-y-4">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#173D32]">
            OUR STANDARDS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#173D32]">
            Wellness Should Feel Simple.
          </h2>
          <p className="text-sm sm:text-base text-[#575D52] leading-relaxed">
            We stripped away the confusing marketing noise and complex multi-pill
            routines to deliver single-minded excellence for your digestive system.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#F8F6EF] border border-[#E6E1D3] rounded-3xl p-8 flex flex-col justify-between hover:border-[#173D32]/30 transition-all duration-300"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EEEBDD] flex items-center justify-center text-[#173D32] mb-6">
                    <Icon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="text-lg font-serif text-[#173D32] mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] uppercase tracking-wider text-[#B99A63] font-semibold mb-3">
                    {feature.subtitle}
                  </p>
                  <p className="text-xs text-[#575D52] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Responsible Quality Verification Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-[#575D52] max-w-xl mx-auto italic">
            Note: Specific third-party lab certificates of analysis (COA) and batch
            documentation will be updated transparently upon final manufacturing run.
          </p>
        </div>
      </div>
    </section>
  );
}
