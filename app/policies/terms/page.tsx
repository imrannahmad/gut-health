import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Terms & Conditions — GutGlow",
  description: "Terms and conditions governing the purchase and use of GutGlow wellness products.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666] mb-3">
              <FileText className="w-3.5 h-3.5 text-[#111111]" />
              Legal & Compliance
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs text-[#666666] mt-2">
              Last updated: November 2026 • GutGlow Wellness Pvt. Ltd.
            </p>
          </div>

          <div className="text-xs leading-relaxed text-[#555555] space-y-8">
            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <h2 className="text-sm font-bold text-[#111111]">1. General Agreement</h2>
              <p>
                By accessing this website, purchasing our products, or registering an account, you agree to be bound by these Terms & Conditions and our associated policies. If you do not agree with any part of these terms, please refrain from using the platform or ordering our products.
              </p>
            </section>

            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <h2 className="text-sm font-bold text-[#111111]">2. Health Notice & Dietary Supplement Disclaimer</h2>
              <p>
                GutGlow Daily Wellness Formula is a proprietary dietary botanical wellness formulation regulated under FSSAI standards. Statements regarding dietary supplements have not been evaluated by any government medical regulatory authority to diagnose, treat, cure, or prevent any illness or pathological disease.
              </p>
              <p>
                The information provided on this platform is for educational and wellness lifestyle purposes only and does not substitute professional medical advice. Always consult your qualified healthcare practitioner before introducing any new supplement regimen, especially if pregnant, nursing, or taking prescription medication.
              </p>
            </section>

            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <h2 className="text-sm font-bold text-[#111111]">3. Non-Returnable Consumables & Transit Claims</h2>
              <p>
                Due to food safety and hygiene regulations, delivered consumable products are strictly non-returnable and non-refundable once handed over to the customer. We maintain strict batch control and climate-monitored FEFO fulfillment.
              </p>
              <p>
                However, if your parcel arrives damaged in transit, with broken tamper-evident seals, or with incorrect contents, you are entitled to a 100% Free Fresh Replacement when reported within <strong>48 hours of delivery</strong> via our self-service{" "}
                <Link href="/claims/new" className="text-[#111111] font-semibold underline">
                  Damage Claim Desk
                </Link>{" "}
                with mandatory photographic proof. Detailed terms are outlined in our{" "}
                <Link href="/policies/shipping" className="text-[#111111] font-semibold underline">
                  Shipping & Replacement Policy
                </Link>.
              </p>
            </section>

            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <h2 className="text-sm font-bold text-[#111111]">4. Orders, Pricing & Inventory Batches</h2>
              <p>
                All prices listed on GutGlow are in Indian National Rupees (INR) inclusive of applicable GST taxes. We reserve the right to modify prices or discontinue promotional offers at any time without prior notice.
              </p>
              <p>
                Orders are fulfilled from certified active manufacturing batches. We reserve the right to cancel any order in the event of unforeseen stock outages or suspected fraudulent activity, in which case any prepaid amount will be refunded in full.
              </p>
            </section>

            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <h2 className="text-sm font-bold text-[#111111]">5. Intellectual Property</h2>
              <p>
                All brand identity, formulation names, imagery, packaging aesthetics, copy, design systems, and source code are the proprietary intellectual property of GutGlow Wellness Pvt. Ltd. Unauthorized commercial use, reproduction, or redistribution is strictly prohibited.
              </p>
            </section>

            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <h2 className="text-sm font-bold text-[#111111]">6. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by applicable law, GutGlow Wellness shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use our products or platform.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[#111111]">7. Contact & Grievance Redressal</h2>
              <p>
                For any legal notices, compliance queries, or order grievances, please write to us at{" "}
                <a href="mailto:care@gutglow.com" className="text-[#111111] font-semibold underline">
                  care@gutglow.com
                </a>{" "}
                or reach our official Instagram channel at{" "}
                <a href="https://instagram.com/gutglowofficial" target="_blank" rel="noopener noreferrer" className="text-[#111111] font-semibold underline">
                  @gutglowofficial
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
