import React from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Shipping & Returns — GutGlow",
  description: "Shipping timelines and return policies of GutGlow.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666]">
              DELIVERY & RETURNS
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
              Shipping & Returns
            </h1>
            <p className="text-xs text-[#666666] mt-1">Last updated: November 2026</p>
          </div>

          <div className="text-xs leading-relaxed text-[#666666] space-y-6">
            <section className="space-y-1.5">
              <h2 className="text-sm font-bold text-[#111111]">1. Express Shipping</h2>
              <p>
                We provide complimentary express delivery on all orders across India.
                Orders are dispatched within 24 hours (Monday to Saturday) and delivered
                within 2 to 4 business days.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-sm font-bold text-[#111111]">2. Order Tracking</h2>
              <p>
                Live tracking details are sent via SMS and email immediately upon carrier
                handover.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-sm font-bold text-[#111111]">3. 14-Day Returns</h2>
              <p>
                Unopened jars with safety seals intact may be returned within 14 days of
                receipt for a full refund or replacement. Email care@gutglow.com to initiate
                a return.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
