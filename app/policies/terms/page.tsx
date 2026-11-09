import React from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Terms & Conditions — GutGlow",
  description: "Terms and conditions governing the use of GutGlow.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666]">
              LEGAL
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
              Terms & Conditions
            </h1>
            <p className="text-xs text-[#666666] mt-1">Last updated: November 2026</p>
          </div>

          <div className="text-xs leading-relaxed text-[#666666] space-y-6">
            <section className="space-y-1.5">
              <h2 className="text-sm font-bold text-[#111111]">1. General</h2>
              <p>
                By accessing this website or purchasing our flagship formula, you
                agree to these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-sm font-bold text-[#111111]">2. Health Notice</h2>
              <p>
                GutGlow Daily Wellness Formula is a dietary supplement and is not
                intended to diagnose, treat, cure, or prevent any medical condition.
                Always consult your healthcare provider before beginning any new
                supplement regimen.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-sm font-bold text-[#111111]">3. Intellectual Property</h2>
              <p>
                All brand marks, packaging designs, photographs, and copy belong
                exclusively to GutGlow Wellness Pvt. Ltd.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
