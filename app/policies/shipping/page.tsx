import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RefreshCw, ArrowRight } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Shipping & Replacement Policy — GutGlow",
  description: "Shipping timelines, consumable hygiene standards, and 48-hour free damage replacement guarantee for GutGlow.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666] mb-3">
              <Truck className="w-3.5 h-3.5 text-[#111111]" />
              Delivery & Replacements
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
              Shipping & Replacement Policy
            </h1>
            <p className="text-xs text-[#666666] mt-2">
              Last updated: November 2026 • FSSAI Food Hygiene & Ingestible Wellness Standards
            </p>
          </div>

          {/* Quick Notice Banner */}
          <div className="p-5 rounded-2xl bg-[#FFF9F5] border border-[#FFE6D5] space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#B85D19] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#B85D19] uppercase tracking-wider">
                  Consumable Wellness Product Guarantee
                </h3>
                <p className="text-xs text-[#7A3C0E] leading-relaxed">
                  GutGlow Daily Wellness Formula is an ingestible dietary formulation regulated under FSSAI food safety norms. To guarantee unmatched hygiene, purity, and safety for every customer, <strong>delivered units are strictly non-returnable</strong> once handed over. However, your purchase is 100% protected against transit mishaps: any damage, broken seal, or fulfillment error is covered by our <strong>48-Hour Free Replacement Guarantee</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs leading-relaxed text-[#555555] space-y-8">
            {/* Section 1: Dispatch & Delivery */}
            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-[#FFFFFF] text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-bold text-[#111111]">
                  Complimentary Express Dispatch & Delivery
                </h2>
              </div>
              <p>
                We provide complimentary express delivery on all orders across India. Every order is packed in tamper-evident, temperature-cushioned insulated packaging:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#666666]">
                <li><strong>Dispatch Window:</strong> Orders placed before 2:00 PM IST (Mon–Sat) are typically dispatched on the same day. All other orders dispatch within 24 to 48 business hours.</li>
                <li><strong>Metro Cities:</strong> Delivered within 2 to 4 business days.</li>
                <li><strong>Rest of India:</strong> Delivered within 3 to 6 business days.</li>
                <li><strong>Carrier Partners:</strong> Handled through Tier-1 logistics partners including Bluedart, Delhivery, and Shadowfax.</li>
              </ul>
            </section>

            {/* Section 2: Order Tracking */}
            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-[#FFFFFF] text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-sm font-bold text-[#111111]">
                  Real-Time Courier Tracking
                </h2>
              </div>
              <p>
                As soon as your shipment is picked up from our fulfillment hub, an automated tracking SMS and Email containing your unique Air Waybill (AWB) number and live tracking link will be sent to your registered contact details.
              </p>
              <p>
                You can also track your live shipment milestone anytime directly on our website via the{" "}
                <Link href="/track-order" className="text-[#111111] font-semibold underline hover:text-[#B85D19]">
                  Track Order
                </Link>{" "}
                portal.
              </p>
            </section>

            {/* Section 3: Non-Returnable Consumable Policy */}
            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-[#FFFFFF] text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-bold text-[#111111]">
                  Non-Returnable Consumable Policy (Why We Do Not Accept Returns)
                </h2>
              </div>
              <p>
                GutGlow is an edible, ingestible nutritional formula intended for daily digestive wellness. In accordance with strict FSSAI food hygiene regulations, items that have entered a customer’s possession cannot be returned, restocked, or resold under any circumstances.
              </p>
              <p>
                This zero-compromise policy ensures that every canister shipped from our warehouse is 100% factory-sealed, unadulterated, and freshly packed from our climate-controlled batch inventory. We do not accept returns or refunds for personal taste preference, texture variations, or change of mind once the package is delivered.
              </p>
            </section>

            {/* Section 4: 48-Hour Free Replacement */}
            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-[#FFFFFF] text-[11px] font-bold flex items-center justify-center">
                  4
                </span>
                <h2 className="text-sm font-bold text-[#111111]">
                  48-Hour Free Replacement Guarantee (Transit Damage / Broken Seal)
                </h2>
              </div>
              <p>
                While returns for personal reasons are not accepted, you are 100% covered if courier transit compromises your order. We offer a <strong>Free Fresh Replacement</strong> if:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#666666]">
                <li>The outer canister, lid, or packaging was crushed, cracked, or leaking upon arrival.</li>
                <li>The tamper-evident induction safety seal was torn or missing upon unboxing.</li>
                <li>An incorrect product, pack size, or expired unit was delivered due to fulfillment error.</li>
              </ul>
              <div className="p-4 rounded-xl bg-[#F9F9F9] border border-[#E5E5E5] space-y-2 mt-3">
                <p className="font-semibold text-[#111111]">Important Claim Conditions:</p>
                <ul className="list-disc pl-5 space-y-1 text-[#666666]">
                  <li>Claims must be initiated within <strong>48 hours of delivery</strong> (as timestamped by the courier delivery log).</li>
                  <li>Clear photo or unboxing video proof showing the shipping label, exterior packaging, and the damaged seal/jar is mandatory.</li>
                  <li>Once verified by our inspection desk (within 24 hours), a brand-new replacement unit is immediately dispatched at zero cost to you.</li>
                </ul>
              </div>
            </section>

            {/* Section 5: How to Claim */}
            <section className="space-y-3 border-b border-[#F0F0F0] pb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-[#FFFFFF] text-[11px] font-bold flex items-center justify-center">
                  5
                </span>
                <h2 className="text-sm font-bold text-[#111111]">
                  How to Submit a Damage Claim
                </h2>
              </div>
              <p>
                Initiating a replacement request is fully digitized and takes less than 2 minutes:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-[#666666]">
                <li>Head to our self-service <Link href="/claims/new" className="text-[#111111] font-semibold underline">Damage Claim Desk</Link>.</li>
                <li>Enter your <strong>Order ID</strong> (e.g. GG-2026-...) and registered <strong>Phone Number</strong>.</li>
                <li>Select the condition (e.g. Damaged in Transit or Broken Seal) and upload 1 to 4 clear photos.</li>
                <li>Submit your claim. Our team reviews submissions within 24 hours. Upon approval, your free replacement tracking details will be generated instantly.</li>
              </ol>
              <div className="pt-2">
                <Link
                  href="/claims/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111111] text-[#FFFFFF] text-xs font-semibold hover:bg-[#222222] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#8BC5FF]" />
                  Open Damage Claim Desk
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>

            {/* Section 6: Cancellations & RTO */}
            <section className="space-y-2 border-b border-[#F0F0F0] pb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-[#FFFFFF] text-[11px] font-bold flex items-center justify-center">
                  6
                </span>
                <h2 className="text-sm font-bold text-[#111111]">
                  Order Cancellations & Courier RTO (Return to Origin)
                </h2>
              </div>
              <p>
                <strong>Pre-Dispatch Cancellation:</strong> If you placed an order by mistake, you can request cancellation before warehouse packaging (usually within 2 hours of placing the order) by contacting care@gutglow.com. Once an order is assigned a courier AWB and dispatched, cancellation is no longer possible.
              </p>
              <p>
                <strong>Failed Delivery / RTO:</strong> If a delivery attempt fails due to an incorrect address, unreachable recipient, or refusal at the doorstep without opening the parcel, the courier initiates a Return to Origin (RTO). For prepaid RTO shipments, a refund minus courier return logistics charges will be processed back to the original payment method after the package is inspected at our warehouse.
              </p>
            </section>

            {/* Section 7: Need Help */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#111111] text-[#FFFFFF] text-[11px] font-bold flex items-center justify-center">
                  7
                </span>
                <h2 className="text-sm font-bold text-[#111111]">
                  Dedicated Customer Support
                </h2>
              </div>
              <p>
                Have questions regarding your order or our policies? We are always here to help:
              </p>
              <div className="p-4 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] space-y-1 text-xs">
                <p><strong>Email:</strong> <a href="mailto:care@gutglow.com" className="underline hover:text-[#111111]">care@gutglow.com</a></p>
                <p><strong>Support Hours:</strong> Monday – Saturday, 9:30 AM – 6:30 PM IST</p>
                <p><strong>Instagram Direct:</strong> <a href="https://instagram.com/gutglowofficial" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#111111]">@gutglowofficial</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
