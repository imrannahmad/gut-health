import React from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy | GutGlow",
  description:
    "How GutGlow collects, uses, and safeguards your personal information in compliance with Indian DPDP Act and international privacy standards.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B99A63]">
              LEGAL DOCUMENTATION
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#173D32] mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#575D52] mt-1">
              Last updated: November 2026
            </p>
          </div>

          <div className="prose prose-sm text-xs leading-relaxed text-[#575D52] space-y-6">
            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                1. Overview & Commitment
              </h2>
              <p>
                GutGlow Wellness Pvt. Ltd. ("GutGlow", "we", "us", or "our") is
                committed to respecting and safeguarding your privacy. This
                Privacy Policy explains how we collect, store, process, and
                protect your personal data when you interact with our website,
                make purchases, or communicate with our wellness concierge.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                2. Information We Collect
              </h2>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong className="text-[#173D32]">Contact & Identity Data:</strong>{" "}
                  Your name, shipping address, email address, and phone number.
                </li>
                <li>
                  <strong className="text-[#173D32]">Transaction Data:</strong> Details
                  about products purchased, order values, and dispatch timestamps.
                  We do NOT store your full credit card or bank login details; all
                  payments are tokenized through PCI-DSS compliant Indian payment
                  gateways.
                </li>
                <li>
                  <strong className="text-[#173D32]">Technical & Device Data:</strong>{" "}
                  IP address, browser type, device identifiers, and anonymous
                  session usage to ensure fast site loading and security.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                3. Purpose of Processing
              </h2>
              <p>We process your personal information strictly for legitimate commercial needs:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>To pack, fulfill, and deliver your orders via our courier partners.</li>
                <li>To send order confirmations, invoice copies, and SMS delivery tracking updates.</li>
                <li>To provide dedicated customer support and address inquiries.</li>
                <li>To comply with statutory tax (GST) and accounting mandates in India.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                4. Data Protection & Non-Disclosure
              </h2>
              <p>
                We never sell, rent, or trade your personal information to third-party
                data brokers or advertising networks. Information is only shared with
                vetted operational providers (such as logistics carriers and payment
                gateways) bound by confidentiality obligations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                5. Your Privacy Rights
              </h2>
              <p>
                You may request access to, correction of, or deletion of your
                personal information at any time by contacting our Data Privacy
                Officer at <span className="text-[#173D32] font-medium">privacy@gutglow.com</span>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
