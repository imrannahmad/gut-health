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
      "GutGlow is a minimalist wellness brand focused on digestive balance and everyday living through a single flagship daily formula.",
  },
  {
    id: "faq-2",
    title: "What is the product designed for?",
    content:
      "Our daily formula is designed to nurture gut microflora, support comfortable digestion, and reinforce natural gut barrier integrity.",
  },
  {
    id: "faq-3",
    title: "What ingredients are included?",
    content:
      "Clean prebiotic fibers, soothing botanical rhizome extracts, and spore probiotic culture. Full batch details will be published upon manufacturing release.",
  },
  {
    id: "faq-4",
    title: "How should the product be used?",
    content:
      "Mix 1 level scoop (6g) with 200ml of room-temperature water each morning, approximately 15 minutes before your first meal.",
  },
  {
    id: "faq-5",
    title: "Who should avoid using it?",
    content:
      "Pregnant or nursing individuals, minors, and anyone with severe chronic conditions should consult their healthcare provider prior to use.",
  },
  {
    id: "faq-6",
    title: "How can I order?",
    content:
      "Select your preferred supply pack (1, 2, or 3 months) on our website and proceed through our secure checkout. We accept UPI, cards, and Cash on Delivery.",
  },
  {
    id: "faq-7",
    title: "What is the shipping policy?",
    content:
      "Complimentary express shipping across India on all orders. Typical dispatch in 24 hours, delivery in 2 to 4 business days.",
  },
];

export function HomeFaqSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E5E5E5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-12 text-center">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#666666] block mb-2">
            QUESTIONS & ANSWERS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111]">
            Common Inquiries.
          </h2>
        </div>

        {/* Minimalist Accordion */}
        <Accordion items={faqItems} defaultOpenId="faq-1" />

        <div className="text-center mt-10">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#111111] hover:text-[#666666] transition-colors"
          >
            <span>View All FAQs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
