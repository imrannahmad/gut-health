"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, ArrowRight, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { motion, AnimatePresence } from "framer-motion";

const desktopNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Our Story" },
  { href: "/philosophy", label: "The Science" },
  { href: "/track-order", label: "Track Order" },
  { href: "/faq", label: "FAQ" },
];

const mobileNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Our Story" },
  { href: "/philosophy", label: "The Science" },
  { href: "/track-order", label: "Track Order" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { totalItems, openDrawer: openCartDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const savedScrollY = useRef<number>(0);

  // Non-destructive mobile scroll lock: prevents background scroll while preserving sticky header & scroll position
  useEffect(() => {
    if (!mobileMenuOpen) return;

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const menuEl = document.getElementById("mobile-navigation-dropdown");
      if (menuEl && menuEl.contains(e.target as Node)) {
        if (e.touches && e.touches.length > 0) {
          const currentY = e.touches[0].clientY;
          const deltaY = currentY - touchStartY;
          const isAtTop = menuEl.scrollTop <= 0;
          const isAtBottom =
            menuEl.scrollTop + menuEl.clientHeight >= menuEl.scrollHeight - 1;

          // Prevent rubber-banding from bubbling up to document
          if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
            if (e.cancelable) e.preventDefault();
          }
        }
        return;
      }

      // Touch outside menu (e.g. backdrop, header) -> block background scroll
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const menuEl = document.getElementById("mobile-navigation-dropdown");
      if (menuEl && menuEl.contains(e.target as Node)) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const origHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    const origBodyOverscroll = document.body.style.overscrollBehavior;
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("wheel", handleWheel);
      document.documentElement.style.overscrollBehavior = origHtmlOverscroll;
      document.body.style.overscrollBehavior = origBodyOverscroll;
    };
  }, [mobileMenuOpen]);

  // Automatically close mobile menu if viewport expands to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMobileMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Floating Header Container with refined fluid micro-gap */}
      <div className="sticky top-0 z-50 w-full px-2 min-[360px]:px-2.5 min-[400px]:px-3.5 sm:px-6 pt-1.5 sm:pt-2.5 pb-1 sm:pb-2 pointer-events-none">
        <div ref={menuRef} className="pointer-events-auto max-w-[1180px] mx-auto">
          
          {/* DESKTOP HEADER (≥ 900px): Warm Ivory Floating Pill with fluid spacing */}
          <header className="hidden min-[900px]:flex items-center justify-between h-[68px] min-[1040px]:h-[74px] lg:h-[78px] px-4 min-[1040px]:px-6 lg:px-8 bg-[#F4EBDD] border border-[#E5DAC8] rounded-full shadow-[0_10px_28px_rgba(40,30,20,0.06)] backdrop-blur-md">
            
            {/* Left: Brand Logo in Deep Maroon */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="inline-block relative focus:outline-none">
                <div className="relative h-6 w-24 min-[1040px]:h-7 min-[1040px]:w-28 lg:h-8 lg:w-32">
                  <Image
                    src="/images/gutglow-logo-maroon.png"
                    alt="GutGlow"
                    fill
                    sizes="(max-width: 1024px) 112px, 128px"
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Center: Navigation Links in Soft Black */}
            <nav className="flex items-center gap-1 min-[1040px]:gap-1.5 lg:gap-2">
              {desktopNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 min-[1040px]:px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-[11px] lg:text-xs uppercase tracking-[0.08em] lg:tracking-[0.12em] transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "bg-[#E5D8C5] text-[#54232F] font-bold"
                        : "text-[#171717]/80 hover:text-[#171717] hover:bg-[#EADBCA] font-medium"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Account + Cart + Black Shop Now CTA) */}
            <div className="flex items-center gap-1 min-[1040px]:gap-2 lg:gap-3 shrink-0">
              {/* Account / User Icon */}
              <Link
                href="/account"
                aria-label="My Account & Orders"
                title="My Account & Orders"
                className={`relative p-2 lg:p-2.5 text-[#171717] hover:bg-[#EADBCA] transition-colors rounded-full focus:outline-none ${
                  pathname === "/account" ? "bg-[#E5D8C5] text-[#54232F]" : ""
                }`}
              >
                <User className="w-4 h-4 lg:w-5 lg:h-5 stroke-[1.75]" />
              </Link>

              {/* Cart Icon in Dark Charcoal */}
              <button
                type="button"
                onClick={openCartDrawer}
                aria-label={`Shopping bag with ${totalItems} items`}
                className="relative p-2 lg:p-2.5 text-[#171717] hover:bg-[#EADBCA] transition-colors rounded-full focus:outline-none"
              >
                <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5 stroke-[1.75]" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 lg:top-1.5 lg:right-1.5 flex items-center justify-center min-w-[15px] h-[15px] lg:min-w-[16px] lg:h-[16px] px-1 text-[8px] lg:text-[9px] font-bold text-[#FFFFFF] bg-[#54232F] rounded-full shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Shop Now CTA (Black Pill with White Text) */}
              <Link
                href="/product"
                className="inline-flex items-center justify-center bg-[#171717] text-[#FFFFFF] px-4 min-[1040px]:px-5 lg:px-6 py-2 lg:py-2.5 rounded-full text-[11px] lg:text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors duration-200 shadow-xs whitespace-nowrap"
              >
                Shop Now
              </Link>
            </div>
          </header>

          {/* MOBILE & TABLET HEADER (< 900px): Adaptive Warm Ivory Floating Pill (All 5 Elements Fully Contained) */}
          <header className="flex min-[900px]:hidden items-center justify-between h-[56px] min-[360px]:h-[60px] sm:h-[68px] px-2.5 min-[360px]:px-3 min-[400px]:px-4 sm:px-5 bg-[#F4EBDD] border border-[#E5DAC8] rounded-full shadow-[0_8px_24px_rgba(40,30,20,0.08)] backdrop-blur-md">
            
            {/* Left: Brand Logo in Deep Maroon */}
            <div className="flex items-center shrink-0">
              <Link href="/" aria-label="GutGlow Home" className="flex items-center min-h-[44px] py-1 focus:outline-none">
                <div className="relative h-5.5 w-[82px] min-[360px]:h-6 min-[360px]:w-[90px] min-[400px]:w-28 sm:h-7 sm:w-32">
                  <Image
                    src="/images/gutglow-logo-maroon.png"
                    alt="GutGlow"
                    fill
                    sizes="(max-width: 640px) 112px, 128px"
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Center: Black Shop Now CTA */}
            <div className="shrink-0 px-0.5 min-[360px]:px-1">
              <Link
                href="/product"
                className="inline-flex items-center justify-center min-h-[30px] min-[360px]:min-h-[34px] sm:min-h-[38px] px-2.5 min-[360px]:px-3 min-[400px]:px-4 sm:px-5 py-1 min-[360px]:py-1.5 bg-[#171717] text-[#FFFFFF] rounded-full text-[9.5px] min-[360px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.06em] min-[360px]:tracking-[0.08em] hover:bg-[#333333] transition-colors shadow-xs whitespace-nowrap"
              >
                Shop Now
              </Link>
            </div>

            {/* Right: Account + Cart + Hamburger Toggle (Refined fluid sizing perfectly contained inside pill) */}
            <div className="flex items-center gap-0.5 min-[360px]:gap-0.5 min-[400px]:gap-1 shrink-0">
              {/* Account Link on Mobile */}
              <Link
                href="/account"
                aria-label="My Account"
                className={`w-8.5 h-8.5 min-[360px]:w-9 min-[360px]:h-9 min-[400px]:w-10 min-[400px]:h-10 flex items-center justify-center rounded-full text-[#171717] hover:bg-[#EADBCA] active:bg-[#E2D2BD] transition-colors focus:outline-none ${
                  pathname === "/account" ? "text-[#54232F]" : ""
                }`}
              >
                <User className="w-[17px] h-[17px] min-[360px]:w-[18px] min-[360px]:h-[18px] min-[400px]:w-5 min-[400px]:h-5 stroke-[1.85]" />
              </Link>

              {/* Cart Button on Mobile */}
              <button
                type="button"
                onClick={openCartDrawer}
                aria-label={`Shopping bag with ${totalItems} items`}
                className="relative w-8.5 h-8.5 min-[360px]:w-9 min-[360px]:h-9 min-[400px]:w-10 min-[400px]:h-10 flex items-center justify-center rounded-full text-[#171717] hover:bg-[#EADBCA] active:bg-[#E2D2BD] transition-colors focus:outline-none"
              >
                <ShoppingBag className="w-[17px] h-[17px] min-[360px]:w-[18px] min-[360px]:h-[18px] min-[400px]:w-5 min-[400px]:h-5 stroke-[1.85]" />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-[360px]:top-1 min-[360px]:right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 text-[8px] font-bold text-[#FFFFFF] bg-[#54232F] rounded-full shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button (Hamburger) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-dropdown"
                className="w-8.5 h-8.5 min-[360px]:w-9 min-[360px]:h-9 min-[400px]:w-10 min-[400px]:h-10 flex items-center justify-center rounded-full text-[#171717] hover:bg-[#EADBCA] active:bg-[#E2D2BD] transition-colors focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <X className="w-4.5 h-4.5 min-[360px]:w-5 min-[360px]:h-5 min-[400px]:w-[21px] min-[400px]:h-[21px] stroke-[2.25]" />
                ) : (
                  <Menu className="w-4.5 h-4.5 min-[360px]:w-5 min-[360px]:h-5 min-[400px]:w-[21px] min-[400px]:h-[21px] stroke-[2.25]" />
                )}
              </button>
            </div>
          </header>

          {/* MOBILE EXPANDED NAVIGATION MENU DROPDOWN (Warm Ivory Theme, crisp, above backdrop) */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                id="mobile-navigation-dropdown"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative z-50 w-full mt-2 max-h-[calc(100dvh-84px)] min-[360px]:max-h-[calc(100dvh-92px)] overflow-y-auto overscroll-contain bg-[#F4EBDD] border border-[#E5DAC8] rounded-[26px] p-3.5 sm:p-5 shadow-[0_20px_40px_rgba(40,30,20,0.14)] backdrop-blur-md min-[900px]:hidden"
                style={{
                  WebkitOverflowScrolling: "touch",
                  overscrollBehavior: "contain",
                }}
              >
                {/* Navigation Links (min 44px tap target each) */}
                <div className="space-y-1 sm:space-y-1.5">
                  {mobileNavLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center min-h-[44px] px-4 sm:px-5 py-3 rounded-xl text-xs min-[360px]:text-[13px] sm:text-sm font-semibold tracking-wide transition-colors ${
                          isActive
                            ? "bg-[#E5D8C5] text-[#54232F]"
                            : "text-[#171717]/85 hover:text-[#171717] hover:bg-[#EADBCA] active:bg-[#E2D2BD]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Bottom Prominent Shop GutGlow CTA */}
                <div className="pt-3.5 mt-3.5 border-t border-[#E5DAC8]">
                  <Link
                    href="/product"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full min-h-[46px] flex items-center justify-center gap-2 bg-[#171717] text-[#FFFFFF] py-3.5 px-6 rounded-full text-xs uppercase tracking-wider font-bold hover:bg-[#333333] transition-colors shadow-sm text-center"
                  >
                    <span>Shop GutGlow</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Backdrop for Mobile Menu Click-Outside */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 min-[900px]:hidden touch-none"
          />
        )}
      </AnimatePresence>
    </>
  );
}
