import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Activity, Dna, ShieldCheck, Sparkles } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "The Science & Philosophy | GutGlow",
  description:
    "Explore the biochemical foundations of gut health, microbiome ecology, and the physiological axes connecting digestion to skin and vitality.",
};

export default function PhilosophyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-[#EEEBDD]/40 border-b border-[#E6E1D3]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#173D32]">
              THE SCIENCE OF INNER BALANCE
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#173D32] leading-tight">
              Understanding the Ecosystem <br />
              <span className="italic font-normal text-[#252923]">Within You.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#575D52] max-w-2xl mx-auto leading-relaxed font-light">
              Your digestive system is home to over 100 trillion microbial cells.
              Here is how scientific research connects gut health to your everyday
              vitality.
            </p>
          </div>
        </section>

        {/* Section 1: The Inner Ecosystem */}
        <section className="py-20 lg:py-28 bg-[#F8F6EF] border-b border-[#E6E1D3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#B99A63]">
                  CHAPTER 01
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-[#173D32]">
                  The Microbiome & Short-Chain Fatty Acids
                </h2>
                <p className="text-sm sm:text-base text-[#575D52] leading-relaxed">
                  Inside the colon, diverse populations of commensal bacteria ferment
                  dietary fibers that human digestive enzymes cannot break down on
                  their own.
                </p>
                <p className="text-sm text-[#575D52] leading-relaxed">
                  This fermentation generates short-chain fatty acids (SCFAs) —
                  principally acetate, propionate, and butyrate. Butyrate serves as
                  the primary cellular fuel source for the epithelial cells lining
                  your colon wall, supporting tight junction integrity and reinforcing
                  the gut barrier against unwanted systemic leakage.
                </p>
                <div className="p-4 bg-[#EEEBDD]/60 rounded-2xl border border-[#E6E1D3] text-xs text-[#173D32] flex items-start gap-2.5">
                  <Dna className="w-4 h-4 text-[#7D9273] shrink-0 mt-0.5" />
                  <span>
                    Our approach prioritizes prebiotic fiber diversity (inulin &
                    acacia gum) to naturally nurture native SCFA production rather
                    than shocking the tract.
                  </span>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#EEEBDD] border border-[#E6E1D3]">
                  <Image
                    src="/images/product-botanicals.jpg"
                    alt="Botanical extracts supporting gut ecosystem"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: The Gut-Skin Axis */}
        <section className="py-20 lg:py-28 bg-[#EEEBDD]/30 border-b border-[#E6E1D3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#EEEBDD] border border-[#E6E1D3]">
                  <Image
                    src="/images/product-lifestyle-routine.jpg"
                    alt="Serene wellness routine supporting gut-skin harmony"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#B99A63]">
                  CHAPTER 02
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-[#173D32]">
                  The Physiological Gut-Skin Axis
                </h2>
                <p className="text-sm sm:text-base text-[#575D52] leading-relaxed">
                  The gut and the skin share remarkable developmental and immunological
                  similarities. Both are densely vascularized barrier organs covered
                  in complex microbiotas that constantly communicate with the central
                  nervous and immune systems.
                </p>
                <p className="text-sm text-[#575D52] leading-relaxed">
                  When gut barrier integrity is compromised or dysbiosis occurs,
                  circulating inflammatory markers can influence skin sebum
                  production, dermal hydration retention, and sensitivity. By
                  fostering a balanced gut environment, you support your body's
                  internal equilibrium — which reflects outwardly in natural skin
                  comfort.
                </p>
                <div className="p-4 bg-[#F8F6EF] rounded-2xl border border-[#E6E1D3] text-xs text-[#575D52] italic">
                  Note: GutGlow supports baseline nutritional physiology. We do not
                  claim to treat dermatological conditions such as acne, eczema, or
                  psoriasis.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Cellular Nutrient Bioavailability */}
        <section className="py-20 lg:py-28 bg-[#F8F6EF] border-b border-[#E6E1D3]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
            <div className="space-y-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#173D32]">
                CHAPTER 03
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#173D32]">
                Bioavailability Over Excess
              </h2>
              <p className="text-sm sm:text-base text-[#575D52] leading-relaxed max-w-2xl mx-auto">
                Consuming massive multi-vitamin doses is meaningless if your small
                intestine cannot absorb them.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="p-8 rounded-3xl bg-[#EEEBDD]/50 border border-[#E6E1D3] space-y-3">
                <Activity className="w-5 h-5 text-[#173D32]" />
                <h3 className="text-lg font-serif text-[#173D32]">
                  Mucosal Surface Health
                </h3>
                <p className="text-xs text-[#575D52] leading-relaxed">
                  The intestinal villi and microvilli provide a surface area
                  equivalent to half a badminton court. Gentle botanicals like ginger
                  and peppermint help calm irritation, allowing these micro-structures
                  to absorb amino acids and micronutrients efficiently.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-[#EEEBDD]/50 border border-[#E6E1D3] space-y-3">
                <ShieldCheck className="w-5 h-5 text-[#173D32]" />
                <h3 className="text-lg font-serif text-[#173D32]">
                  Hair & Follicular Nourishment
                </h3>
                <p className="text-xs text-[#575D52] leading-relaxed">
                  Hair follicles are among the most metabolically active structures
                  in the human body. Optimal digestive assimilation of dietary zinc,
                  biotin, and iron directly supports normal follicular maintenance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA to Formula */}
        <section className="py-20 bg-[#173D32] text-[#F8F6EF] text-center">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <h2 className="text-3xl font-serif">Put Science Into Practice</h2>
            <p className="text-xs sm:text-sm text-[#A9B9A0] leading-relaxed">
              Explore the single flagship formula built upon these biological
              principles.
            </p>
            <div>
              <Link
                href="/product"
                className="inline-flex items-center gap-2 bg-[#F8F6EF] text-[#173D32] px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#EEEBDD] transition-colors shadow"
              >
                <span>Discover GutGlow Daily Formula</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
