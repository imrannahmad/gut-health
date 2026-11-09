import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Accordion } from "@/components/ui/Accordion";

export const metadata = {
  title: "Frequently Asked Questions — GutGlow",
  description: "Answers to common questions about GutGlow Daily Wellness Formula, usage, and policies.",
};

const productFaqs = [
  {
    id: "faq-1",
    title: "What is GutGlow?",
    content: "GutGlow is a minimalist wellness brand focused on digestive balance and everyday living through a single flagship formula.",
  },
  {
    id: "faq-2",
    title: "What is the product designed for?",
    content: "Designed to nurture gut microflora, support comfortable digestion, and reinforce natural gut barrier integrity.",
  },
  {
    id: "faq-3",
    title: "What ingredients are included?",
    content: "Clean prebiotic fibers, soothing botanical extracts, and spore probiotic culture. Full batch details will be published upon manufacturing release.",
  },
  {
    id: "faq-4",
    title: "Why only one product?",
    content: "We believe caring for your digestive tract should be simple, focused, and free from confusing pill clutter.",
  },
];

const usageFaqs = [
  {
    id: "use-1",
    title: "How should the product be used?",
    content: "Mix 1 level scoop (6g) with 200ml of room-temperature water each morning, approximately 15 minutes before your first meal.",
  },
  {
    id: "use-2",
    title: "When can I notice subtle changes?",
    content: "Digestive lightness is typically felt within 1 to 2 weeks of consistent daily use, compounding over 60 to 90 days.",
  },
];

const shippingFaqs = [
  {
    id: "ship-1",
    title: "How can I order?",
    content: "Choose your supply pack on our website and proceed through secure checkout. We accept UPI, cards, and Cash on Delivery.",
  },
  {
    id: "ship-2",
    title: "What is the shipping policy?",
    content: "Complimentary express delivery across India on all orders. Typical dispatch within 24 hours, delivery in 2–4 business days.",
  },
  {
    id: "ship-3",
    title: "What is the return policy?",
    content: "Unopened jars with safety seals intact can be returned within 14 days of delivery.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666]">
              SUPPORT
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#111111]">
              Frequently Asked Questions.
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider font-bold text-[#111111] pb-2 border-b border-[#E5E5E5]">
              The Product
            </h2>
            <Accordion items={productFaqs} defaultOpenId="faq-1" />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider font-bold text-[#111111] pb-2 border-b border-[#E5E5E5]">
              Daily Usage
            </h2>
            <Accordion items={usageFaqs} />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider font-bold text-[#111111] pb-2 border-b border-[#E5E5E5]">
              Orders & Shipping
            </h2>
            <Accordion items={shippingFaqs} />
          </div>

          <div className="p-8 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-center space-y-4">
            <h3 className="text-base font-bold text-[#111111]">Still have questions?</h3>
            <p className="text-xs text-[#666666] max-w-sm mx-auto">
              Our support team is available Monday through Friday.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#111111] text-[#FFFFFF] px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium hover:bg-[#333333] transition-colors"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
