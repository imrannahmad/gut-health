"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { newsletterSchema } from "@/lib/validations";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const result = newsletterSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues?.[0]?.message || "Invalid email address");
      return;
    }
    setError(null);
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="w-full px-2.5 min-[360px]:px-3.5 sm:px-6 lg:px-8 pb-3.5 sm:pb-6 pt-3 sm:pt-4 bg-transparent">
      <footer className="relative max-w-[1180px] mx-auto bg-[#3B2418] text-[#FFFFFF] rounded-[24px] min-[360px]:rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] border border-[#2C1A11] px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14 shadow-[0_16px_40px_rgba(40,24,14,0.18)] overflow-hidden">
        {/* Subtle Luxury Ambient Background Watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -right-6 select-none text-[80px] sm:text-[120px] lg:text-[150px] font-bold tracking-tighter text-[#FFFFFF]/[0.03] uppercase font-serif"
        >
          GutGlow
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 pb-10 sm:pb-12 border-b border-[#FFFFFF]/15">
            {/* Brand Info */}
            <div className="sm:col-span-2 md:col-span-5 space-y-4">
              <Link href="/" className="inline-block relative">
                <div className="relative h-7 w-28 sm:h-8 sm:w-32">
                  <Image
                    src="/images/gutglow-logo-white.png"
                    alt="GutGlow"
                    fill
                    sizes="128px"
                    className="object-contain object-left"
                  />
                </div>
              </Link>
              <p className="text-xs text-[#FFFFFF]/75 leading-relaxed max-w-sm">
                Thoughtful gut wellness for everyday living. Formulated to support
                digestive balance and holistic well-being from within.
              </p>
            </div>

            {/* Navigation Links */}
            <div className="space-y-3 md:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#FFFFFF]">
                Navigation
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/product" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    Daily Formula
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/philosophy" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    The Science
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/track-order" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    My Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Policies & Support */}
            <div className="md:col-span-2 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#FFFFFF]">
                Information
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/contact" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    Customer Support
                  </Link>
                </li>
                <li>
                  <Link href="/policies/privacy" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/policies/terms" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/policies/shipping" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors inline-block"
                  >
                    Instagram ↗
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="sm:col-span-2 md:col-span-3 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#FFFFFF]">
                Newsletter
              </p>
              <p className="text-xs text-[#FFFFFF]/75 leading-relaxed">
                Updates on digestive wellness and new batch releases.
              </p>

              {subscribed ? (
                <div className="p-3 bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 rounded-lg text-xs flex items-center gap-2 text-[#FFFFFF]">
                  <Check className="w-3.5 h-3.5 text-[#8BC5FF]" />
                  <span>Thank you for subscribing.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 rounded-lg px-3.5 py-2.5 text-xs text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:border-[#8BC5FF] focus:bg-[#FFFFFF]/15 transition-all pr-10"
                      aria-label="Email for newsletter"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 top-1 bottom-1 px-3 bg-[#8BC5FF] text-[#111111] rounded-md hover:bg-[#7ABBF7] transition-colors flex items-center justify-center"
                      aria-label="Subscribe"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {error && <p className="text-[11px] text-[#ff8b8b]">{error}</p>}
                </form>
              )}
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFFFFF]/60">
            <p>© 2026 GutGlow Wellness. All rights reserved.</p>
            <p className="text-[11px] uppercase tracking-wider">
              Premium Minimalist Digestive Care
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
