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
    <footer className="bg-[#FFFFFF] text-[#111111] pt-16 pb-12 border-t border-[#E8E8E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-[#E8E8E8]">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block relative">
              <div className="relative h-8 w-28 sm:h-9 sm:w-36">
                <Image
                  src="/images/gutglow-logo.png"
                  alt="GutGlow"
                  fill
                  sizes="144px"
                  className="object-contain object-left brightness-0"
                />
              </div>
            </Link>
            <p className="text-xs text-[#777777] leading-relaxed max-w-sm">
              Thoughtful gut wellness for everyday living. Formulated to support
              digestive balance and holistic well-being from within.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#111111]">
              Navigation
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-[#777777] hover:text-[#111111] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/product" className="text-[#777777] hover:text-[#111111] transition-colors">
                  Daily Formula
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#777777] hover:text-[#111111] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/philosophy" className="text-[#777777] hover:text-[#111111] transition-colors">
                  The Science
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#777777] hover:text-[#111111] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Support */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#111111]">
              Information
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/contact" className="text-[#777777] hover:text-[#111111] transition-colors">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="text-[#777777] hover:text-[#111111] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="text-[#777777] hover:text-[#111111] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="text-[#777777] hover:text-[#111111] transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#777777] hover:text-[#111111] transition-colors inline-block"
                >
                  Instagram ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#111111]">
              Newsletter
            </p>
            <p className="text-xs text-[#777777] leading-relaxed">
              Updates on digestive wellness and new batch releases.
            </p>

            {subscribed ? (
              <div className="p-3 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-xs flex items-center gap-2 text-[#111111]">
                <Check className="w-3.5 h-3.5 text-[#111111]" />
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
                    className="w-full bg-[#F7F7F7] border border-[#E8E8E8] rounded-full px-4 py-2.5 text-xs text-[#111111] placeholder-[#777777] focus:outline-none focus:border-[#111111] pr-10"
                    aria-label="Email for newsletter"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-[#111111] text-[#FFFFFF] rounded-full hover:bg-[#333333] transition-colors flex items-center justify-center"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {error && <p className="text-[11px] text-[#c0392b]">{error}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
          <p>© 2026 GutGlow Wellness. All rights reserved.</p>
          <p className="text-[11px] uppercase tracking-wider">
            Premium Minimalist Digestive Care
          </p>
        </div>
      </div>
    </footer>
  );
}
