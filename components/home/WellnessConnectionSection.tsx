"use client";

import React from "react";
import { Sparkles, Shield, Heart } from "lucide-react";
import { motion } from "framer-motion";

const columns = [
  {
    number: "01",
    title: "DIGESTIVE WELLNESS",
    tagline: "The Core of Nutrient Breakdown & Gut Motility",
    icon: Shield,
    description:
      "A resilient digestive tract is the gateway to systemic health. The intestinal barrier and trillions of symbiotic microorganisms actively process nutrients, maintain regular motility, and support the body's immune surveillance. When digestion functions smoothly, you experience everyday lightness, reduced post-meal discomfort, and reliable physical ease.",
    note: "Focuses on digestive transit, enzyme activity, and microbial balance.",
  },
  {
    number: "02",
    title: "SKIN WELLNESS",
    tagline: "The Gut-Skin Axis & Nutritional Balance",
    icon: Sparkles,
    description:
      "Modern dermatological and biochemical research highlights the profound two-way dialogue between your gut microbiome and your skin barrier. Optimal nutrient absorption, balanced intestinal flora, and reduced oxidative stress create internal conditions that support your body's normal skin defense mechanisms, hydration balance, and cellular repair.",
    note: "Supports the physiological gut-skin axis without making cosmetic claims.",
  },
  {
    number: "03",
    title: "HAIR WELLNESS",
    tagline: "Cellular Nutrition & Micro-Nutrient Uptake",
    icon: Heart,
    description:
      "Healthy hair follicles require a continuous, bioavailable supply of amino acids, minerals, and vitamins. Even the most nutritious diet is ineffective if the intestinal tract cannot absorb these building blocks effectively. Nurturing digestive efficiency supports the systemic delivery of micronutrients essential for maintaining normal hair follicle vitality.",
    note: "Supports foundational nutrition; does not promise hair regrowth or cure hair fall.",
  },
];

export function WellnessConnectionSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#F8F6EF] border-b border-[#E6E1D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20 space-y-4">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#173D32]">
            THE FOUNDATIONAL CONNECTION
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#173D32]">
            How Everything Connects
          </h2>
          <p className="text-sm sm:text-base text-[#575D52] leading-relaxed">
            Your digestive system isn't just about digestion — it is an intricate
            command center influencing how you feel, how nutrients circulate, and
            how your body renews itself each day.
          </p>
        </div>

        {/* 3 Distinct Editorial Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {columns.map((col, index) => {
            const Icon = col.icon;
            return (
              <motion.div
                key={col.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="bg-[#EEEBDD]/50 border border-[#E6E1D3] rounded-3xl p-8 lg:p-10 flex flex-col justify-between hover:border-[#173D32]/30 transition-all duration-300 hover:shadow-sm"
              >
                <div>
                  {/* Number & Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-serif text-3xl text-[#173D32] opacity-80 font-normal">
                      {col.number}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#F8F6EF] border border-[#E6E1D3] flex items-center justify-center text-[#173D32]">
                      <Icon className="w-4 h-4 stroke-[1.6]" />
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg font-serif tracking-wide text-[#173D32] mb-1">
                    {col.title}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-[#B99A63] font-medium mb-4">
                    {col.tagline}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-[#575D52] leading-relaxed font-normal">
                    {col.description}
                  </p>
                </div>

                {/* Responsible Disclaimer Pill */}
                <div className="mt-8 pt-6 border-t border-[#E6E1D3]/80">
                  <p className="text-[11px] text-[#575D52]/80 italic">
                    {col.note}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
