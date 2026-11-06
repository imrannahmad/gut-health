import React from "react";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Shipping & Returns Policy | GutGlow",
  description:
    "Complimentary express nationwide shipping timelines, order tracking, and 14-day return guidelines for GutGlow.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B99A63]">
              FULFILLMENT & SATISFACTION
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#173D32] mt-1">
              Shipping & Returns
            </h1>
            <p className="text-xs text-[#575D52] mt-1">
              Last updated: November 2026
            </p>
          </div>

          <div className="prose prose-sm text-xs leading-relaxed text-[#575D52] space-y-8">
            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
              <div className="p-4 bg-[#EEEBDD]/60 rounded-2xl border border-[#E6E1D3] text-center">
                <Truck className="w-5 h-5 text-[#173D32] mx-auto mb-1.5" />
                <h4 className="text-xs font-serif font-medium text-[#173D32]">
                  Free Delivery
                </h4>
                <p className="text-[10px] text-[#575D52]">Across all Indian PIN codes</p>
              </div>

              <div className="p-4 bg-[#EEEBDD]/60 rounded-2xl border border-[#E6E1D3] text-center">
                <ShieldCheck className="w-5 h-5 text-[#173D32] mx-auto mb-1.5" />
                <h4 className="text-xs font-serif font-medium text-[#173D32]">
                  24-Hour Dispatch
                </h4>
                <p className="text-[10px] text-[#575D52]">Mon–Sat fulfillment</p>
              </div>

              <div className="p-4 bg-[#EEEBDD]/60 rounded-2xl border border-[#E6E1D3] text-center">
                <RotateCcw className="w-5 h-5 text-[#173D32] mx-auto mb-1.5" />
                <h4 className="text-xs font-serif font-medium text-[#173D32]">
                  14-Day Returns
                </h4>
                <p className="text-[10px] text-[#575D52]">On intact safety seals</p>
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                1. Nationwide Shipping Policy
              </h2>
              <p>
                We provide complimentary express delivery on every order,
                regardless of pack size. We partner with premier logistics carriers
                (including BlueDart, Delhivery, and DTDC) to ensure rapid and
                temperature-conscious transit for our botanical formulations.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong className="text-[#173D32]">Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata):</strong>{" "}
                  2 to 3 business days.
                </li>
                <li>
                  <strong className="text-[#173D32]">Tier II & Regional Cities:</strong>{" "}
                  3 to 5 business days.
                </li>
                <li>
                  <strong className="text-[#173D32]">Order Processing:</strong> Orders
                  placed prior to 2:00 PM IST on business days are dispatched the
                  same afternoon from our central fulfillment center.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                2. Real-Time Tracking
              </h2>
              <p>
                Once your package is picked up by our courier partners, an automated
                SMS and email containing your live tracking number (AWB) will be
                delivered immediately. You can track your shipment at any stage.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                3. Cancellation Window
              </h2>
              <p>
                You may cancel your order at zero charge at any time before it has
                been dispatched from our warehouse. Once an AWB has been generated,
                cancellations cannot be processed; please refer to our return process
                upon delivery.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                4. 14-Day Return & Replacement Policy
              </h2>
              <p>
                Due to dietary and hygiene regulations, we accept returns only on
                unopened jars where the outer tamper-evident safety seal remains
                completely intact.
              </p>
              <p>
                If your jar arrives damaged, leaked, or missing in transit, please
                notify us at <span className="text-[#173D32] font-medium">care@gutglow.com</span> within
                48 hours with photographs of the outer carton and product. We will
                dispatch an immediate complimentary replacement.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-serif font-semibold text-[#173D32]">
                5. Refunds
              </h2>
              <p>
                Approved returns are inspected within 2 business days of receipt at
                our warehouse. Refunds are credited back to the original payment
                method (or designated bank account for COD orders) within 5–7
                banking days.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
