"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    subtotal,
    totalItems,
  } = useCart();

  // Disable background scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-[#F8F6EF] shadow-2xl flex flex-col border-l border-[#E6E1D3]"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-[#E6E1D3] flex items-center justify-between bg-[#F8F6EF]">
                <div>
                  <h3 className="text-lg font-serif font-medium text-[#173D32]">
                    Your Wellness Bag
                  </h3>
                  <p className="text-xs text-[#575D52] mt-0.5">
                    {totalItems} {totalItems === 1 ? "item" : "items"} selected
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 -mr-2 text-[#575D52] hover:text-[#173D32] transition-colors rounded-full hover:bg-[#EEEBDD]"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-[#E6E1D3]">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#EEEBDD] flex items-center justify-center text-[#173D32] mb-4">
                      <Image
                        src="/images/gutglow-logo.png"
                        alt="GutGlow"
                        width={60}
                        height={20}
                        className="opacity-70"
                      />
                    </div>
                    <h4 className="text-base font-serif font-medium text-[#252923]">
                      Your bag is empty
                    </h4>
                    <p className="text-xs text-[#575D52] max-w-xs mt-1 mb-6">
                      Discover our single flagship formula developed for daily digestive harmony.
                    </p>
                    <Link
                      href="/product"
                      onClick={closeDrawer}
                      className="text-xs uppercase tracking-[0.16em] font-medium bg-[#173D32] text-[#F8F6EF] px-6 py-3 rounded-full hover:bg-[#122e26] transition-colors"
                    >
                      Discover GutGlow Formula
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.packOption.id} className="pt-4 first:pt-0 flex gap-4">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-24 bg-[#EEEBDD] rounded-lg overflow-hidden shrink-0 border border-[#E6E1D3]">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-medium text-[#173D32] leading-snug">
                                {item.productName}
                              </h4>
                              <button
                                onClick={() => removeItem(item.packOption.id)}
                                className="text-[#575D52] hover:text-[#c0392b] p-1 transition-colors"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4 stroke-[1.5]" />
                              </button>
                            </div>
                            <p className="text-xs font-serif text-[#B99A63] mt-0.5">
                              {item.packOption.name} · {item.packOption.servings} Servings
                            </p>
                            <p className="text-[11px] text-[#575D52] mt-0.5">
                              {item.packOption.subtitle}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-[#E6E1D3] rounded-full bg-[#EEEBDD]/60 px-2 py-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.packOption.id,
                                    item.quantity - 1
                                  )
                                }
                                className="p-1 text-[#575D52] hover:text-[#173D32]"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-medium text-[#252923] min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.packOption.id,
                                    item.quantity + 1
                                  )
                                }
                                className="p-1 text-[#575D52] hover:text-[#173D32]"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <span className="text-sm font-medium text-[#173D32]">
                                {formatPrice(item.packOption.price * item.quantity)}
                              </span>
                              {item.packOption.compareAtPrice && (
                                <span className="block text-[11px] text-[#575D52] line-through">
                                  {formatPrice(
                                    item.packOption.compareAtPrice * item.quantity
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {items.length > 0 && (
                <div className="p-6 bg-[#EEEBDD]/70 border-t border-[#E6E1D3] space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#575D52]">
                    <span>Shipping</span>
                    <span className="text-[#173D32] font-medium uppercase tracking-wider text-[11px]">
                      Complimentary (₹0)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-base">
                    <span className="font-serif font-medium text-[#173D32]">Subtotal</span>
                    <span className="font-medium text-[#173D32]">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Link
                      href="/checkout"
                      onClick={closeDrawer}
                      className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] font-medium bg-[#173D32] text-[#F8F6EF] py-3.5 rounded-full hover:bg-[#122e26] transition-all shadow-sm"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/cart"
                      onClick={closeDrawer}
                      className="w-full block text-center text-xs tracking-wider uppercase font-medium text-[#575D52] hover:text-[#173D32] py-2 transition-colors"
                    >
                      View Cart & Order Details
                    </Link>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#575D52] pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7D9273]" />
                    <span>Safe & Secure Checkout · ISO Certified Facility</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
