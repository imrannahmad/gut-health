"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { newsletterSchema } from "@/lib/validations";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll Progress: 0 when footer container top touches viewport bottom, 1 when reached bottom
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  // Velvet spring physics for physical weight and inertia (syncs tightly with scrollwheel/trackpad)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 24,
    restDelta: 0.001,
  });

  // Concept 1: The 3D Perspective Monolith (Tilt & Rise from Depths)
  // Starts tilted back in 3D perspective space (18deg) and deep below (140px, scale 0.91)
  // As the user scrolls down, it rises from the depths, stands straight (0deg), and scales to 1.0
  // When scrolling back up, it reverses smoothly and sinks back into the depths!
  const rotateXSpring = useTransform(smoothProgress, [0, 1], [18, 0]);
  const ySpring = useTransform(smoothProgress, [0, 1], [140, 0]);
  const scaleSpring = useTransform(smoothProgress, [0, 1], [0.91, 1]);
  const shadowSpring = useTransform(
    smoothProgress,
    [0, 1],
    [
      "0px 6px 20px rgba(40,24,14,0.08)",
      "0px 24px 60px rgba(40,24,14,0.26)",
    ]
  );

  const rotateX = rotateXSpring;
  const y = ySpring;
  const scale = scaleSpring;
  const boxShadow = shadowSpring;

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
    <div
      ref={containerRef}
      style={{
        perspective: "1200px",
        perspectiveOrigin: "50% 100%",
      }}
      className="relative z-0 w-full px-2.5 min-[360px]:px-3.5 sm:px-6 lg:px-8 pb-4 sm:pb-8 pt-4 sm:pt-6 bg-transparent overflow-visible"
    >
      <motion.footer
        style={{
          y,
          scale,
          rotateX,
          boxShadow,
          transformOrigin: "center bottom",
          transformStyle: "preserve-3d",
        }}
        className="relative max-w-[1180px] mx-auto bg-[#3B2418] text-[#FFFFFF] rounded-[24px] min-[360px]:rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] border border-[#2C1A11] px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14 overflow-hidden will-change-transform"
      >
        {/* Subtle Warm Rim Light along top border to emphasize curve */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-px left-1/2 -translate-x-1/2 w-3/4 max-w-[500px] h-px bg-gradient-to-r from-transparent via-[#F4EBDE]/30 to-transparent z-10"
        />

        {/* Soft Warm Radial Depth in corner */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#F4EBDE]/[0.04] blur-3xl z-0"
        />

        {/* Subtle Luxury Ambient Background Watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -right-6 select-none text-[80px] sm:text-[120px] lg:text-[150px] font-bold tracking-tighter text-[#FFFFFF]/[0.03] uppercase font-serif z-0"
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
                    Shipping & Replacements
                  </Link>
                </li>
                <li>
                  <Link href="/claims/new" className="text-[#FFFFFF]/70 hover:text-[#8BC5FF] transition-colors">
                    Damage Claims
                  </Link>
                </li>
                <li>
                  <a
                    href="https://instagram.com/gutglowofficial"
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
          <div className="pt-6 sm:pt-8 text-center text-xs text-[#FFFFFF]/60">
            <p>© 2026 GutGlow Wellness. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
