"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface TrackingEvent {
  title: string;
  location: string;
  time: string;
  completed: boolean;
  active?: boolean;
}

const demoShipmentData = {
  orderNumber: "GG-84291",
  trackingNumber: "EXP-BLUEDART-984210",
  courier: "Blue Dart Express Logistics",
  status: "In Transit — On Schedule",
  estimatedDelivery: "Thursday, Nov 12, 2026",
  dispatchedDate: "Nov 9, 2026 · 11:30 AM",
  destination: "Mumbai, Maharashtra · 400050",
  items: [
    {
      name: "GutGlow Daily Wellness Formula — 3-Month Ritual",
      servings: "90 Daily Servings · Net Wt. 600g",
      qty: 1,
      image: "/images/gutglow-product-front.jpg",
      price: "₹4,899",
    },
  ],
  timeline: [
    {
      title: "Order Placed & Verified",
      location: "GutGlow Fulfillment Facility",
      time: "Nov 8, 2026 · 04:15 PM",
      completed: true,
    },
    {
      title: "Quality Inspected & Sealed for Dispatch",
      location: "Central Warehouse, New Delhi",
      time: "Nov 9, 2026 · 09:40 AM",
      completed: true,
    },
    {
      title: "Departed Origin Sort Facility",
      location: "Blue Dart Express Hub, Delhi",
      time: "Nov 9, 2026 · 02:15 PM",
      completed: true,
      active: true,
    },
    {
      title: "Arrived at Destination Distribution Center",
      location: "Bandra Sorting Hub, Mumbai",
      time: "Estimated Nov 11, 2026",
      completed: false,
    },
    {
      title: "Out for Delivery",
      location: "Courier Partner Assigned",
      time: "Estimated Nov 12, 2026",
      completed: false,
    },
  ],
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setErrorMessage("Please enter a valid GutGlow Order Number or AWB Tracking ID.");
      return;
    }
    setErrorMessage("");
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      setShowDemo(true);
    }, 600);
  };

  const handleLoadDemo = () => {
    setOrderId("GG-84291");
    setEmailOrPhone("customer@example.com");
    setErrorMessage("");
    setShowDemo(true);
    setHasSearched(true);
  };

  const handleReset = () => {
    setOrderId("");
    setEmailOrPhone("");
    setShowDemo(false);
    setHasSearched(false);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header Title Section */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F4EBDD] rounded-full border border-[#E5DAC8]">
              <Truck className="w-3.5 h-3.5 text-[#54232F]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#54232F]">
                COMPLIMENTARY NATIONWIDE EXPRESS
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] tracking-[-0.03em] leading-tight">
              Track Your Order.
            </h1>

            <p className="text-sm sm:text-base text-[#666666] leading-relaxed">
              Enter your GutGlow order reference number or airway bill (AWB) to check live transit status and estimated dispatch delivery.
            </p>
          </div>

          {/* Tracking Search Card */}
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#FAF6F0] border border-[#EADBCA] shadow-[0_8px_24px_rgba(40,30,20,0.04)]">
            <form onSubmit={handleTrackSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="orderId" className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                    Order Number / AWB ID <span className="text-[#54232F]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="orderId"
                      type="text"
                      placeholder="e.g. GG-84291 or EXP-984210"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#54232F]/20 focus:border-[#54232F] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="emailOrPhone" className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                    Email Address or Phone (Optional)
                  </label>
                  <input
                    id="emailOrPhone"
                    type="text"
                    placeholder="e.g. imran@example.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5DAC8] rounded-xl text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#54232F]/20 focus:border-[#54232F] transition-all"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#B91C1C] pt-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs disabled:opacity-60"
                >
                  <Search className="w-4 h-4" />
                  <span>{isSearching ? "Searching Transit Records..." : "Track Package"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="text-xs font-semibold text-[#54232F] hover:text-[#111111] transition-colors underline decoration-[#54232F]/30 underline-offset-4"
                >
                  Or preview sample live shipment (GG-84291) →
                </button>
              </div>
            </form>
          </div>

          {/* Results: Live Tracking Card */}
          {showDemo && (
            <div className="space-y-8 animate-fadeIn">
              {/* Order Status Banner */}
              <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#FFFFFF] border border-[#E8E8E8] shadow-[0_12px_36px_rgba(0,0,0,0.06)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E8E8]">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#54232F]">
                      Active Order #{demoShipmentData.orderNumber}
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#111111]">
                      {demoShipmentData.status}
                    </h2>
                    <p className="text-xs text-[#666666]">
                      Carrier: <span className="font-semibold text-[#111111]">{demoShipmentData.courier}</span> · Tracking ID: <span className="font-mono text-[#54232F] font-semibold">{demoShipmentData.trackingNumber}</span>
                    </p>
                  </div>

                  <div className="sm:text-right space-y-1 bg-[#FAF6F0] sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <span className="text-[11px] uppercase tracking-wider text-[#666666]">Estimated Delivery</span>
                    <p className="text-base font-bold text-[#111111]">{demoShipmentData.estimatedDelivery}</p>
                    <p className="text-[11px] text-[#059669] font-semibold flex items-center sm:justify-end gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                      Complimentary Express Delivery
                    </p>
                  </div>
                </div>

                {/* Visual Step Tracker */}
                <div className="py-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-6">
                    Live Shipment Journey
                  </p>

                  <div className="space-y-6">
                    {demoShipmentData.timeline.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4 relative">
                        {/* Connecting Line */}
                        {idx !== demoShipmentData.timeline.length - 1 && (
                          <div
                            className={`absolute left-4 top-8 w-0.5 h-10 -ml-[1px] ${
                              step.completed ? "bg-[#54232F]" : "bg-[#E5E5E5]"
                            }`}
                          />
                        )}

                        {/* Icon Node */}
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            step.completed
                              ? "bg-[#54232F] text-[#FFFFFF]"
                              : step.active
                              ? "bg-[#F4EBDD] border-2 border-[#54232F] text-[#54232F]"
                              : "bg-[#F5F5F5] text-[#999999]"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          ) : step.active ? (
                            <Truck className="w-4 h-4 animate-bounce" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
                          <div>
                            <p
                              className={`text-sm font-bold ${
                                step.completed || step.active ? "text-[#111111]" : "text-[#777777]"
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-xs text-[#666666] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#999999]" />
                              <span>{step.location}</span>
                            </p>
                          </div>

                          <div className="sm:text-right shrink-0">
                            <span className="text-[11px] text-[#888888] font-mono">{step.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Package Items */}
                <div className="pt-6 border-t border-[#E8E8E8]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                    Items in this Package
                  </p>
                  {demoShipmentData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF6F0] border border-[#EADBCA]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#FFFFFF] border border-[#E5DAC8] shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover object-center"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111111]">{item.name}</p>
                          <p className="text-[11px] text-[#666666]">{item.servings}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#111111]">{item.price}</span>
                        <p className="text-[10px] text-[#888888]">Qty: {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8E8E8]">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#111111] transition-colors py-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Track Another Order</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/account"
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#54232F] hover:text-[#111111] transition-colors"
                    >
                      <span>View in Customer Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help & Assurance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="p-6 rounded-2xl bg-[#FAF6F0] border border-[#EADBCA] space-y-2">
              <Truck className="w-5 h-5 text-[#54232F]" />
              <h3 className="text-sm font-bold text-[#111111]">Nationwide Dispatch</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Orders placed before 2:00 PM are dispatched on the same business day via insured express courier.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF6F0] border border-[#EADBCA] space-y-2">
              <ShieldCheck className="w-5 h-5 text-[#54232F]" />
              <h3 className="text-sm font-bold text-[#111111]">Tamper-Proof Packaging</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Every jar is double-sealed in protective temperature-controlled boxes for freshness and safety.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF6F0] border border-[#EADBCA] space-y-2">
              <Package className="w-5 h-5 text-[#54232F]" />
              <h3 className="text-sm font-bold text-[#111111]">Concierge Support</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Need updates or address modifications? Reach us at <span className="text-[#111111] font-semibold">support@gutglow.com</span>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
