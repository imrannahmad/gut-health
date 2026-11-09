import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "The Science — GutGlow",
  description: "The scientific foundation of digestive wellness, the microbiome, and the gut-skin axis.",
};

export default function PhilosophyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow">
        {/* Header */}
        <section className="py-16 lg:py-24 bg-[#F5F5F5] border-b border-[#E5E5E5]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666]">
              PHYSIOLOGY & RESEARCH
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111111]">
              The Science of Wellness.
            </h1>
            <p className="text-base text-[#666666] max-w-xl mx-auto leading-relaxed">
              How gut health, cellular nutrition, and microbial balance connect to
              everyday living.
            </p>
          </div>
        </section>

        {/* Chapter 1: Microbiome */}
        <section className="py-16 lg:py-24 bg-[#FFFFFF] border-b border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#666666]">
                  01 — THE MICROBIOME
                </span>
                <h2 className="text-3xl font-bold text-[#111111]">
                  Short-Chain Fatty Acids
                </h2>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Inside the gut, beneficial bacteria ferment prebiotic dietary
                  fibers to generate short-chain fatty acids (SCFAs), notably
                  butyrate. Butyrate feeds intestinal epithelial cells and helps
                  maintain healthy tight-junction barrier integrity.
                </p>
              </div>

              <div className="lg:col-span-6">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5]">
                  <Image
                    src="/images/product-botanicals.jpg"
                    alt="Botanical extracts"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 2: Gut-Skin */}
        <section className="py-16 lg:py-24 bg-[#F5F5F5] border-b border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#E5E5E5]">
                  <Image
                    src="/images/product-lifestyle-routine.jpg"
                    alt="Daily Routine"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4 order-1 lg:order-2">
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#666666]">
                  02 — THE AXIS
                </span>
                <h2 className="text-3xl font-bold text-[#111111]">
                  The Gut-Skin Axis
                </h2>
                <p className="text-sm text-[#666666] leading-relaxed">
                  The gut and skin communicate bi-directionally through immune and
                  metabolic pathways. Nurturing a balanced digestive barrier
                  supports the physiological conditions that influence skin barrier
                  comfort and cellular renewal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[#171717] text-[#FFFFFF] text-center">
          <div className="max-w-xl mx-auto px-4 space-y-5">
            <h2 className="text-3xl font-bold">Discover GutGlow</h2>
            <p className="text-xs text-[#FFFFFF]/70">
              A daily approach to digestive wellness.
            </p>
            <div>
              <Link
                href="/product"
                className="inline-flex items-center gap-2 bg-[#FFFFFF] text-[#111111] px-7 py-3.5 rounded-lg text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#F5F5F5] transition-colors"
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
