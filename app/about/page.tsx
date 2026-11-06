import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Our Story — GutGlow",
  description: "A thoughtful approach to digestive wellness and everyday balance.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow">
        {/* Header */}
        <section className="py-16 lg:py-24 bg-[#F7F7F7] border-b border-[#E8E8E8]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#777777]">
              OUR STORY
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111111]">
              Wellness Starts Within.
            </h1>
            <p className="text-base text-[#777777] max-w-xl mx-auto leading-relaxed">
              GutGlow brings a thoughtful approach to digestive wellness and
              everyday living.
            </p>
          </div>
        </section>

        {/* Narrative & Visual */}
        <section className="py-16 lg:py-24 bg-[#FFFFFF] border-b border-[#E8E8E8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#777777]">
                  PURPOSE
                </span>
                <h2 className="text-3xl font-bold text-[#111111]">
                  A Focus on Essentials
                </h2>
                <p className="text-sm text-[#777777] leading-relaxed">
                  We built GutGlow on a simple principle: true vitality begins in the
                  digestive ecosystem. Rather than offering multi-product clutter,
                  we engineered one daily formula to support your body's natural
                  equilibrium.
                </p>
                <p className="text-sm text-[#777777] leading-relaxed">
                  Clean, plant-derived ingredients and zero synthetic fillers.
                  Simple, sustainable, and designed for real everyday living.
                </p>
              </div>

              <div className="lg:col-span-6">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F7F7F7] border border-[#E8E8E8]">
                  <Image
                    src="/images/product-lifestyle-routine.jpg"
                    alt="GutGlow Morning Routine"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover grayscale contrast-110"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Principles */}
        <section className="py-16 lg:py-24 bg-[#F7F7F7] border-b border-[#E8E8E8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#FFFFFF] p-7 rounded-2xl border border-[#E8E8E8] space-y-3">
                <span className="text-xs font-bold text-[#111111]">01</span>
                <h3 className="text-base font-bold text-[#111111]">One Product Focus</h3>
                <p className="text-xs text-[#777777] leading-relaxed">
                  We channel all our formulation resources into a single, exceptional
                  daily formula.
                </p>
              </div>

              <div className="bg-[#FFFFFF] p-7 rounded-2xl border border-[#E8E8E8] space-y-3">
                <span className="text-xs font-bold text-[#111111]">02</span>
                <h3 className="text-base font-bold text-[#111111]">Transparent Science</h3>
                <p className="text-xs text-[#777777] leading-relaxed">
                  Clear, honest communication without exaggerated before-and-after
                  claims.
                </p>
              </div>

              <div className="bg-[#FFFFFF] p-7 rounded-2xl border border-[#E8E8E8] space-y-3">
                <span className="text-xs font-bold text-[#111111]">03</span>
                <h3 className="text-base font-bold text-[#111111]">Sustainable Packaging</h3>
                <p className="text-xs text-[#777777] leading-relaxed">
                  Recyclable glass jars protecting active botanicals from UV light.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[#111111] text-[#FFFFFF] text-center">
          <div className="max-w-xl mx-auto px-4 space-y-5">
            <h2 className="text-3xl font-bold">Experience GutGlow</h2>
            <p className="text-xs text-[#FFFFFF]/70">
              One simple daily habit for digestive wellness.
            </p>
            <div>
              <Link
                href="/product"
                className="inline-flex items-center gap-2 bg-[#FFFFFF] text-[#111111] px-7 py-3.5 rounded-full text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#F7F7F7] transition-colors"
              >
                <span>Shop Formula</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
