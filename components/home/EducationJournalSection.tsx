"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const articles = [
  {
    title: "Understanding Your Gut Microbiome",
    category: "Microbiome Science",
    image: "/images/product-botanicals.jpg",
    excerpt: "The trillions of symbiotic microorganisms that actively regulate nutrient breakdown and daily vitality.",
    link: "/philosophy",
  },
  {
    title: "Why Dietary Fiber Matters",
    category: "Nutritional Science",
    image: "/images/product-lifestyle-routine.jpg",
    excerpt: "How soluble prebiotics feed beneficial short-chain fatty acids (SCFAs) that nurture your intestinal barrier.",
    link: "/philosophy",
  },
  {
    title: "The Gut-Skin Connection",
    category: "Physiology",
    image: "/images/product-jar-hero.jpg",
    excerpt: "Exploring the bi-directional communication between your digestive tract and dermal barrier equilibrium.",
    link: "/philosophy",
  },
];

export function EducationJournalSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#F7F7F7] border-b border-[#E8E8E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#777777] block mb-2">
              JOURNAL & EDUCATION
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111]">
              Knowledge From Within.
            </h2>
          </div>

          <Link
            href="/philosophy"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#333333] transition-colors"
          >
            <span>Explore The Science</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-[#777777] uppercase tracking-wider mb-3">
          <span>Swipe to read</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>

        {/* Cards: Mobile Swipeable (snap-x) + Desktop 3-col Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible">
          {articles.map((article, idx) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="shrink-0 w-[84vw] max-w-[340px] snap-start sm:w-auto sm:max-w-none bg-[#FFFFFF] border border-[#E8E8E8] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#111111] transition-colors group"
            >
              <div>
                <div className="relative aspect-[16/10] bg-[#F7F7F7] overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover grayscale contrast-125 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-[#FFFFFF] px-2.5 py-1 rounded-full text-[9px] tracking-widest uppercase font-semibold text-[#111111] border border-[#E8E8E8]">
                    {article.category}
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h3 className="text-base font-bold text-[#111111] leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-[#777777] leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 mt-auto">
                <Link
                  href={article.link}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] group-hover:translate-x-1 transition-transform"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
