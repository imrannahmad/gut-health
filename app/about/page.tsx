import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Shield, Heart, Compass } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Our Story | GutGlow",
  description:
    "The journey and principles behind GutGlow. Why we believe true wellness begins with a calm, balanced digestive ecosystem.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 lg:py-28 bg-[#EEEBDD]/40 border-b border-[#E6E1D3]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#173D32]">
              THE GUTGLOW ESSAY
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#173D32] leading-tight">
              Crafted Around One Simple Conviction: <br />
              <span className="italic font-normal text-[#252923]">
                Wellness Starts From Within.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#575D52] max-w-2xl mx-auto leading-relaxed font-light">
              We started GutGlow because modern wellness had grown needlessly noisy,
              over-complicated, and obsessed with superficial quick fixes.
            </p>
          </div>
        </section>

        {/* Narrative & Visual Split */}
        <section className="py-20 lg:py-28 bg-[#F8F6EF] border-b border-[#E6E1D3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#B99A63]">
                  ORIGINS & PURPOSE
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-[#173D32]">
                  The Shift From External Cover-Ups to Inner Harmony
                </h2>
                <p className="text-sm sm:text-base text-[#575D52] leading-relaxed">
                  For decades, consumer health treated skin, hair, energy, and digestion
                  as completely isolated silos. If your skin felt dull, you were told
                  to buy a dozen topical serums. If you felt sluggish after meals, you
                  were handed aggressive stimulant laxatives.
                </p>
                <p className="text-sm text-[#575D52] leading-relaxed">
                  Gastrointestinal biology tells an entirely different story. Over 70%
                  of immune cells reside in the gut lining. Trillions of microbial
                  partners synthesize essential short-chain fatty acids, modulate
                  inflammatory signals, and govern how every single micronutrient is
                  absorbed.
                </p>
                <p className="text-sm text-[#575D52] leading-relaxed">
                  GutGlow was created to give you a single, elegant daily ritual that
                  respects this physiology — nurturing your inner ecosystem rather than
                  shocking it.
                </p>
              </div>

              <div className="lg:col-span-6">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#EEEBDD] border border-[#E6E1D3] shadow-md">
                  <Image
                    src="/images/product-lifestyle-routine.jpg"
                    alt="GutGlow peaceful morning wellness ritual"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-20 lg:py-28 bg-[#EEEBDD]/30 border-b border-[#E6E1D3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#173D32]">
                OUR VALUES
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#173D32]">
                What We Stand For
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#F8F6EF] p-8 rounded-3xl border border-[#E6E1D3] space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEEBDD] flex items-center justify-center text-[#173D32]">
                  <Leaf className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-serif text-[#173D32]">
                  Singular Focus
                </h3>
                <p className="text-xs text-[#575D52] leading-relaxed">
                  We don’t produce 40 different redundant pills. We focus entirely on
                  one flagship daily formula, engineering it with obsessive care and
                  uncompromising ingredient quality.
                </p>
              </div>

              <div className="bg-[#F8F6EF] p-8 rounded-3xl border border-[#E6E1D3] space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEEBDD] flex items-center justify-center text-[#173D32]">
                  <Shield className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-serif text-[#173D32]">
                  Zero False Claims
                </h3>
                <p className="text-xs text-[#575D52] leading-relaxed">
                  We will never claim our supplement cures illness, erases wrinkles
                  overnight, or stops genetic hair fall. We promise truthful,
                  responsible science rooted in digestive support.
                </p>
              </div>

              <div className="bg-[#F8F6EF] p-8 rounded-3xl border border-[#E6E1D3] space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEEBDD] flex items-center justify-center text-[#173D32]">
                  <Heart className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-serif text-[#173D32]">
                  Sustainable Elegance
                </h3>
                <p className="text-xs text-[#575D52] leading-relaxed">
                  Our forest-green glass jars protect delicate botanical actives from
                  UV light while eliminating single-use plastics from your bathroom
                  counter.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA to Formula */}
        <section className="py-20 bg-[#173D32] text-[#F8F6EF] text-center">
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            <h2 className="text-3xl font-serif">
              Begin Your Morning Ritual
            </h2>
            <p className="text-xs sm:text-sm text-[#A9B9A0] leading-relaxed font-light">
              Experience the difference of a thoughtfully nurtured digestive
              microbiome with GutGlow Daily Wellness Formula.
            </p>
            <div>
              <Link
                href="/product"
                className="inline-flex items-center gap-2 bg-[#F8F6EF] text-[#173D32] px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#EEEBDD] transition-colors shadow"
              >
                <span>Shop The Flagship Formula</span>
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
