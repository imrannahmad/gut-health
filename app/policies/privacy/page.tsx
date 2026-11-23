import React from "react";
import { Shield } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy — GutGlow",
  description: "Privacy policy and data protection principles of GutGlow.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666] mb-3">
              <Shield className="w-3.5 h-3.5 text-[#111111]" />
              Data Security
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#666666] mt-2">Last updated: November 2026 • GutGlow Wellness Pvt. Ltd.</p>
          </div>

          <div className="text-xs leading-relaxed text-[#555555] space-y-8">
            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <h2 className="text-sm font-bold text-[#111111]">1. Commitment to Privacy</h2>
              <p>
                GutGlow Wellness Pvt. Ltd. respects your fundamental right to privacy. This privacy policy explains how we gather, utilize, store, and safeguard your personal details when you access our platform or purchase our botanical wellness formula.
              </p>
            </section>

            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <h2 className="text-sm font-bold text-[#111111]">2. Information We Collect</h2>
              <p>
                When you interact with our storefront or place an order, we collect essential transaction information:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#666666]">
                <li><strong>Identity & Contact:</strong> Full name, verified mobile number, email address, and shipping address.</li>
                <li><strong>Transactional Logs:</strong> Order items, batch allocation history, tracking numbers, and delivery statuses.</li>
                <li><strong>Payment Security:</strong> We do NOT store payment card details, UPI pins, or banking passwords. Transactions are processed through RBI-authorized, PCI-DSS Level 1 compliant payment gateways (Razorpay / Cashfree / Stripe).</li>
              </ul>
            </section>

            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <h2 className="text-sm font-bold text-[#111111]">3. How We Use Your Data</h2>
              <p>
                Your information is used strictly to deliver an exceptional e-commerce and wellness service:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#666666]">
                <li>To dispatch, fulfill, and deliver your physical packages via authorized national couriers.</li>
                <li>To transmit automated order receipts, tracking notifications via SMS, WhatsApp, and Email.</li>
                <li>To facilitate transit damage replacement reviews and customer support inquiries.</li>
                <li>We do NOT sell, lease, or monetize your personal customer data to any third-party brokers.</li>
              </ul>
            </section>

            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <h2 className="text-sm font-bold text-[#111111]">4. Data Retention & Deletion</h2>
              <p>
                We retain order and customer records only as long as necessary to satisfy legal, tax, accounting, and warranty requirements. If you wish to delete your account or review your stored data, you may reach out to our privacy officer.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-[#111111]">5. Contact Us</h2>
              <p>
                For any data privacy questions or requests, please contact{" "}
                <a href="mailto:care@gutglow.com" className="text-[#111111] font-semibold underline">
                  care@gutglow.com
                </a>{" "}
                or message our team on Instagram at{" "}
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
