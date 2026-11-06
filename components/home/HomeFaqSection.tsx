"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";

const faqItems = [
  {
    id: "faq-1",
    title: "What is GutGlow?",
    content:
      "GutGlow is a modern wellness brand dedicated to digestive harmony, gut barrier resilience, and the biological connection between gut health and holistic everyday well-being. Our flagship formula is crafted to nurture healthy intestinal microflora from within.",
  },
  {
    id: "faq-2",
    title: "What is the purpose of the product?",
    content:
      "GutGlow Daily Wellness Formula is designed to support comfortable digestion, maintain healthy gut motility, and nourish symbiotic microflora with targeted prebiotics and soothing botanical extracts, promoting everyday lightness and physical balance.",
  },
  {
    id: "faq-3",
    title: "What ingredients does it contain?",
    content:
      "The formula is centered around clean, plant-derived prebiotic fibers (such as chicory root inulin and acacia fiber), soothing botanical rhizomes (ginger and peppermint extract), and beneficial spore-forming microorganisms. Product information coming soon regarding final quantitative manufacturer declarations.",
  },
  {
    id: "faq-4",
    title: "How should it be consumed?",
    content:
      "We recommend blending 1 level scoop (or taking 2 capsules) with 200–250ml of cool or room-temperature water each morning, approximately 15–20 minutes prior to your first meal. Detailed scoop guidelines will accompany final packaging.",
  },
  {
    id: "faq-5",
    title: "Who should avoid using it?",
    content:
      "Pregnant or lactating mothers, individuals under 18 years of age, and individuals diagnosed with acute gastrointestinal obstruction, inflammatory bowel disease, or severe chronic illness should consult their personal physician before starting any new dietary supplement.",
  },
  {
    id: "faq-6",
    title: "Are there any precautions?",
    content:
      "Do not exceed the suggested daily serving. If you experience unexpected discomfort, discontinue use and speak with a healthcare provider. Always store the airtight container in a cool, dry place away from direct sunlight.",
  },
  {
    id: "faq-7",
    title: "How can I place an order?",
    content:
      "You can select your preferred supply pack (1-Month, 2-Month, or 3-Month Ritual) on our website, add it to your bag, and proceed through our streamlined checkout. We accept major credit/debit cards, UPI, net banking, and cash on delivery.",
  },
  {
    id: "faq-8",
    title: "What are the shipping and return policies?",
    content:
      "We offer complimentary express shipping across India on all orders, typically dispatched within 24 hours and delivered in 2–4 business days. Unopened jars in original safety seals can be returned within 14 days of receipt. View our full Shipping & Returns policy for complete terms.",
  },
];

export function HomeFaqSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#F8F6EF] border-b border-[#E6E1D3]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#173D32]">
            CLEAR ANSWERS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#173D32]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#575D52]">
            Everything you need to know about our single flagship formula, usage,
            and shipping.
          </p>
        </div>

        {/* Accordion */}
        <div className="bg-[#EEEBDD]/40 p-6 sm:p-10 rounded-3xl border border-[#E6E1D3]">
          <Accordion items={faqItems} defaultOpenId="faq-1" />
        </div>

        {/* Link to Dedicated FAQ */}
        <div className="text-center mt-12">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-[#173D32] hover:text-[#0E2921] transition-colors"
          >
            <span>Have More Questions? Visit Full FAQ Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
