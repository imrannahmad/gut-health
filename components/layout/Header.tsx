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

  // Reliable mobile body scroll-lock with exact scroll position preservation
  useEffect(() => {
    if (mobileMenuOpen) {
      // 1. Record current scroll offset before locking
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      savedScrollY.current = currentScrollY;

      // 2. Prevent layout shift if desktop/tablet scrollbar disappears
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // 3. Lock document body in fixed position at the exact scroll offset (rock-solid on iOS Safari & Chrome)
      document.body.style.position = "fixed";
      document.body.style.top = `-${currentScrollY}px`;
      document.body.style.left = "0px";
      document.body.style.right = "0px";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.documentElement.style.overflow = "hidden";
    } else {
      // 4. Restore original styles and exact scroll position
      const restoreY = savedScrollY.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.documentElement.style.overflow = "";

      if (typeof restoreY === "number" && restoreY > 0) {
        window.scrollTo(0, restoreY);
      }
    }

    return () => {
      // Cleanup on unmount
      const restoreY = savedScrollY.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.documentElement.style.overflow = "";

      if (typeof restoreY === "number" && restoreY > 0) {
        window.scrollTo(0, restoreY);
      }
    };
  }, [mobileMenuOpen]);

  // Automatically close mobile menu if viewport expands to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
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
      {/* Floating Header Container with refined micro-gap (~6px mobile, ~8px desktop) */}
      <div className="sticky top-1.5 sm:top-2 z-40 w-full px-3.5 sm:px-6 pt-1.5 sm:pt-2 pb-1.5 sm:pb-2 pointer-events-none">
        <div ref={menuRef} className="pointer-events-auto max-w-[1180px] mx-auto">
          
          {/* DESKTOP HEADER (≥ 768px): Warm Ivory Floating Pill */}
          <header className="hidden md:flex items-center justify-between h-[74px] lg:h-[78px] px-6 lg:px-8 bg-[#F4EBDD] border border-[#E5DAC8] rounded-full shadow-[0_10px_28px_rgba(40,30,20,0.06)] backdrop-blur-md">
            
            {/* Left: Brand Logo in Deep Maroon */}
            <div className="flex items-center">
              <Link href="/" className="inline-block relative focus:outline-none">
                <div className="relative h-7 w-28 lg:h-8 lg:w-32">
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
            <nav className="flex items-center gap-1.5 lg:gap-2">
              {desktopNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.12em] transition-all duration-200 ${
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
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Account / User Icon */}
              <Link
                href="/account"
                aria-label="My Account & Orders"
                title="My Account & Orders"
                className={`relative p-2.5 text-[#171717] hover:bg-[#EADBCA] transition-colors rounded-full focus:outline-none ${
                  pathname === "/account" ? "bg-[#E5D8C5] text-[#54232F]" : ""
                }`}
              >
                <User className="w-5 h-5 stroke-[1.75]" />
              </Link>

              {/* Cart Icon in Dark Charcoal */}
              <button
                type="button"
                onClick={openCartDrawer}
                aria-label={`Shopping bag with ${totalItems} items`}
                className="relative p-2.5 text-[#171717] hover:bg-[#EADBCA] transition-colors rounded-full focus:outline-none"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                {totalItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-[#FFFFFF] bg-[#54232F] rounded-full shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Shop Now CTA (Black Pill with White Text) */}
              <Link
                href="/product"
                className="inline-flex items-center justify-center bg-[#171717] text-[#FFFFFF] px-5 lg:px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors duration-200 shadow-xs"
              >
                Shop Now
              </Link>
            </div>
          </header>

          {/* MOBILE HEADER (< 768px): Compact Warm Ivory Floating Pill */}
          <header className="flex md:hidden items-center justify-between h-[58px] sm:h-[62px] px-3.5 sm:px-5 bg-[#F4EBDD] border border-[#E5DAC8] rounded-full shadow-[0_6px_20px_rgba(40,30,20,0.06)] backdrop-blur-md">
            
            {/* Left: Brand Logo in Deep Maroon */}
            <div className="flex items-center">
              <Link href="/" className="inline-block relative focus:outline-none">
                <div className="relative h-6 w-24 sm:h-7 sm:w-28">
                  <Image
                    src="/images/gutglow-logo-maroon.png"
                    alt="GutGlow"
                    fill
                    sizes="112px"
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Center: Black Shop Now CTA */}
            <div>
              <Link
                href="/product"
                className="inline-flex items-center justify-center bg-[#171717] text-[#FFFFFF] px-3.5 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors shadow-xs"
              >
                Shop Now
              </Link>
            </div>

            {/* Right: Account + Cart + Hamburger Toggle */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Account Link on Mobile */}
              <Link
                href="/account"
                aria-label="My Account"
                className={`p-1.5 sm:p-2 text-[#171717] hover:bg-[#EADBCA] transition-colors rounded-full focus:outline-none ${
                  pathname === "/account" ? "text-[#54232F]" : ""
                }`}
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
              </Link>

              {/* Cart Button on Mobile */}
              <button
                type="button"
                onClick={openCartDrawer}
                aria-label={`Shopping bag with ${totalItems} items`}
                className="relative p-1.5 sm:p-2 text-[#171717] hover:bg-[#EADBCA] transition-colors rounded-full focus:outline-none"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex items-center justify-center min-w-[14px] h-[14px] sm:min-w-[15px] sm:h-[15px] px-1 text-[8px] font-bold text-[#FFFFFF] bg-[#54232F] rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-dropdown"
                className="p-1.5 sm:p-2 text-[#171717] hover:bg-[#EADBCA] transition-colors rounded-full focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 stroke-[2]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[2]" />
                )}
              </button>
            </div>
          </header>

          {/* MOBILE EXPANDED NAVIGATION MENU DROPDOWN (Warm Ivory Theme) */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                id="mobile-navigation-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full mt-2.5 max-h-[calc(100dvh-84px)] overflow-y-auto overscroll-contain bg-[#F4EBDD] border border-[#E5DAC8] rounded-[24px] p-3 sm:p-4 shadow-[0_16px_36px_rgba(40,30,20,0.12)] backdrop-blur-md md:hidden"
                style={{
                  WebkitOverflowScrolling: "touch",
                  overscrollBehavior: "contain",
                }}
              >
                {/* Navigation Links */}
                <div className="space-y-1.5">
                  {mobileNavLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-5 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
                          isActive
                            ? "bg-[#E5D8C5] text-[#54232F]"
                            : "text-[#171717]/80 hover:text-[#171717] hover:bg-[#EADBCA]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Bottom Prominent Shop GutGlow CTA */}
                <div className="pt-3 mt-3 border-t border-[#E5DAC8]">
                  <Link
                    href="/product"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#171717] text-[#FFFFFF] py-3.5 px-6 rounded-full text-xs uppercase tracking-wider font-bold hover:bg-[#333333] transition-colors shadow-sm text-center"
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
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden="true"
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 md:hidden touch-none"
          />
        )}
      </AnimatePresence>
    </>
  );
}
