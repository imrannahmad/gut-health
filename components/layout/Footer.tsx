"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, ShieldCheck, Leaf, HeartHandshake } from "lucide-react";
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
    <footer className="bg-[#173D32] text-[#F8F6EF] pt-20 pb-12 border-t border-[#122e26] selection:bg-[#F8F6EF] selection:text-[#173D32]">
      {/* Brand Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-[#255547]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#255547] flex items-center justify-center text-[#A9B9A0] shrink-0">
              <Leaf className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-medium tracking-wide text-[#F8F6EF]">
                Plant-Derived Actives
              </h4>
              <p className="text-xs text-[#A9B9A0] mt-0.5">
                Thoughtfully formulated without harsh laxatives or synthetic fillers
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#255547] flex items-center justify-center text-[#A9B9A0] shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-medium tracking-wide text-[#F8F6EF]">
                Verified Manufacturing
              </h4>
              <p className="text-xs text-[#A9B9A0] mt-0.5">
                Produced in ISO & GMP certified facilities with batch transparency
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#255547] flex items-center justify-center text-[#A9B9A0] shrink-0">
              <HeartHandshake className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-medium tracking-wide text-[#F8F6EF]">
                Honest & Responsible
              </h4>
              <p className="text-xs text-[#A9B9A0] mt-0.5">
                Realistic wellness insights rooted in microbiome research
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-block relative">
              <div className="relative h-12 w-44 bg-[#F8F6EF] px-3 py-1.5 rounded-lg">
                <Image
                  src="/images/gutglow-logo.png"
                  alt="GutGlow - Wellness From Within"
                  fill
                  sizes="176px"
                  className="object-contain p-1"
                />
              </div>
            </Link>
            <p className="text-sm text-[#A9B9A0] leading-relaxed max-w-sm">
              GutGlow is an editorial wellness house dedicated to digestive harmony,
              mindful formulation, and the foundational connection between gut health
              and holistic vitality.
            </p>
            <div className="text-xs text-[#A9B9A0]/80 tracking-widest uppercase">
              Brand Positioning: <span className="text-[#F8F6EF] font-medium">Wellness From Within</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#A9B9A0]">
              Discover
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[#F8F6EF]/80 hover:text-[#F8F6EF] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/product"
                  className="text-[#F8F6EF]/80 hover:text-[#F8F6EF] transition-colors font-medium text-[#B99A63]"
                >
                  Daily Wellness Formula
                </Link>
              </li>
              <li>
                <Link
                  href="/philosophy"
                  className="text-[#F8F6EF]/80 hover:text-[#F8F6EF] transition-colors"
                >
                  The Science
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[#F8F6EF]/80 hover:text-[#F8F6EF] transition-colors"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-[#F8F6EF]/80 hover:text-[#F8F6EF] transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#F8F6EF]/80 hover:text-[#F8F6EF] transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Legal */}
          <div className="lg:col-span-2 space-y-4">
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#A9B9A0]">
              Policies
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/policies/privacy"
                  className="text-[#F8F6EF]/80 hover:text-[#F8F6EF] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/terms"
                  className="text-[#F8F6EF]/80 hover:text-[#F8F6EF] transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/shipping"
                  className="text-[#F8F6EF]/80 hover:text-[#F8F6EF] transition-colors"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A9B9A0] hover:text-[#F8F6EF] transition-colors flex items-center gap-1.5 pt-2"
                >
                  <span>Instagram</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="lg:col-span-3 space-y-4">
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#A9B9A0]">
              The Journal
            </h5>
            <p className="text-xs text-[#A9B9A0] leading-relaxed">
              Receive thoughtful essays on digestive physiology, seasonal nutrition,
              and mindful wellness habits. No spam, ever.
            </p>

            {subscribed ? (
              <div className="bg-[#255547] text-[#F8F6EF] p-4 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-[#A9B9A0] shrink-0" />
                <span>Thank you. Welcome to the GutGlow community.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-[#0E2921] border border-[#255547] rounded-full px-4 py-2.5 text-xs text-[#F8F6EF] placeholder-[#A9B9A0]/60 focus:outline-none focus:border-[#B99A63] transition-colors pr-10"
                    aria-label="Email address for newsletter"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#A9B9A0] text-[#173D32] hover:bg-[#F8F6EF] rounded-full transition-colors flex items-center justify-center"
                    aria-label="Submit newsletter subscription"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {error && <p className="text-[11px] text-[#ff9999]">{error}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Responsible Medical Disclaimer */}
        <div className="mt-16 pt-8 border-t border-[#255547]/60">
          <div className="bg-[#0E2921]/60 border border-[#255547] rounded-xl p-5 text-[11px] text-[#A9B9A0] leading-relaxed">
            <span className="font-semibold text-[#F8F6EF] block mb-1">
              Responsible Wellness Notice:
            </span>
            These statements have not been evaluated by the Food Safety and Standards
            Authority of India (FSSAI) or the US FDA. This product is a dietary
            wellness supplement designed for nutritional balance and is not intended to
            diagnose, treat, cure, or prevent any medical condition, gastrointestinal
            disease, hair loss, or cosmetic dermatological conditions. Individual
            responses may vary. Always consult your personal physician before beginning
            any new nutritional regimen.
          </div>
        </div>

        {/* Copyright & Signoff */}
        <div className="mt-8 pt-6 border-t border-[#255547]/40 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A9B9A0] gap-4">
          <p>© 2026 GutGlow Wellness Pvt. Ltd. All rights reserved.</p>
          <p className="text-[11px] tracking-wider uppercase text-[#A9B9A0]/80">
            Thoughtfully Crafted in India
          </p>
        </div>
      </div>
    </footer>
  );
}
