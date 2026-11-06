"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/philosophy", label: "The Science" },
  { href: "/about", label: "Our Story" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#F8F6EF]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(23,61,50,0.04)] border-b border-[#E6E1D3]/70 py-3"
          : "bg-[#F8F6EF] border-b border-[#E6E1D3] py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#252923] hover:text-[#173D32] transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[1.5]" />
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start">
            <Link
              href="/"
              className="inline-block relative py-1 focus:outline-none group"
            >
              <div className="relative h-10 w-36 sm:h-12 sm:w-44 transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/images/gutglow-logo.png"
                  alt="GutGlow - Wellness From Within"
                  fill
                  sizes="(max-width: 640px) 144px, 176px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors duration-200 relative py-1 ${
                    isActive
                      ? "text-[#173D32] font-semibold"
                      : "text-[#252923]/80 hover:text-[#173D32]"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#173D32] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs & Cart */}
          <div className="flex items-center space-x-4">
            <Link
              href="/product"
              className="hidden sm:inline-flex items-center justify-center text-xs uppercase tracking-[0.16em] font-medium bg-[#173D32] text-[#F8F6EF] px-5 py-2.5 rounded-full hover:bg-[#122e26] transition-all duration-200 shadow-sm hover:shadow"
            >
              Shop Now
            </Link>

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Shopping cart with ${totalItems} items`}
              className="relative p-2 text-[#252923] hover:text-[#173D32] transition-colors focus:outline-none"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 -mt-1 -mr-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-[#F8F6EF] bg-[#173D32] rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden border-t border-[#E6E1D3] bg-[#F8F6EF] overflow-hidden"
          >
            <div className="px-6 pt-5 pb-8 space-y-4">
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg font-serif tracking-wide py-2 border-b border-[#E6E1D3]/50 flex items-center justify-between ${
                        isActive
                          ? "text-[#173D32] font-semibold"
                          : "text-[#252923] hover:text-[#173D32]"
                      }`}
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-[#A9B9A0]" />
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4">
                <Link
                  href="/product"
                  className="w-full flex items-center justify-center text-center text-xs uppercase tracking-[0.18em] font-medium bg-[#173D32] text-[#F8F6EF] py-3.5 rounded-full hover:bg-[#122e26] transition-colors shadow-sm"
                >
                  Shop Flagship Formula
                </Link>
              </div>

              <div className="pt-2 text-center">
                <p className="text-xs text-[#575D52] tracking-wider uppercase font-medium">
                  Wellness From Within
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
