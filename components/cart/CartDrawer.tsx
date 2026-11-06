"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
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
            transition={{ duration: 0.15 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="w-screen max-w-md bg-[#FFFFFF] shadow-2xl flex flex-col border-l border-[#E8E8E8]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111111]">
                    Your Bag
                  </h3>
                  <p className="text-[11px] text-[#777777]">
                    {totalItems} {totalItems === 1 ? "item" : "items"} selected
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 text-[#777777] hover:text-[#111111] transition-colors rounded-full"
                  aria-label="Close bag"
                >
                  <X className="w-5 h-5 stroke-[1.75]" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-[#E8E8E8]">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <p className="text-sm font-semibold text-[#111111]">
                      Your bag is empty
                    </p>
                    <p className="text-xs text-[#777777] max-w-xs mt-1 mb-6">
                      Discover our daily formula developed for digestive harmony.
                    </p>
                    <Link
                      href="/product"
                      onClick={closeDrawer}
                      className="text-xs uppercase tracking-[0.14em] font-medium bg-[#111111] text-[#FFFFFF] px-6 py-3 rounded-full hover:bg-[#333333] transition-colors"
                    >
                      Shop Flagship Formula
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.packOption.id} className="pt-4 first:pt-0 flex gap-4">
                        <div className="relative w-20 h-24 bg-[#F7F7F7] rounded-xl overflow-hidden shrink-0 border border-[#E8E8E8]">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            sizes="80px"
                            className="object-cover grayscale contrast-125"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-[#111111] leading-snug">
                                {item.productName}
                              </h4>
                              <button
                                onClick={() => removeItem(item.packOption.id)}
                                className="text-[#777777] hover:text-[#111111] p-1"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-[#777777] mt-0.5">
                              {item.packOption.name} · {item.packOption.servings} Servings
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2">
                            <div className="flex items-center border border-[#E8E8E8] rounded-full bg-[#F7F7F7] px-2 py-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.packOption.id,
                                    item.quantity - 1
                                  )
                                }
                                className="p-1 text-[#777777] hover:text-[#111111]"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-semibold text-[#111111] min-w-[20px] text-center">
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
                                className="p-1 text-[#777777] hover:text-[#111111]"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-bold text-[#111111]">
                              {formatPrice(item.packOption.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {items.length > 0 && (
                <div className="p-6 bg-[#F7F7F7] border-t border-[#E8E8E8] space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#777777]">
                    <span>Shipping</span>
                    <span className="text-[#111111] font-semibold uppercase text-[10px] tracking-wider">
                      Complimentary (₹0)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-base">
                    <span className="font-semibold text-[#111111]">Subtotal</span>
                    <span className="font-bold text-[#111111]">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Link
                      href="/checkout"
                      onClick={closeDrawer}
                      className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] font-medium bg-[#111111] text-[#FFFFFF] py-3.5 rounded-full hover:bg-[#333333] transition-colors"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/cart"
                      onClick={closeDrawer}
                      className="w-full block text-center text-xs tracking-wider uppercase font-semibold text-[#777777] hover:text-[#111111] py-1.5 transition-colors"
                    >
                      View Cart
                    </Link>
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
