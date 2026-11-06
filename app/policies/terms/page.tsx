import React from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Terms & Conditions | GutGlow",
  description:
    "Terms of service, purchasing conditions, intellectual property, and health disclaimers governing the use of GutGlow.",
};

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B99A63]">
              TERMS OF SERVICE
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#173D32] mt-1">
              Terms & Conditions
            </h1>
            <p className="text-xs text-[#575D52] mt-1">
              Last updated: November 2026
            </p>
          </div>

          <div className="prose prose-sm text-xs leading-relaxed text-[#575D52] space-y-6">
            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                1. Acceptance of Terms
              </h2>
              <p>
                By visiting or placing an order on the GutGlow website, you agree
                to be bound by these Terms and Conditions. Please review them
                carefully before purchasing our products.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                2. Health & Medical Disclaimer
              </h2>
              <p>
                The information, essays, and descriptions provided across this
                website are for educational purposes only and are not intended to
                replace individualized clinical medical advice.
              </p>
              <p>
                GutGlow Daily Wellness Formula is a dietary wellness supplement. It
                is not classified as a prescription medication and is not
                formulated to diagnose, treat, cure, or prevent any illness, disease,
                or gastrointestinal condition. You should always consult with your
                physician before introducing any new supplement into your routine,
                especially if you are pregnant, nursing, taking medications, or
                managing chronic conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                3. Single Flagship Product & Ordering
              </h2>
              <p>
                GutGlow sells a single flagship product formulated in batches. We
                reserve the right to modify pack offerings, pricing, or discontinue
                seasonal batches without prior notice.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                4. Pricing & Payments
              </h2>
              <p>
                All prices displayed on the website are listed in Indian Rupees (INR)
                and include applicable Goods & Services Tax (GST). Payments may be
                processed via secure payment gateway partners or verified Cash on
                Delivery.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                5. Intellectual Property
              </h2>
              <p>
                All content, trademarks, typography, jar packaging designs, logos,
                and editorial materials published on this website are the proprietary
                intellectual property of GutGlow Wellness Pvt. Ltd. Unauthorized
                duplication or commercial redistribution is strictly prohibited.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                6. Governing Law & Jurisdiction
              </h2>
              <p>
                These terms are governed by the laws of the Republic of India. Any
                disputes arising hereunder shall be subject to the exclusive
                jurisdiction of the competent courts in Mumbai, India.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
