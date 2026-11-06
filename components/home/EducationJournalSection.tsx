"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";

const articles = [
  {
    title: "Understanding Your Gut Microbiome: The Inner Ecosystem",
    category: "Microbiome Science",
    readTime: "5 min read",
    image: "/images/product-botanicals.jpg",
    excerpt:
      "Home to trillions of diverse microorganisms, your gastrointestinal tract regulates far more than basic digestion. Learn how microbial biodiversity influences immune balance and everyday metabolic health.",
    link: "/philosophy",
  },
  {
    title: "Why Dietary Fiber & Prebiotics Matter More Than You Think",
    category: "Nutritional Biology",
    readTime: "4 min read",
    image: "/images/product-lifestyle-routine.jpg",
    excerpt:
      "Not all fibers behave equally. Discover the biological distinction between insoluble bulk and soluble fermentable prebiotics that nourish beneficial short-chain fatty acids (SCFAs).",
    link: "/philosophy",
  },
  {
    title: "The Gut-Skin Axis: Exploring Inner Balance & Dermal Comfort",
    category: "Physiological Research",
    readTime: "6 min read",
    image: "/images/product-jar-hero.jpg",
    excerpt:
      "Unpacking the scientific literature connecting intestinal permeability, systemic inflammation, and normal skin barrier resilience. Clear insights without marketing hyperbole.",
    link: "/philosophy",
  },
];

export function EducationJournalSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#EEEBDD]/30 border-b border-[#E6E1D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#173D32]">
              THE GUTGLOW JOURNAL
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#173D32]">
              Education From Within
            </h2>
            <p className="text-sm text-[#575D52] leading-relaxed">
              Responsible, science-informed essays exploring gastrointestinal
              physiology, nutrition, and everyday wellness rituals.
            </p>
          </div>

          <Link
            href="/philosophy"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-[#173D32] hover:text-[#0E2921] transition-colors"
          >
            <span>Explore The Science</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Editorial Article Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="bg-[#F8F6EF] border border-[#E6E1D3] rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[16/10] bg-[#EEEBDD] overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-[#F8F6EF]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold text-[#173D32] border border-[#E6E1D3]">
                    {article.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#575D52]">
                    <Clock className="w-3.5 h-3.5 text-[#B99A63]" />
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-lg font-serif text-[#173D32] group-hover:text-[#0E2921] transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-[#575D52] leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0">
                <Link
                  href={article.link}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] font-semibold text-[#173D32] group-hover:translate-x-1 transition-transform"
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
