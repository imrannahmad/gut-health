import React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, MessageSquare } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Accordion } from "@/components/ui/Accordion";

export const metadata = {
  title: "Frequently Asked Questions | GutGlow",
  description:
    "Detailed answers to all your questions about GutGlow Daily Wellness Formula, ingredients, usage, safety, and shipping policies.",
};

const productFaqs = [
  {
    id: "prod-1",
    title: "What is GutGlow?",
    content:
      "GutGlow is a premium wellness brand focused on digestive wellness and the profound physiological connection between gut health and overall well-being. We offer a single flagship formula designed for daily morning integration.",
  },
  {
    id: "prod-2",
    title: "What is the purpose of the product?",
    content:
      "GutGlow Daily Wellness Formula is designed to nurture your gut microbiome, support digestive comfort and regularity, reinforce intestinal barrier integrity, and optimize nutrient bioavailability.",
  },
  {
    id: "prod-3",
    title: "What ingredients does it contain?",
    content:
      "The formula is centered around clean, plant-derived prebiotic fibers (such as chicory root inulin and acacia fiber), soothing botanical rhizomes (ginger and peppermint extract), and beneficial spore-forming microorganisms. Product information coming soon regarding final quantitative manufacturer declarations.",
  },
  {
    id: "prod-4",
    title: "Is this a multi-product system or just one product?",
    content:
      "GutGlow is intentionally built around ONLY ONE FLAGSHIP PRODUCT. We believe that caring for your digestive tract should be simple, focused, and free from redundant pill clutter.",
  },
];

const usageFaqs = [
  {
    id: "use-1",
    title: "How should it be consumed?",
    content:
      "Mix 1 level scoop (or take 2 capsules) with 200–250ml of cool or room-temperature water each morning, approximately 15–20 minutes before your first meal. Drink smoothly.",
  },
  {
    id: "use-2",
    title: "How soon can I expect to notice subtle changes?",
    content:
      "Digestive comfort and reduced feeling of post-meal heaviness are often reported within the first 1–2 weeks of consistent daily use. Deeper microbial balance and mucosal equilibrium typically compound across a 60 to 90-day ritual.",
  },
  {
    id: "use-3",
    title: "Can I mix it with juice, smoothies, or warm tea?",
    content:
      "Yes, you can blend it into a room-temperature smoothie or juice. However, we recommend avoiding boiling water to preserve the bioactivity of delicate botanicals and probiotic spore strains.",
  },
];

const safetyFaqs = [
  {
    id: "safe-1",
    title: "Who should avoid using it?",
    content:
      "Pregnant or nursing individuals, minors under 18, and individuals with diagnosed gastrointestinal obstructions, active Crohn's flares, or severe chronic conditions should consult their physician before use.",
  },
  {
    id: "safe-2",
    title: "Are there any precautions?",
    content:
      "Do not exceed the recommended daily serving. If you experience unexpected discomfort, discontinue use. Keep out of reach of children and store in a cool, dry place away from heat and moisture.",
  },
  {
    id: "safe-3",
    title: "Does GutGlow claim to cure hair fall or clear skin?",
    content:
      "No. We strictly refrain from misleading cosmetic claims. GutGlow supports foundational nutrient absorption and digestive balance. It does not treat clinical alopecia, eczema, or acne.",
  },
];

const orderFaqs = [
  {
    id: "ord-1",
    title: "How can I place an order?",
    content:
      "Select your preferred supply pack (1-Month, 2-Month, or 3-Month Ritual) on our website, add it to your bag, and complete our clean checkout. We accept UPI, credit/debit cards, net banking, and Cash on Delivery.",
  },
  {
    id: "ord-2",
    title: "What are the shipping charges and delivery timelines?",
    content:
      "We provide complimentary express shipping across India on all orders. Orders placed before 2 PM are dispatched on the same day, with average delivery in 2 to 4 business days.",
  },
  {
    id: "ord-3",
    title: "What is your return policy?",
    content:
      "Unopened jars with tamper-evident safety seals intact may be returned within 14 days of delivery for a full refund or replacement. Contact support@gutglow.com for swift assistance.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#173D32]">
              KNOWLEDGE BASE
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif text-[#173D32]">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base text-[#575D52] max-w-xl mx-auto leading-relaxed">
              Transparent, scientifically grounded answers to help you understand
              GutGlow, how it works, and how to use it safely.
            </p>
          </div>

          {/* Section 1: Product & Science */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-[#173D32] border-b border-[#E6E1D3] pb-3">
              About the Flagship Product
            </h2>
            <div className="bg-[#EEEBDD]/40 p-6 sm:p-8 rounded-3xl border border-[#E6E1D3]">
              <Accordion items={productFaqs} defaultOpenId="prod-1" />
            </div>
          </div>

          {/* Section 2: Usage */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-[#173D32] border-b border-[#E6E1D3] pb-3">
              Usage & Daily Ritual
            </h2>
            <div className="bg-[#EEEBDD]/40 p-6 sm:p-8 rounded-3xl border border-[#E6E1D3]">
              <Accordion items={usageFaqs} />
            </div>
          </div>

          {/* Section 3: Safety */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-[#173D32] border-b border-[#E6E1D3] pb-3">
              Safety, Precautions & Claims
            </h2>
            <div className="bg-[#EEEBDD]/40 p-6 sm:p-8 rounded-3xl border border-[#E6E1D3]">
              <Accordion items={safetyFaqs} />
            </div>
          </div>

          {/* Section 4: Orders & Shipping */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-[#173D32] border-b border-[#E6E1D3] pb-3">
              Orders, Delivery & Returns
            </h2>
            <div className="bg-[#EEEBDD]/40 p-6 sm:p-8 rounded-3xl border border-[#E6E1D3]">
              <Accordion items={orderFaqs} />
            </div>
          </div>

          {/* Contact Support Card */}
          <div className="p-8 rounded-3xl bg-[#173D32] text-[#F8F6EF] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-2">
              <h3 className="text-xl font-serif">Have a question not listed here?</h3>
              <p className="text-xs text-[#A9B9A0] max-w-md">
                Our scientific and customer care team is available Monday through
                Friday to answer your questions.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#F8F6EF] text-[#173D32] px-6 py-3 rounded-full text-xs uppercase tracking-wider font-semibold hover:bg-[#EEEBDD] transition-colors shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Our Team</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
