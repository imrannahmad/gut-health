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
  { href: "/about", label: "Our Story" },
  { href: "/philosophy", label: "The Science" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 bg-[#FFFFFF] border-b border-[#E8E8E8] ${
        isScrolled ? "py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]" : "py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Mobile hamburger menu */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 -ml-1 text-[#111111] hover:text-[#333333] transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[1.75]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[1.75]" />
              )}
            </button>
          </div>

          {/* Left: GutGlow Wordmark Logo */}
          <div className="flex items-center">
            <Link href="/" className="inline-block relative focus:outline-none">
              <div className="relative h-8 w-28 sm:h-9 sm:w-36">
                <Image
                  src="/images/gutglow-logo.png"
                  alt="GutGlow"
                  fill
                  sizes="(max-width: 640px) 112px, 144px"
                  className="object-contain object-left brightness-0"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Center: Clean Minimal Navigation */}
          <nav className="hidden md:flex items-center space-x-9">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.14em] font-medium transition-colors duration-150 ${
                    isActive
                      ? "text-[#111111] font-semibold"
                      : "text-[#777777] hover:text-[#111111]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Cart Icon & Shop Now Button */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Shopping bag with ${totalItems} items`}
              className="relative p-2 text-[#111111] hover:text-[#333333] transition-colors focus:outline-none"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 -mt-1 -mr-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-semibold text-[#FFFFFF] bg-[#111111] rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              href="/product"
              className="inline-flex items-center justify-center text-[11px] uppercase tracking-[0.16em] font-medium bg-[#111111] text-[#FFFFFF] px-5 py-2.5 rounded-full hover:bg-[#333333] transition-colors shadow-none"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[#E8E8E8] bg-[#FFFFFF] overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4">
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm tracking-wide py-2 border-b border-[#E8E8E8] flex items-center justify-between ${
                        isActive
                          ? "text-[#111111] font-semibold"
                          : "text-[#777777] hover:text-[#111111]"
                      }`}
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#777777]" />
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2">
                <Link
                  href="/product"
                  className="w-full flex items-center justify-center text-center text-xs uppercase tracking-[0.16em] font-medium bg-[#111111] text-[#FFFFFF] py-3 rounded-full hover:bg-[#333333] transition-colors"
                >
                  Shop GutGlow
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
